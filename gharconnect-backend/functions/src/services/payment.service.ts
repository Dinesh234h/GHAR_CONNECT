// services/payment.service.ts
// Platform commission and cook earnings logic.

import { db, FieldValue } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';

/**
 * Deduct platform commission from cook earnings.
 * Logs to Firestore and updates cook profiles.
 */
export async function deductCommission(
  cookId: string,
  orderAmount: number
): Promise<number> {
  const commission = Math.round(orderAmount * CONSTANTS.COMMISSION_RATE);

  await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).update({
    pending_commission: FieldValue.increment(commission),
    earnings_total: FieldValue.increment(orderAmount - commission),
  });

  console.info(
    `[payment] Cook ${cookId}: order ₹${orderAmount}, commission ₹${commission}, net ₹${orderAmount - commission}`
  );
  return commission;
}
