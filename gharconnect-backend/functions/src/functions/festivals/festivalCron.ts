// functions/festivals/festivalCron.ts — daily 8AM IST cron
// functions/festivals/respondToFestival.ts — POST /festivals/:festivalId/respond

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { v4 as uuid } from 'uuid';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import {
  fetchFestivalDatesFromAPI,
  FESTIVAL_DISH_MAP,
  upsertFestival,
  checkFestivalResponseExists,
  getActiveCooksByRegion,
  getUsersByRegion,
  daysBetween,
} from '../../services/festival.service';
import {
  sendFestivalAlertToCook,
  sendFestivalAlertToUser,
} from '../../services/notification.service';
import { refreshCookSlotFlag } from '../../services/capacity.service';
import { TimeSlot } from '../../types/slot.types';
import { Meal } from '../../types/meal.types';

// ─── Festival Cron ────────────────────────────────────────────────────────────
export const festivalCron = functions.pubsub
  .schedule('0 2 * * *') // 2AM UTC = 7:30AM IST
  .timeZone('UTC')
  .onRun(async () => {
    console.info('[festivalCron] Starting...');

    const upcomingFestivals = await fetchFestivalDatesFromAPI();

    const relevant = upcomingFestivals.filter(
      (f) => daysBetween(new Date(), new Date(f.date)) <= CONSTANTS.FESTIVAL_NOTIFY_DAYS_AHEAD
    );

    console.info(`[festivalCron] ${relevant.length} festivals in next ${CONSTANTS.FESTIVAL_NOTIFY_DAYS_AHEAD} days`);

    for (const festival of relevant) {
      const data = FESTIVAL_DISH_MAP[festival.name];
      if (!data) continue;

      const festivalDoc = await upsertFestival(festival.name, festival.date);
      if (!festivalDoc) continue;

      const cooks = await getActiveCooksByRegion(data.regions);
      const users = await getUsersByRegion(data.regions);

      // Notify cooks
      for (const cook of cooks) {
        if (!cook.fcm_token) continue;
        const alreadyNotified = await checkFestivalResponseExists(cook.cook_id, festivalDoc.festival_id);
        if (alreadyNotified) continue;
        await sendFestivalAlertToCook(
          cook.cook_id,
          cook.fcm_token,
          festival.name,
          data.dishes[0] ?? '',
          festivalDoc.festival_id
        );
      }

      // Notify users
      for (const user of users) {
        if (!user.fcm_token) continue;
        await sendFestivalAlertToUser(
          user.uid,
          user.fcm_token,
          festival.name,
          cooks.length,
          festivalDoc.festival_id
        );
      }
    }

    console.info('[festivalCron] Complete');
  });

// ─── Respond to Festival ──────────────────────────────────────────────────────
const FestivalRespondSchema = z.object({
  accepted: z.boolean(),
  dish_name: z.string().min(2).max(80),
});

export const festivalsRouter = Router();

festivalsRouter.post(
  '/:festivalId/respond',
  requireAuth,
  requireRole('cook'),
  validateBody(FestivalRespondSchema),
  async (req: Request, res: Response) => {
    try {
      const { festivalId } = req.params;
      const { accepted, dish_name } = req.body as z.infer<typeof FestivalRespondSchema>;
      const cookId = req.uid;

      // Idempotency check
      const alreadyResponded = await checkFestivalResponseExists(cookId, festivalId);
      if (alreadyResponded) {
        throw new AppError('ALREADY_RESPONDED', 'You have already responded to this festival.', 409);
      }

      const festivalSnap = await db.collection(COLLECTIONS.FESTIVALS).doc(festivalId).get();
      if (!festivalSnap.exists) throw new AppError('FESTIVAL_NOT_FOUND', 'Festival not found.', 404);

      const festival = festivalSnap.data()!;
      let mealId: string | undefined;
      const slotIds: string[] = [];

      if (accepted) {
        // Create festival special meal
        mealId = uuid();
        const meal: Meal = {
          meal_id: mealId,
          cook_id: cookId,
          name: dish_name,
          description: `${festival['name']} special`,
          price_inr: 100,
          dietary_type: 'veg',
          cuisine_tag: 'festive',
          spice_level: 'medium',
          ingredients: [],
          allergens: [],
          is_active: true,
          is_festival_special: true,
          festival_name: festival['name'] as string,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        };
        await db.collection(COLLECTIONS.MEALS).doc(mealId).set(meal);

        // Create morning + evening slots for festival date
        const festivalDate = festival['date'] as string;
        const slotTimes = [
          { start: '08:00', end: '10:00', display: '8:00 AM – 10:00 AM' },
          { start: '18:00', end: '20:00', display: '6:00 PM – 8:00 PM' },
        ];

        for (const t of slotTimes) {
          const slotId = uuid();
          const slot: TimeSlot = {
            slot_id: slotId,
            cook_id: cookId,
            date: festivalDate,
            start_time: t.start,
            end_time: t.end,
            slot_display_time: t.display,
            max_capacity: CONSTANTS.FESTIVAL_CAPACITY_BOOST_DEFAULT + 5,
            confirmed_count: 0,
            pending_count: 0,
            is_available: true,
            is_festival_slot: true,
            created_at: Timestamp.now(),
          };
          await db.collection(COLLECTIONS.TIME_SLOTS).doc(slotId).set(slot);
          slotIds.push(slotId);
        }

        await refreshCookSlotFlag(cookId);
      }

      // Record response
      const responseId = uuid();
      await db.collection(COLLECTIONS.COOK_FESTIVAL_RESPONSES).doc(responseId).set({
        response_id: responseId,
        cook_id: cookId,
        festival_id: festivalId,
        festival_name: festival['name'],
        accepted,
        dish_name,
        meal_id: mealId ?? null,
        slot_ids: slotIds,
        created_at: Timestamp.now(),
      });

      res.status(201).json({
        meal_id: mealId,
        slot_ids: slotIds,
        message: accepted ? 'Festival special created!' : 'Response recorded.',
      });
    } catch (err) {
      handleError(err, res);
    }
  }
);

// ─── GET /festivals/upcoming ──────────────────────────────────────────────────
import { detectRegionFromIP, getClientIP } from '../../services/region.service';

festivalsRouter.get('/upcoming', requireAuth, async (req: Request, res: Response) => {
  try {
    const ip = getClientIP(req);
    const region = await detectRegionFromIP(ip);
    const today = new Date().toISOString().split('T')[0];
    const in7Days = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const snap = await db
      .collection(COLLECTIONS.FESTIVALS)
      .where('date', '>=', today)
      .where('date', '<=', in7Days)
      .get();

    const festivals = snap.docs
      .map((d) => d.data())
      .filter((f) => {
        const regions = f['regions'] as string[];
        return regions.includes('all') || regions.includes(region);
      });

    res.json({ festivals, region });
  } catch (err) {
    handleError(err, res);
  }
});
