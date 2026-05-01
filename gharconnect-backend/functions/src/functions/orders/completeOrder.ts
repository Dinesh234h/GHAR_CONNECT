// functions/orders/completeOrder.ts
// POST /orders/:orderId/complete — mark order as completed.

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { handleError, AppError } from '../../utils/error.utils';
import { db, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { finaliseSlot } from '../../services/capacity.service';
import { recomputeTrustScore } from '../../services/trust.service';
import { deductCommission } from '../../services/payment.service';
import { scheduleRatingPrompt } from '../../services/cloudTasks.service';
import { Order } from '../../types/order.types';

export const completeOrderRouter = Router();

completeOrderRouter.post('/:orderId/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const callerId = req.uid;

    const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const order = orderSnap.data() as Order;

    // Only user or cook on this order can mark it complete
    if (order.user_id !== callerId && order.cook_id !== callerId) {
      throw new AppError('FORBIDDEN', 'You are not a party to this order.', 403);
    }

    if (order.status !== 'accepted') {
      throw new AppError('ORDER_NOT_ACCEPTED', `Order is ${order.status}, cannot complete.`, 409);
    }

    const completedAt = Timestamp.now();

    await orderRef.update({
      status: 'completed',
      completed_at: completedAt,
      communication_window_open: false,
    });

    // Run post-completion tasks in parallel
    const [commission] = await Promise.all([
      deductCommission(order.cook_id, order.price_inr),
      finaliseSlot(order.slot_id),
      recomputeTrustScore(order.cook_id),
      scheduleRatingPrompt(orderId, completedAt.toDate()),
    ]);

    // Update commission on order record
    await orderRef.update({ commission_deducted: commission });

    res.json({ status: 'completed', order_id: orderId });
  } catch (err) {
    handleError(err, res);
  }
});
