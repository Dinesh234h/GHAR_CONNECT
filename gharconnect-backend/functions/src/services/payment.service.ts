// services/payment.service.ts
// Razorpay stub — MVP uses pay-at-pickup. Enable post-MVP.

import Razorpay from 'razorpay';
import { db, FieldValue } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';

function getRazorpay(): Razorpay {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ?? '',
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
  });
}

/**
 * STUB: Create a Razorpay order for UPI/card payment.
 * Not active in MVP — reserved for post-MVP integration.
 */
export async function createOrderPayment(
  amount: number,
  orderId: string
): Promise<{ id: string; amount: number }> {
  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: orderId,
  });
  return { id: order.id, amount: Number(order.amount) };
}

/**
 * Deduct platform commission from cook earnings.
 * MVP: logged to Firestore only. Post-MVP: trigger Razorpay transfer.
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
