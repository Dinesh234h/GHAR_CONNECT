// functions/matching/getCooks.ts
// GET /cooks/nearby — main discovery endpoint
// GET /cooks/:cookId — individual cook profile

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { handleError, AppError } from '../../utils/error.utils';
import { CookProfile } from '../../types/cook.types';

export const cooksRouter = Router();

// ─── GET /cooks/nearby ───────────────────────────────────────────────────────

cooksRouter.get('/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng required' });
    }

    // For now, return all active cooks (no complex geohash filtering yet for local dev)
    const cooksSnap = await db
      .collection(COLLECTIONS.COOK_PROFILES)
      .where('is_active', '==', true)
      .limit(20)
      .get();

    const cooks = cooksSnap.docs.map(doc => {
      const data = doc.data();
      const { home_location, ...safeProfile } = data;
      return {
        ...safeProfile,
        distance_km: 2.5, // Mock distance
        next_available_slot: "Today, 1:00 PM", // Mock next slot
        approx_location: {
          lat: home_location?.approx_lat,
          lng: home_location?.approx_lng,
          neighbourhood: home_location?.neighbourhood
        }
      };
    });

    return res.json({ cooks, total: cooks.length });

  } catch (err) {
    return res.status(500).json({ error: 'Internal error' });
  }
});

// ─── GET /cooks/:cookId ──────────────────────────────────────────────────────
cooksRouter.get('/:cookId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { cookId } = req.params;


    const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).get();
    if (!cookSnap.exists) throw new AppError('COOK_NOT_FOUND', 'Cook not found.', 404);

    const cook = cookSnap.data() as CookProfile;

    // Fetch active meals
    const mealsSnap = await db
      .collection(COLLECTIONS.MEALS)
      .where('cook_id', '==', cookId)
      .where('is_active', '==', true)
      .get();

    // Fetch future slots
    const today = new Date().toISOString().split('T')[0];
    const slotsSnap = await db
      .collection(COLLECTIONS.TIME_SLOTS)
      .where('cook_id', '==', cookId)
      .where('date', '>=', today)
      .where('is_available', '==', true)
      .get();

    // Fetch last 10 ratings
    const ratingsSnap = await db
      .collection(COLLECTIONS.RATINGS)
      .where('cook_id', '==', cookId)
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();


    // Never expose exact location
    const { home_location: hl, ...safeProfile } = cook;
    const safeLocation = {
      approx_lat: hl.approx_lat,
      approx_lng: hl.approx_lng,
      neighbourhood: hl.neighbourhood,
    };

    res.json({
      cook: { ...safeProfile, location: safeLocation },
      meals: mealsSnap.docs.map((d) => d.data()),
      slots: slotsSnap.docs.map((d) => d.data()),
      recent_ratings: ratingsSnap.docs.map((d) => d.data()),
    });
  } catch (err) {
    handleError(err, res);
  }
});
