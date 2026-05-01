// functions/ratings/submitRating.ts
// POST /ratings — submit a new rating
// PUT /ratings/:ratingId — edit an existing rating

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, Timestamp, FieldValue } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { recomputeTrustScore, updateRatingAvg } from '../../services/trust.service';
import { Order } from '../../types/order.types';
import { Rating, RatingTag } from '../../types/rating.types';

const RatingSchema = z.object({
  order_id: z.string().min(1),
  rating_overall: z.number().int().min(CONSTANTS.RATING_MIN_OVERALL).max(CONSTANTS.RATING_MAX_OVERALL),
  sub_ratings: z.object({
    taste: z.number().min(1).max(5),
    hygiene: z.number().min(1).max(5),
    packaging: z.number().min(1).max(5),
    value_for_money: z.number().min(1).max(5),
  }).optional(),
  tags: z.array(z.string()).max(5).optional(),
  text: z.string().max(500).optional(),
});

const EditRatingSchema = z.object({
  rating_overall: z.number().int().min(1).max(5).optional(),
  sub_ratings: z.object({
    taste: z.number().min(1).max(5),
    hygiene: z.number().min(1).max(5),
    packaging: z.number().min(1).max(5),
    value_for_money: z.number().min(1).max(5),
  }).optional(),
  tags: z.array(z.string()).max(5).optional(),
  text: z.string().max(500).optional(),
});

export const ratingsRouter = Router();

// ─── POST /ratings ────────────────────────────────────────────────────────────
ratingsRouter.post('/', requireAuth, validateBody(RatingSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.uid;
    const { order_id, rating_overall, sub_ratings, tags, text } =
      req.body as z.infer<typeof RatingSchema>;

    // Fetch and validate order
    const orderRef = db.collection(COLLECTIONS.ORDERS).doc(order_id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const order = orderSnap.data() as Order;
    if (order.user_id !== userId) throw new AppError('FORBIDDEN', 'Not your order.', 403);
    if (order.status !== 'completed') throw new AppError('ORDER_NOT_COMPLETED', 'Can only rate completed orders.', 400);
    if (order.rated) throw new AppError('ALREADY_RATED', 'You have already rated this order.', 409);

    // 24h window check
    const lockDeadline = new Date(
      order.completed_at!.toDate().getTime() + CONSTANTS.RATING_LOCK_HOURS * 3600 * 1000
    );
    if (new Date() > lockDeadline) {
      throw new AppError('RATING_WINDOW_CLOSED', 'Rating window has closed (24h).', 400);
    }

    const ratingId = uuid();
    const rating: Rating = {
      rating_id: ratingId,
      order_id,
      user_id: userId,
      cook_id: order.cook_id,
      rating_overall,
      sub_ratings,
      tags: tags as RatingTag[] | undefined,
      text,
      locked: false,
      edit_count: 0,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    await db.collection(COLLECTIONS.RATINGS).doc(ratingId).set(rating);
    await orderRef.update({ rated: true });

    // Update cook trust and rating avg in parallel
    await Promise.all([
      updateRatingAvg(order.cook_id, rating_overall),
      recomputeTrustScore(order.cook_id),
    ]);

    res.status(201).json({ rating_id: ratingId, message: 'Rating submitted successfully.' });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── PUT /ratings/:ratingId ───────────────────────────────────────────────────
ratingsRouter.put('/:ratingId', requireAuth, validateBody(EditRatingSchema), async (req: Request, res: Response) => {
  try {
    const { ratingId } = req.params;
    const userId = req.uid;

    const ratingRef = db.collection(COLLECTIONS.RATINGS).doc(ratingId);
    const ratingSnap = await ratingRef.get();
    if (!ratingSnap.exists) throw new AppError('RATING_NOT_FOUND', 'Rating not found.', 404);

    const rating = ratingSnap.data() as Rating;
    if (rating.user_id !== userId) throw new AppError('FORBIDDEN', 'Not your rating.', 403);
    if (rating.locked) throw new AppError('RATING_LOCKED', 'This rating is locked and cannot be edited.', 400);
    if (rating.edit_count >= CONSTANTS.RATING_MAX_EDITS) {
      throw new AppError('EDIT_LIMIT', `Maximum ${CONSTANTS.RATING_MAX_EDITS} edit(s) allowed.`, 400);
    }

    const updates = req.body as z.infer<typeof EditRatingSchema>;

    await ratingRef.update({
      ...updates,
      edit_count: FieldValue.increment(1),
      updated_at: Timestamp.now(),
    });

    await Promise.all([
      updates.rating_overall ? updateRatingAvg(rating.cook_id, updates.rating_overall) : Promise.resolve(),
      recomputeTrustScore(rating.cook_id),
    ]);

    res.json({ rating_id: ratingId, message: 'Rating updated.' });
  } catch (err) {
    handleError(err, res);
  }
});
