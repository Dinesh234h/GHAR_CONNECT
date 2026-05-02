// functions/orders/getUserOrders.ts
// GET /orders/user — list all orders for the authenticated user
// GET /orders/:orderId — get a single order by ID

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { handleError, AppError } from '../../utils/error.utils';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { Order } from '../../types/order.types';
import { CookProfile } from '../../types/cook.types';

export const getUserOrdersRouter = Router();

// ─── GET /orders/user ─────────────────────────────────────────────────────────
getUserOrdersRouter.get('/user', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.uid;

    const ordersSnap = await db
      .collection(COLLECTIONS.ORDERS)
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(30)
      .get();

    const orders = await Promise.all(
      ordersSnap.docs.map(async (d) => {
        const order = d.data() as Order;
        // Enrich with cook info
        const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(order.cook_id).get();
        const cook = cookSnap.data() as CookProfile | undefined;
        return {
          ...order,
          cook_name: cook?.name ?? 'Unknown Cook',
          cook_neighbourhood: cook?.home_location?.neighbourhood ?? '',
        };
      })
    );

    res.json({ orders });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── GET /orders/:orderId ─────────────────────────────────────────────────────
getUserOrdersRouter.get('/:orderId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const callerId = req.uid;

    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
    if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const order = orderSnap.data() as Order;

    // Only parties to the order can view it
    if (order.user_id !== callerId && order.cook_id !== callerId) {
      throw new AppError('FORBIDDEN', 'You are not a party to this order.', 403);
    }

    // Enrich with cook info
    const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(order.cook_id).get();
    const cook = cookSnap.data() as CookProfile | undefined;

    res.json({
      ...order,
      cook_name: cook?.name ?? 'Unknown Cook',
      cook_neighbourhood: cook?.home_location?.neighbourhood ?? '',
    });
  } catch (err) {
    handleError(err, res);
  }
});
