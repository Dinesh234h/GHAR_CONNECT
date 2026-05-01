// services/sms.service.ts
// Twilio SMS — fallback notifications when FCM push is not opened.

import twilio from 'twilio';
import { db, Timestamp } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';

function getClient(): ReturnType<typeof twilio> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('Twilio credentials not configured');
  return twilio(sid, token);
}

function fromNumber(): string {
  const num = process.env.TWILIO_FROM_NUMBER;
  if (!num) throw new Error('TWILIO_FROM_NUMBER not configured');
  return num;
}

// ─── Rate Limit Guard ─────────────────────────────────────────────────────────
async function checkSMSRateLimit(cookId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const snap = await db
    .collection(COLLECTIONS.SMS_LOG)
    .where('cook_id', '==', cookId)
    .where('sent_at', '>=', Timestamp.fromDate(oneHourAgo))
    .get();

  return snap.size < CONSTANTS.SMS_RATE_LIMIT_PER_HOUR;
}

async function logSMS(cookId: string, orderId: string, type: string): Promise<void> {
  await db.collection(COLLECTIONS.SMS_LOG).add({
    cook_id: cookId,
    order_id: orderId,
    type,
    sent_at: Timestamp.now(),
  });
}

// ─── Order Request SMS ────────────────────────────────────────────────────────
/**
 * Send SMS to cook if order still PENDING at T+60s (FCM fallback).
 * Called exclusively by the Cloud Tasks /internal/sms-fallback endpoint.
 */
export async function sendOrderRequestSMS(
  cookPhone: string,
  cookId: string,
  orderId: string
): Promise<void> {
  // Guard: only send if order still PENDING
  const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderSnap.exists || orderSnap.data()?.['status'] !== 'pending') {
    console.info(`[sms] Skipping SMS — order ${orderId} no longer pending`);
    return;
  }

  // Rate limit check
  const withinLimit = await checkSMSRateLimit(cookId);
  if (!withinLimit) {
    console.warn(`[sms] Rate limit exceeded for cook ${cookId}`);
    return;
  }

  try {
    const client = getClient();
    await client.messages.create({
      body: `GharConnect: New order request! Open the app to respond before it expires. Order: ${orderId.slice(0, 8)}`,
      from: fromNumber(),
      to: cookPhone,
    });
    await logSMS(cookId, orderId, 'ORDER_REQUEST');
    console.info(`[sms] Sent ORDER_REQUEST SMS to cook ${cookId}`);
  } catch (err) {
    console.error('[sms] Failed to send SMS:', err);
  }
}

// ─── OTP SMS (Firebase Auth fallback) ────────────────────────────────────────
export async function sendOTPSMS(userPhone: string, otp: string): Promise<void> {
  try {
    const client = getClient();
    await client.messages.create({
      body: `GharConnect: Your verification code is ${otp}. Valid for 10 minutes.`,
      from: fromNumber(),
      to: userPhone,
    });
  } catch (err) {
    console.error('[sms] Failed to send OTP SMS:', err);
    throw err; // re-throw — OTP failure is user-visible
  }
}

// ─── Order Confirmation SMS ───────────────────────────────────────────────────
export async function sendOrderConfirmedSMS(
  userPhone: string,
  mealName: string,
  slotDisplay: string
): Promise<void> {
  try {
    const client = getClient();
    await client.messages.create({
      body: `GharConnect: Your order for ${mealName} is confirmed! Pickup: ${slotDisplay}`,
      from: fromNumber(),
      to: userPhone,
    });
  } catch (err) {
    console.error('[sms] Failed to send order confirmed SMS:', err);
    // Don't re-throw — this is a backup notification, not critical
  }
}
