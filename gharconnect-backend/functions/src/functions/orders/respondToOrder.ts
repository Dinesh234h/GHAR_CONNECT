// functions/orders/respondToOrder.ts
// POST /orders/:orderId/respond — cook accepts or rejects an order.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, FieldValue, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { confirmSlot, releaseSlot } from '../../services/capacity.service';
import { cancelTask, schedulePickupReminder } from '../../services/cloudTasks.service';
import {
  sendOrderAcceptedToUser,
  sendOrderRejectedToUser,
  sendCookPausedAlert,
} from '../../services/notification.service';
import { getAlternativeCooks } from '../../services/matching.service';
import { Order } from '../../types/order.types';
import { UserProfile } from '../../types/user.types';
import { CookProfile } from '../../types/cook.types';

const RespondSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export const respondToOrderRouter = Router();

respondToOrderRouter.post(
  '/:orderId/respond',
  requireAuth,
  requireRole('cook'),
  validateBody(RespondSchema),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { action } = req.body as z.infer<typeof RespondSchema>;
      const cookId = req.uid;

      // ── Fetch and validate order ────────────────────────────────────────────
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

      const order = orderSnap.data() as Order;

      if (order.cook_id !== cookId) {
        throw new AppError('FORBIDDEN', 'You are not the cook on this order.', 403);
      }

      if (order.status !== 'pending') {
        throw new AppError('ORDER_NOT_PENDING', `Order is already ${order.status}.`, 409);
      }

      // ── Cancel TTL Cloud Task ───────────────────────────────────────────────
      await Promise.all([
        order.timeout_task_name ? cancelTask(order.timeout_task_name) : Promise.resolve(),
        order.sms_task_name ? cancelTask(order.sms_task_name) : Promise.resolve(),
      ]);

      const respondedAt = Timestamp.now();
      const responseTimeSec = Math.floor(
        (respondedAt.toDate().getTime() - order.created_at.toDate().getTime()) / 1000
      );

      // ── Fetch user for notifications ────────────────────────────────────────
      const userSnap = await db.collection(COLLECTIONS.USERS).doc(order.user_id).get();
      const user = userSnap.data() as UserProfile | undefined;

      if (action === 'accept') {
        // ── ACCEPT ─────────────────────────────────────────────────────────
        await confirmSlot(order.slot_id);

        // Schedule pickup reminder
        const pickupTime = new Date(order.pickup_slot_start_time);
        let reminderTaskName = '';
        if (pickupTime > new Date()) {
          reminderTaskName = await schedulePickupReminder(orderId, pickupTime);
        }

        await orderRef.update({
          status: 'accepted',
          responded_at: respondedAt,
          communication_window_open: true,
          reminder_task_name: reminderTaskName,
        });

        // Update cook's response time average (incremental)
        await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).update({
          response_time_avg_sec: FieldValue.increment(responseTimeSec), // simplified — divide on read
          missed_requests_count: 0, // reset on successful response
        });

        if (user?.fcm_token) {
          await sendOrderAcceptedToUser(order.user_id, user.fcm_token, order);
        }

        res.json({ status: 'accepted', order_id: orderId });

      } else {
        // ── REJECT ─────────────────────────────────────────────────────────
        await releaseSlot(order.slot_id);

        await orderRef.update({
          status: 'rejected',
          responded_at: respondedAt,
        });

        const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).get();
        const cook = cookSnap.data() as CookProfile;

        // Increment missed count — auto-pause if threshold hit
        const newMissedCount = (cook.missed_requests_count ?? 0) + 1;
        const updatePayload: Record<string, unknown> = {
          missed_requests_count: newMissedCount,
        };

        if (newMissedCount >= CONSTANTS.COOK_PAUSE_AFTER_MISSED_REQUESTS) {
          updatePayload['availability_status'] = 'unavailable_today';
          updatePayload['has_available_slots'] = false;

          if (cook.fcm_token) {
            await sendCookPausedAlert(cookId, cook.fcm_token, newMissedCount);
          }
        }

        await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).update(updatePayload);

        // Find alternatives for user
        const preferences = user?.preferences ?? { dietary: [], cuisines: [], spice_level: 'medium' as const, max_price_inr: 150 };
        const cookProfile = await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).get();
        const cookData = cookProfile.data() as CookProfile;
        const alternatives = await getAlternativeCooks(
          cookData.home_location.lat,
          cookData.home_location.lng,
          cookId,
          preferences,
          user?.region_code ?? 'KA'
        );

        if (user?.fcm_token) {
          await sendOrderRejectedToUser(order.user_id, user.fcm_token, order);
        }

        res.json({
          status: 'rejected',
          order_id: orderId,
          alternatives: alternatives.slice(0, 3),
        });
      }
    } catch (err) {
      handleError(err, res);
    }
  }
);
