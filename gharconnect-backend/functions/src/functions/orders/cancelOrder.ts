// functions/orders/cancelOrder.ts
// POST /orders/:orderId/cancel — user cancels an order.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, FieldValue } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { releaseSlot } from '../../services/capacity.service';
import { cancelTask } from '../../services/cloudTasks.service';
import { Order } from '../../types/order.types';


const CancelSchema = z.object({
  reason: z.string().max(200).optional(),
});

export const cancelOrderRouter = Router();

cancelOrderRouter.post(
  '/:orderId/cancel',
  requireAuth,
  validateBody(CancelSchema),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body as z.infer<typeof CancelSchema>;
      const userId = req.uid;

      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

      const order = orderSnap.data() as Order;

      if (order.user_id !== userId) {
        throw new AppError('FORBIDDEN', 'Only the ordering user can cancel.', 403);
      }

      if (!['pending', 'accepted'].includes(order.status)) {
        throw new AppError('CANNOT_CANCEL', `Order in status ${order.status} cannot be cancelled.`, 409);
      }

      // Release slot and cancel tasks
      await releaseSlot(order.slot_id);

      if (order.status === 'pending') {
        await Promise.all([
          order.timeout_task_name ? cancelTask(order.timeout_task_name) : Promise.resolve(),
          order.sms_task_name ? cancelTask(order.sms_task_name) : Promise.resolve(),
        ]);
      }

      await orderRef.update({
        status: 'cancelled',
        cancellation_reason: reason ?? null,
        communication_window_open: false,
      });

      // Increment user's cancellation count
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        cancellation_count: FieldValue.increment(1),
      });

      res.json({ status: 'cancelled', order_id: orderId });
    } catch (err) {
      handleError(err, res);
    }
  }
);
