// functions/orders/placeOrder.ts
// POST /orders/place — the most critical transaction in the system.
// Atomically reserves a slot and creates the order in a single Firestore transaction.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { reserveSlot } from '../../services/capacity.service';
import { sendOrderRequestToCook } from '../../services/notification.service';
import { scheduleOrderTimeout, scheduleSMSFallback } from '../../services/cloudTasks.service';
import { buildStaticMapUrl } from '../../services/geocoding.service';
import { Order } from '../../types/order.types';
import { CookProfile } from '../../types/cook.types';

const PlaceOrderSchema = z.object({
  slot_id: z.string().min(1),
  meal_id: z.string().min(1),
  customisation: z.string().max(300).optional(),
});

export const placeOrderRouter = Router();

placeOrderRouter.post('/place', requireAuth, validateBody(PlaceOrderSchema), async (req: Request, res: Response) => {
  try {
    const { slot_id, meal_id, customisation } = req.body as z.infer<typeof PlaceOrderSchema>;
    const userId = req.uid;

    // ── Fetch slot ────────────────────────────────────────────────────────────
    const slotSnap = await db.collection(COLLECTIONS.TIME_SLOTS).doc(slot_id).get();
    if (!slotSnap.exists) throw new AppError('SLOT_NOT_FOUND', 'Time slot not found.', 404);

    const slot = slotSnap.data()!;

    // Validate slot date not in the past
    const slotDate = new Date(slot['date'] as string);
    if (slotDate < new Date(new Date().toISOString().split('T')[0])) {
      throw new AppError('SLOT_EXPIRED', 'This slot date has passed.', 400);
    }

    // ── Fetch meal ────────────────────────────────────────────────────────────
    const mealSnap = await db.collection(COLLECTIONS.MEALS).doc(meal_id).get();
    if (!mealSnap.exists || !mealSnap.data()?.['is_active']) {
      throw new AppError('MEAL_NOT_FOUND', 'Meal not found or unavailable.', 404);
    }
    const meal = mealSnap.data()!;

    // Verify meal belongs to same cook as slot
    if (meal['cook_id'] !== slot['cook_id']) {
      throw new AppError('MEAL_SLOT_MISMATCH', 'Meal and slot do not belong to the same cook.', 400);
    }

    // ── Fetch cook ────────────────────────────────────────────────────────────
    const cookId = slot['cook_id'] as string;
    const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).get();
    if (!cookSnap.exists) throw new AppError('COOK_NOT_FOUND', 'Cook not found.', 404);

    const cook = cookSnap.data() as CookProfile;
    if (!cook.is_active || cook.availability_status !== 'active') {
      throw new AppError('COOK_UNAVAILABLE', 'This cook is currently unavailable.', 409);
    }

    // ── Atomic slot reservation ───────────────────────────────────────────────
    await reserveSlot(slot_id, uuid()); // will throw 409 if full

    // ── Create order document ─────────────────────────────────────────────────
    const orderId = uuid();
    const now = new Date();
    const ttlExpiresAt = new Date(now.getTime() + CONSTANTS.ORDER_TTL_SECONDS * 1000);
    const smsFiresAt = new Date(now.getTime() + CONSTANTS.SMS_FALLBACK_DELAY_SECONDS * 1000);

    const mapPreviewUrl = buildStaticMapUrl(
      cook.home_location.approx_lat,
      cook.home_location.approx_lng
    );

    const order: Order = {
      order_id: orderId,
      user_id: userId,
      cook_id: cookId,
      meal_id,
      slot_id,
      customisation,
      status: 'pending',
      created_at: Timestamp.fromDate(now),
      ttl_expires_at: Timestamp.fromDate(ttlExpiresAt),
      communication_window_open: false,
      rated: false,
      price_inr: meal['price_inr'] as number,
      commission_deducted: 0,
      meal_name: meal['name'] as string,
      slot_display_time: slot['slot_display_time'] as string,
      pickup_slot_start_time: `${slot['date']}T${slot['start_time']}:00+05:30`,
      map_preview_url: mapPreviewUrl,
    };

    await db.collection(COLLECTIONS.ORDERS).doc(orderId).set(order);

    // ── Schedule Cloud Tasks ──────────────────────────────────────────────────
    const [timeoutTaskName, smsTaskName] = await Promise.all([
      scheduleOrderTimeout(orderId, ttlExpiresAt),
      cook.fcm_token
        ? scheduleSMSFallback(orderId, req.phone ?? '', smsFiresAt)
        : Promise.resolve(''),
    ]);

    // Store task names for cancellation on cook response
    await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({
      timeout_task_name: timeoutTaskName,
      sms_task_name: smsTaskName,
    });

    // ── Notify cook via FCM ───────────────────────────────────────────────────
    if (cook.fcm_token) {
      await sendOrderRequestToCook(cookId, cook.fcm_token, order);
    }

    res.status(201).json({
      order_id: orderId,
      status: 'pending',
      ttl_expires_at: ttlExpiresAt.toISOString(),
      map_preview_url: mapPreviewUrl,
    });
  } catch (err) {
    handleError(err, res);
  }
});
