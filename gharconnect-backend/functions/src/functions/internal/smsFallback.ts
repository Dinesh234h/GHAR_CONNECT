// functions/internal/smsFallback.ts
// POST /internal/sms-fallback — Cloud Tasks target endpoint.
// Fires T+60s after order creation if cook hasn't opened the FCM push.

import { Router, Request, Response } from 'express';
import { requireInternalSecret } from '../../middleware/internal.middleware';
import { handleError } from '../../utils/error.utils';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { sendOrderRequestSMS } from '../../services/sms.service';

export const smsFallbackRouter = Router();

smsFallbackRouter.post('/sms-fallback', requireInternalSecret, async (req: Request, res: Response) => {
  try {
    const { order_id, cook_phone } = req.body as {
      order_id: string;
      cook_phone: string;
      type: string;
    };

    // Guard: only send if still pending (cook may have already responded)
    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(order_id).get();
    if (!orderSnap.exists || orderSnap.data()?.['status'] !== 'pending') {
      res.json({ skipped: true, reason: 'Order no longer pending' });
      return;
    }

    const cookId = orderSnap.data()!['cook_id'] as string;

    await sendOrderRequestSMS(cook_phone, cookId, order_id);

    res.json({ status: 'sms_sent', order_id });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Pickup Reminder Internal Endpoint ───────────────────────────────────────
import { sendPickupReminderToUser } from '../../services/notification.service';
import { Order } from '../../types/order.types';
import { UserProfile } from '../../types/user.types';

export const pickupReminderRouter = Router();

pickupReminderRouter.post('/pickup-reminder', requireInternalSecret, async (req: Request, res: Response) => {
  try {
    const { order_id } = req.body as { order_id: string };

    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(order_id).get();
    if (!orderSnap.exists || orderSnap.data()?.['status'] !== 'accepted') {
      res.json({ skipped: true });
      return;
    }

    const order = orderSnap.data() as Order;
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(order.user_id).get();
    const user = userSnap.data() as UserProfile | undefined;

    if (user?.fcm_token) {
      await sendPickupReminderToUser(order.user_id, user.fcm_token, order);
    }

    res.json({ status: 'reminder_sent', order_id });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Rating Prompt Internal Endpoint ─────────────────────────────────────────
import { sendRatingPromptToUser } from '../../services/notification.service';

export const ratingPromptRouter = Router();

ratingPromptRouter.post('/rating-prompt', requireInternalSecret, async (req: Request, res: Response) => {
  try {
    const { order_id } = req.body as { order_id: string };

    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(order_id).get();
    if (!orderSnap.exists) { res.json({ skipped: true }); return; }

    const order = orderSnap.data() as Order;
    if (order.rated) { res.json({ skipped: true, reason: 'Already rated' }); return; }

    const userSnap = await db.collection(COLLECTIONS.USERS).doc(order.user_id).get();
    const user = userSnap.data() as UserProfile | undefined;

    if (user?.fcm_token) {
      await sendRatingPromptToUser(order.user_id, user.fcm_token, order);
    }

    res.json({ status: 'rating_prompt_sent', order_id });
  } catch (err) {
    handleError(err, res);
  }
});
