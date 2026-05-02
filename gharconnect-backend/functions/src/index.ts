// functions/src/index.ts
// Main entry point — registers all Cloud Functions and Express routes.

import * as functions from 'firebase-functions';
import express = require('express');
import { Request, Response } from 'express';
import cors = require('cors');
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from ../.env (root of gharconnect-backend)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ─── Route imports ────────────────────────────────────────────────────────────
import { cooksRouter } from './functions/matching/getCooks';
import { otpRouter } from './functions/auth/otpRouter';
import { placeOrderRouter } from './functions/orders/placeOrder';
import { respondToOrderRouter } from './functions/orders/respondToOrder';
import { completeOrderRouter } from './functions/orders/completeOrder';
import { cancelOrderRouter } from './functions/orders/cancelOrder';
import { orderTimeoutRouter } from './functions/internal/orderTimeout';
import { smsFallbackRouter, pickupReminderRouter, ratingPromptRouter } from './functions/internal/smsFallback';
import { ratingsRouter } from './functions/ratings/submitRating';
import { onboardCookRouter } from './functions/cook/onboardCook';
import { updateAvailabilityRouter } from './functions/cook/updateAvailability';
import { cookDashboardRouter } from './functions/cook/getCookDashboard';
import { mealsRouter, slotsRouter } from './functions/meals/createMeal';
import { aiRouter } from './functions/ai/getDishSuggestions';
import { festivalsRouter } from './functions/festivals/festivalCron';
import { commsRouter } from './functions/comms/sendVoiceMessage';
import { agoraRouter } from './functions/agora/agoraRouter';
import { geocodeRouter } from './functions/geocode/geocodeRouter';

// ─── Public routes (Auth) ────────────────────────────────────────────────────
app.use('/auth', otpRouter);

// ─── Protected routes ─────────────────────────────────────────────────────────
app.use('/cooks', cooksRouter);
app.use('/orders', placeOrderRouter);
app.use('/orders', respondToOrderRouter);
app.use('/orders', completeOrderRouter);
app.use('/orders', cancelOrderRouter);
app.use('/ratings', ratingsRouter);
app.use('/cook', onboardCookRouter);
app.use('/cook', updateAvailabilityRouter);
app.use('/cook', cookDashboardRouter);
app.use('/meals', mealsRouter);
app.use('/slots', slotsRouter);
app.use('/ai', aiRouter);
app.use('/festivals', festivalsRouter);
app.use('/comms', commsRouter);
app.use('/agora', agoraRouter);
app.use('/api', geocodeRouter);

// ─── Internal routes (Cloud Tasks targets) ────────────────────────────────────
app.use('/internal', orderTimeoutRouter);
app.use('/internal', smsFallbackRouter);
app.use('/internal', pickupReminderRouter);
app.use('/internal', ratingPromptRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── Error catch-all ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => { res.status(404).json({ error: { code: 'NOT_FOUND' } }); });

// ─── Export HTTP function ─────────────────────────────────────────────────────
export const api = functions
  .region('asia-south1')
  .https.onRequest(app);

// ─── Auth trigger ─────────────────────────────────────────────────────────────
export { onUserCreate } from './functions/auth/onUserCreate';

// ─── Scheduled cron jobs ──────────────────────────────────────────────────────
export { festivalCron } from './functions/festivals/festivalCron';

// Midnight availability reset
export const midnightAvailabilityReset = functions.pubsub
  .schedule('30 18 * * *') // 18:30 UTC = Midnight IST
  .timeZone('UTC')
  .onRun(async () => {
    const { resetDailyAvailability } = await import('./services/availability.service');
    await resetDailyAvailability();
    console.info('[cron] midnightAvailabilityReset complete');
  });

// Rating lock cron — hourly
export const ratingLockCron = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const { db } = await import('./config/firebase');
    const { COLLECTIONS } = await import('./config/collections');
    const { CONSTANTS } = await import('./config/constants');
    const { Timestamp } = await import('./config/firebase');

    const lockBefore = new Date(Date.now() - CONSTANTS.RATING_LOCK_HOURS * 3600 * 1000);

    const unlocked = await db
      .collection(COLLECTIONS.RATINGS)
      .where('locked', '==', false)
      .where('created_at', '<=', Timestamp.fromDate(lockBefore))
      .get();

    const batch = db.batch();
    unlocked.docs.forEach((d) => batch.update(d.ref, { locked: true }));
    await batch.commit();

    console.info(`[cron] ratingLockCron: locked ${unlocked.size} ratings`);
  });

// Voice message cleanup — daily 2AM IST
export const voiceMessageCleanup = functions.pubsub
  .schedule('30 20 * * *') // 20:30 UTC = 2AM IST
  .timeZone('UTC')
  .onRun(async () => {
    const { deleteExpiredVoiceMessages } = await import('./services/storage.service');
    const deleted = await deleteExpiredVoiceMessages();
    console.info(`[cron] voiceMessageCleanup: deleted ${deleted} files`);
  });

// Capacity health check — every 15 minutes
export const capacityHealthCheck = functions.pubsub
  .schedule('*/15 * * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const { releaseOrphanedPendingSlots } = await import('./services/capacity.service');
    const released = await releaseOrphanedPendingSlots();
    console.info(`[cron] capacityHealthCheck: released ${released} orphaned slots`);
  });
