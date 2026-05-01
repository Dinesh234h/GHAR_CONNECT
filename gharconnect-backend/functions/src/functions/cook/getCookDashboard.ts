// functions/cook/getCookDashboard.ts
// GET /cook/dashboard — aggregated stats and today's orders for the cook.

import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { handleError, AppError } from '../../utils/error.utils';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CookProfile } from '../../types/cook.types';

export const cookDashboardRouter = Router();

cookDashboardRouter.get('/dashboard', requireAuth, requireRole('cook'), async (req, res) => {
  try {
    const cookId = req.uid;
    const today = new Date().toISOString().split('T')[0];

    const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).get();
    if (!cookSnap.exists) throw new AppError('COOK_NOT_FOUND', 'Cook profile not found.', 404);

    const cook = cookSnap.data() as CookProfile;

    // Fetch today's orders
    const ordersSnap = await db
      .collection(COLLECTIONS.ORDERS)
      .where('cook_id', '==', cookId)
      .where('status', 'in', ['pending', 'accepted', 'completed'])
      .get();

    const allOrders = ordersSnap.docs.map((d) => d.data());
    const todayOrders = allOrders.filter((o) => {
      const created = (o['created_at'] as { toDate: () => Date }).toDate();
      return created.toISOString().split('T')[0] === today;
    });

    const confirmedToday = todayOrders.filter((o) => o['status'] === 'accepted');
    const pendingToday = todayOrders.filter((o) => o['status'] === 'pending');

    // Earnings today and this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const earningsToday = todayOrders
      .filter((o) => o['status'] === 'completed')
      .reduce((sum, o) => sum + ((o['price_inr'] as number) - (o['commission_deducted'] as number)), 0);

    const earningsThisWeek = allOrders
      .filter((o) => {
        const created = (o['created_at'] as { toDate: () => Date }).toDate();
        return o['status'] === 'completed' && created >= weekAgo;
      })
      .reduce((sum, o) => sum + ((o['price_inr'] as number) - (o['commission_deducted'] as number)), 0);

    // Active slots
    const slotsSnap = await db
      .collection(COLLECTIONS.TIME_SLOTS)
      .where('cook_id', '==', cookId)
      .where('date', '>=', today)
      .where('is_available', '==', true)
      .get();

    // Recent ratings
    const ratingsSnap = await db
      .collection(COLLECTIONS.RATINGS)
      .where('cook_id', '==', cookId)
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();

    // Festival suggestions
    const festivalsSnap = await db
      .collection(COLLECTIONS.FESTIVALS)
      .where('date', '>=', today)
      .limit(3)
      .get();

    const festivals = await Promise.all(
      festivalsSnap.docs.map(async (fd) => {
        const festival = fd.data();
        const { checkFestivalResponseExists } = await import('../../services/festival.service');
        const responded = await checkFestivalResponseExists(cookId, festival['festival_id'] as string);
        return {
          festival_name: festival['name'],
          date: festival['date'],
          suggested_dishes: festival['suggested_dishes'],
          capacity_boost: festival['capacity_boost'],
          has_responded: responded,
        };
      })
    );

    res.json({
      today_confirmed_orders: confirmedToday,
      today_pending_orders: pendingToday,
      active_slots: slotsSnap.docs.map((d) => d.data()),
      trust_score: cook.trust_score,
      rating_avg: cook.rating_avg,
      badge: cook.badge,
      earnings_today: earningsToday,
      earnings_this_week: earningsThisWeek,
      repeat_user_rate: cook.repeat_user_rate,
      pending_commission: cook.pending_commission,
      festival_suggestions: festivals,
      recent_ratings: ratingsSnap.docs.map((d) => d.data()),
    });
  } catch (err) {
    handleError(err, res);
  }
});
