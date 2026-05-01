// services/capacity.service.ts
// Atomic Firestore transactions for slot reservation.
// These are the most critical operations — double-booking must be impossible.

import { db, FieldValue } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';
import { AppError } from '../utils/error.utils';

/**
 * STEP 1: Pre-reserve a slot when an order is placed.
 * Increments pending_count atomically. Fails if slot is full.
 * Must be called inside placeOrder — never outside a transaction context.
 */
export async function reserveSlot(slotId: string, orderId: string): Promise<void> {
  const slotRef = db.collection(COLLECTIONS.TIME_SLOTS).doc(slotId);

  await db.runTransaction(async (txn) => {
    const slotSnap = await txn.get(slotRef);
    if (!slotSnap.exists) {
      throw new AppError('SLOT_NOT_FOUND', 'Time slot does not exist.', 404);
    }

    const slot = slotSnap.data()!;

    if (!slot['is_available']) {
      throw new AppError('SLOT_UNAVAILABLE', 'This slot is no longer available.', 409);
    }

    const used = (slot['confirmed_count'] as number) + (slot['pending_count'] as number);
    if (used >= (slot['max_capacity'] as number)) {
      throw new AppError('ORDER_SLOT_FULL', 'This slot is fully booked.', 409);
    }

    txn.update(slotRef, {
      pending_count: FieldValue.increment(1),
    });
  });

  console.info(`[capacity] reserveSlot: slot=${slotId} order=${orderId}`);
}

/**
 * STEP 2A: Promote a pending reservation to confirmed on cook accept.
 */
export async function confirmSlot(slotId: string): Promise<void> {
  const slotRef = db.collection(COLLECTIONS.TIME_SLOTS).doc(slotId);

  await db.runTransaction(async (txn) => {
    const slotSnap = await txn.get(slotRef);
    if (!slotSnap.exists) throw new AppError('SLOT_NOT_FOUND', 'Slot not found.', 404);

    const slot = slotSnap.data()!;
    const confirmed = (slot['confirmed_count'] as number) + 1;
    const pending = Math.max(0, (slot['pending_count'] as number) - 1);
    const isFull = confirmed >= (slot['max_capacity'] as number);

    txn.update(slotRef, {
      confirmed_count: confirmed,
      pending_count: pending,
      is_available: !isFull,
    });
  });

  console.info(`[capacity] confirmSlot: slot=${slotId}`);
}

/**
 * STEP 2B: Release a pending reservation on rejection, timeout, or cancellation.
 */
export async function releaseSlot(slotId: string): Promise<void> {
  const slotRef = db.collection(COLLECTIONS.TIME_SLOTS).doc(slotId);

  await db.runTransaction(async (txn) => {
    const slotSnap = await txn.get(slotRef);
    if (!slotSnap.exists) return; // idempotent — slot may be deleted already

    const slot = slotSnap.data()!;
    const pending = Math.max(0, (slot['pending_count'] as number) - 1);

    txn.update(slotRef, {
      pending_count: pending,
      is_available: true,
    });
  });

  console.info(`[capacity] releaseSlot: slot=${slotId}`);
}

/**
 * STEP 3: Finalise slot after order completion.
 * confirmed_count stays — just recalculates is_available correctly.
 */
export async function finaliseSlot(slotId: string): Promise<void> {
  const slotRef = db.collection(COLLECTIONS.TIME_SLOTS).doc(slotId);
  const slotSnap = await slotRef.get();
  if (!slotSnap.exists) return;

  const slot = slotSnap.data()!;
  const used = (slot['confirmed_count'] as number) + (slot['pending_count'] as number);
  await slotRef.update({
    is_available: used < (slot['max_capacity'] as number),
  });

  console.info(`[capacity] finaliseSlot: slot=${slotId}`);
}

/**
 * Update has_available_slots on the cook profile after slot changes.
 * Called whenever slot availability changes.
 */
export async function refreshCookSlotFlag(cookId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const slots = await db
    .collection(COLLECTIONS.TIME_SLOTS)
    .where('cook_id', '==', cookId)
    .where('date', '>=', today)
    .where('is_available', '==', true)
    .limit(1)
    .get();

  const hasSlots = !slots.empty;
  await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).update({
    has_available_slots: hasSlots,
  });
}

/**
 * Health check: release any orphaned pending slots past TTL.
 * Called by the capacityHealthCheck cron every 15 minutes.
 */
export async function releaseOrphanedPendingSlots(): Promise<number> {
  const now = new Date();
  const staleOrders = await db
    .collection(COLLECTIONS.ORDERS)
    .where('status', '==', 'pending')
    .where('ttl_expires_at', '<=', now)
    .get();

  let released = 0;
  for (const orderDoc of staleOrders.docs) {
    const order = orderDoc.data();
    try {
      await releaseSlot(order['slot_id'] as string);
      await orderDoc.ref.update({ status: 'timeout' });
      released++;
    } catch (err) {
      console.error(`[capacity] Failed to release orphan slot for order ${orderDoc.id}:`, err);
    }
  }

  console.info(`[capacity] Released ${released} orphaned pending slots`);
  return released;
}

export { CONSTANTS };
