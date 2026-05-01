// functions/internal/orderTimeout.ts
// POST /internal/order-timeout — Cloud Tasks target endpoint.
// Fires when cook doesn't respond within ORDER_TTL_SECONDS.

import { Router, Request, Response } from 'express';
import { requireInternalSecret } from '../../middleware/internal.middleware';
import { handleError } from '../../utils/error.utils';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { releaseSlot } from '../../services/capacity.service';
import { sendOrderTimeoutToUser, sendCookPausedAlert } from '../../services/notification.service';

import { Order } from '../../types/order.types';
import { UserProfile } from '../../types/user.types';
import { CookProfile } from '../../types/cook.types';

export const orderTimeoutRouter = Router();

orderTimeoutRouter.post('/order-timeout', requireInternalSecret, async (req: Request, res: Response) => {
  try {
    const { order_id } = req.body as { order_id: string; type: string };

    const orderRef = db.collection(COLLECTIONS.ORDERS).doc(order_id);
    const orderSnap = await orderRef.get();

    // Idempotent — if already handled, exit cleanly
    if (!orderSnap.exists || orderSnap.data()?.['status'] !== 'pending') {
      res.json({ skipped: true, reason: 'Order no longer pending' });
      return;
    }

    const order = orderSnap.data() as Order;

    await Promise.all([
      releaseSlot(order.slot_id),
      orderRef.update({ status: 'timeout', communication_window_open: false }),
    ]);

    // Increment cook missed count
    const cookRef = db.collection(COLLECTIONS.COOK_PROFILES).doc(order.cook_id);
    const cookSnap = await cookRef.get();
    const cook = cookSnap.data() as CookProfile;
    const newMissedCount = (cook?.missed_requests_count ?? 0) + 1;

    const cookUpdate: Record<string, unknown> = {
      missed_requests_count: newMissedCount,
    };

    if (newMissedCount >= CONSTANTS.COOK_PAUSE_AFTER_MISSED_REQUESTS) {
      cookUpdate['availability_status'] = 'unavailable_today';
      cookUpdate['has_available_slots'] = false;

      if (cook.fcm_token) {
        await sendCookPausedAlert(order.cook_id, cook.fcm_token, newMissedCount);
      }
    }

    await cookRef.update(cookUpdate);

    // Notify user with alternatives
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(order.user_id).get();
    const user = userSnap.data() as UserProfile | undefined;

    if (user?.fcm_token) {
      await sendOrderTimeoutToUser(order.user_id, user.fcm_token, order);
    }

    res.json({ status: 'timeout_processed', order_id });
  } catch (err) {
    handleError(err, res);
  }
});
