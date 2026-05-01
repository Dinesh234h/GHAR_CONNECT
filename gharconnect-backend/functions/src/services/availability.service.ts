// services/availability.service.ts
// Cook availability management — toggle modes and refresh slot flags.

import { db, FieldValue, Timestamp } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { AvailabilityStatus } from '../types/cook.types';
import { AppError } from '../utils/error.utils';
import { refreshCookSlotFlag } from './capacity.service';

interface AvailabilityUpdate {
  mode: AvailabilityStatus;
  from_date?: string;
  to_date?: string;
}

/**
 * Update a cook's availability mode.
 * Immediately reflects in matching queries via has_available_slots.
 */
export async function updateCookAvailability(
  cookId: string,
  update: AvailabilityUpdate
): Promise<void> {
  const cookRef = db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId);
  const cookSnap = await cookRef.get();
  if (!cookSnap.exists) throw new AppError('COOK_NOT_FOUND', 'Cook profile not found.', 404);

  const updatePayload: Record<string, unknown> = {
    availability_status: update.mode,
    updated_at: FieldValue.serverTimestamp(),
  };

  if (update.mode === 'custom_off' && update.to_date) {
    updatePayload['unavailable_until'] = Timestamp.fromDate(new Date(update.to_date));
  } else {
    updatePayload['unavailable_until'] = null;
  }

  // If going unavailable, disable all future slots
  if (update.mode !== 'active') {
    const today = new Date().toISOString().split('T')[0];
    const slots = await db
      .collection(COLLECTIONS.TIME_SLOTS)
      .where('cook_id', '==', cookId)
      .where('date', '>=', today)
      .get();

    const batch = db.batch();
    slots.docs.forEach((doc) => batch.update(doc.ref, { is_available: false }));
    await batch.commit();

    updatePayload['has_available_slots'] = false;
  } else {
    // Reactivating — recompute from actual slot data
    await cookRef.update(updatePayload);
    await refreshCookSlotFlag(cookId);
    return;
  }

  await cookRef.update(updatePayload);
}

/**
 * Midnight reset: switch unavailable_today → active.
 * Called by midnightAvailabilityReset cron.
 */
export async function resetDailyAvailability(): Promise<void> {
  const today = new Date();

  // unavailable_today → active
  const todayUnavailable = await db
    .collection(COLLECTIONS.COOK_PROFILES)
    .where('availability_status', '==', 'unavailable_today')
    .get();

  // custom_off expired → active
  const expiredCustom = await db
    .collection(COLLECTIONS.COOK_PROFILES)
    .where('availability_status', '==', 'custom_off')
    .where('unavailable_until', '<=', Timestamp.fromDate(today))
    .get();

  const batch = db.batch();

  todayUnavailable.docs.forEach((doc) => {
    batch.update(doc.ref, {
      availability_status: 'active' as AvailabilityStatus,
      updated_at: FieldValue.serverTimestamp(),
    });
  });

  expiredCustom.docs.forEach((doc) => {
    batch.update(doc.ref, {
      availability_status: 'active' as AvailabilityStatus,
      unavailable_until: null,
      updated_at: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.info(
    `[availability] Reset ${todayUnavailable.size + expiredCustom.size} cook availability records`
  );
}
