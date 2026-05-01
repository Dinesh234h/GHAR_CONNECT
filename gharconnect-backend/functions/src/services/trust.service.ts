// services/trust.service.ts
// Trust score computation — WRITE-PROTECTED, only callable server-side.
// Formula: 40% rating + 25% completion + 15% response time + 15% repeat + cancellation penalty

import { db, FieldValue } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';
import { CookBadge } from '../types/cook.types';

/**
 * Recompute trust score for a cook after any rating, order completion, or rejection.
 * Never call this from client-facing code — server-side only.
 */
export async function recomputeTrustScore(cookId: string): Promise<void> {
  const cookRef = db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId);
  const cookSnap = await cookRef.get();
  if (!cookSnap.exists) return;

  const cook = cookSnap.data()!;
  const totalOrders: number = cook['total_orders'] ?? 0;
  const completedOrders: number = cook['completed_orders'] ?? 0;
  const ratingAvg: number = cook['rating_avg'] ?? 3;
  const missedRequests: number = cook['missed_requests_count'] ?? 0;
  const repeatRate: number = cook['repeat_user_rate'] ?? 0;
  const responseTimeAvg: number = cook['response_time_avg_sec'] ?? 180;

  // Rating component (normalised 1–5 → 0–1)
  const ratingComponent = (ratingAvg - 1) / 4;

  // Completion rate
  const completionRate = totalOrders > 0 ? completedOrders / totalOrders : 0;

  // Response speed (180s = worst → 10s = best, normalised)
  const responseScore = Math.max(0, 1 - responseTimeAvg / CONSTANTS.ORDER_TTL_SECONDS);

  // Repeat customer rate already 0–1
  const repeatScore = Math.min(1, repeatRate);

  // Cancellation penalty
  const cancelPenalty =
    missedRequests > 0
      ? Math.min(0.5, missedRequests * CONSTANTS.TRUST_PENALTY_CANCELLATION)
      : 0;

  // Weighted composite (smoothed over first TRUST_SCORE_SMOOTHING_ORDERS orders)
  const smoothingWeight = Math.min(1, totalOrders / CONSTANTS.TRUST_SCORE_SMOOTHING_ORDERS);
  const rawScore =
    CONSTANTS.TRUST_WEIGHT_RATING * ratingComponent +
    CONSTANTS.TRUST_WEIGHT_COMPLETION * completionRate +
    CONSTANTS.TRUST_WEIGHT_RESPONSE * responseScore +
    CONSTANTS.TRUST_WEIGHT_REPEAT * repeatScore -
    cancelPenalty;

  const newScore = Math.round(
    CONSTANTS.TRUST_SCORE_BASELINE * (1 - smoothingWeight) +
    100 * rawScore * smoothingWeight
  );

  const clampedScore = Math.max(0, Math.min(100, newScore));
  const badge = computeBadge(clampedScore);

  await cookRef.update({
    trust_score: clampedScore,
    badge,
    updated_at: FieldValue.serverTimestamp(),
  });

  console.info(`[trust] Cook ${cookId}: score=${clampedScore}, badge=${badge}`);
}

/**
 * Update incremental rating average on the cook profile.
 * Called after every new rating submission.
 */
export async function updateRatingAvg(cookId: string, newRating: number): Promise<void> {
  const cookRef = db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId);

  await db.runTransaction(async (txn) => {
    const snap = await txn.get(cookRef);
    if (!snap.exists) return;
    const cook = snap.data()!;
    const count: number = cook['rating_count'] ?? 0;
    const avg: number = cook['rating_avg'] ?? 0;

    const newCount = count + 1;
    const newAvg = (avg * count + newRating) / newCount;

    txn.update(cookRef, {
      rating_avg: Number(newAvg.toFixed(2)),
      rating_count: newCount,
    });
  });
}

function computeBadge(score: number): CookBadge {
  if (score >= CONSTANTS.TRUST_BADGE_TOP_THRESHOLD) return 'top_cook';
  if (score >= CONSTANTS.TRUST_BADGE_TRUSTED_THRESHOLD) return 'trusted';
  return 'new';
}
