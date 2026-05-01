// services/notification.service.ts
// Firebase Cloud Messaging (FCM) push notifications.
// All sends are idempotent — check notification_log before every send.

import { messaging, db, Timestamp } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { NotificationType } from '../types/notification.types';
import { Order } from '../types/order.types';

// ─── Idempotency Guard ────────────────────────────────────────────────────────
async function alreadySent(
  recipientUid: string,
  type: NotificationType,
  contextId: string  // orderId or festivalId
): Promise<boolean> {
  const logId = `${contextId}_${type}_${recipientUid}`;
  const doc = await db.collection(COLLECTIONS.NOTIFICATION_LOG).doc(logId).get();
  return doc.exists;
}

async function logNotification(
  recipientUid: string,
  type: NotificationType,
  contextId: string,
  channel: 'fcm' | 'sms',
  success: boolean
): Promise<void> {
  const logId = `${contextId}_${type}_${recipientUid}`;
  await db.collection(COLLECTIONS.NOTIFICATION_LOG).doc(logId).set({
    log_id: logId,
    recipient_uid: recipientUid,
    type,
    sent_at: Timestamp.now(),
    channel,
    success,
  });
}

// ─── Send Helper ──────────────────────────────────────────────────────────────
async function sendFCM(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
  highPriority: boolean = false
): Promise<boolean> {
  try {
    await messaging.send({
      token,
      notification: { title, body },
      data,
      android: {
        priority: highPriority ? 'high' : 'normal',
        notification: { channelId: 'orders', sound: highPriority ? 'order_alert' : 'default' },
      },
      apns: {
        headers: { 'apns-priority': highPriority ? '10' : '5' },
        payload: { aps: { sound: highPriority ? 'order_alert.wav' : 'default', badge: 1 } },
      },
    });
    return true;
  } catch (err) {
    console.error('[FCM] Send failed:', err);
    return false;
  }
}

// ─── Order Notifications ─────────────────────────────────────────────────────

export async function sendOrderRequestToCook(
  cookUid: string,
  cookFCMToken: string,
  order: Order
): Promise<void> {
  if (await alreadySent(cookUid, 'ORDER_REQUEST', order.order_id)) return;

  const success = await sendFCM(
    cookFCMToken,
    '🍽 New Order Request',
    `${order.meal_name} · Pickup ${order.slot_display_time}`,
    { type: 'ORDER_REQUEST', order_id: order.order_id, meal_name: order.meal_name },
    true // high priority
  );

  await logNotification(cookUid, 'ORDER_REQUEST', order.order_id, 'fcm', success);
}

export async function sendOrderAcceptedToUser(
  userUid: string,
  userFCMToken: string,
  order: Order
): Promise<void> {
  if (await alreadySent(userUid, 'ORDER_ACCEPTED', order.order_id)) return;

  const success = await sendFCM(
    userFCMToken,
    '✅ Order Accepted!',
    `Your ${order.meal_name} is confirmed. Pickup: ${order.slot_display_time}`,
    { type: 'ORDER_ACCEPTED', order_id: order.order_id },
    false
  );

  await logNotification(userUid, 'ORDER_ACCEPTED', order.order_id, 'fcm', success);
}

export async function sendOrderRejectedToUser(
  userUid: string,
  userFCMToken: string,
  order: Order
): Promise<void> {
  if (await alreadySent(userUid, 'ORDER_REJECTED', order.order_id)) return;

  const success = await sendFCM(
    userFCMToken,
    '❌ Order Not Available',
    `Sorry, ${order.meal_name} is unavailable. Tap for alternatives.`,
    { type: 'ORDER_REJECTED', order_id: order.order_id },
    false
  );

  await logNotification(userUid, 'ORDER_REJECTED', order.order_id, 'fcm', success);
}

export async function sendOrderTimeoutToUser(
  userUid: string,
  userFCMToken: string,
  order: Order
): Promise<void> {
  if (await alreadySent(userUid, 'ORDER_TIMEOUT', order.order_id)) return;

  const success = await sendFCM(
    userFCMToken,
    '⏱ Order Timed Out',
    `The cook didn't respond in time. Tap to find alternatives.`,
    { type: 'ORDER_TIMEOUT', order_id: order.order_id },
    false
  );

  await logNotification(userUid, 'ORDER_TIMEOUT', order.order_id, 'fcm', success);
}

export async function sendPickupReminderToUser(
  userUid: string,
  userFCMToken: string,
  order: Order
): Promise<void> {
  if (await alreadySent(userUid, 'PICKUP_REMINDER', order.order_id)) return;

  const success = await sendFCM(
    userFCMToken,
    '🏃 Pickup Reminder',
    `Your ${order.meal_name} is ready in 15 mins! Head to the cook.`,
    { type: 'PICKUP_REMINDER', order_id: order.order_id },
    false
  );

  await logNotification(userUid, 'PICKUP_REMINDER', order.order_id, 'fcm', success);
}

export async function sendRatingPromptToUser(
  userUid: string,
  userFCMToken: string,
  order: Order
): Promise<void> {
  if (await alreadySent(userUid, 'RATING_PROMPT', order.order_id)) return;

  const success = await sendFCM(
    userFCMToken,
    '⭐ How was your meal?',
    `Rate your ${order.meal_name} from ${order.slot_display_time}`,
    { type: 'RATING_PROMPT', order_id: order.order_id },
    false
  );

  await logNotification(userUid, 'RATING_PROMPT', order.order_id, 'fcm', success);
}

export async function sendCookPausedAlert(
  cookUid: string,
  cookFCMToken: string,
  missedCount: number
): Promise<void> {
  const contextId = `cook_paused_${cookUid}_${new Date().toISOString().split('T')[0]}`;
  if (await alreadySent(cookUid, 'COOK_PAUSED', contextId)) return;

  const success = await sendFCM(
    cookFCMToken,
    '⚠️ Availability Paused',
    `You've missed ${missedCount} orders. Open the app to reactivate.`,
    { type: 'COOK_PAUSED', missed_count: String(missedCount) },
    true
  );

  await logNotification(cookUid, 'COOK_PAUSED', contextId, 'fcm', success);
}

export async function sendFestivalAlertToCook(
  cookUid: string,
  cookFCMToken: string,
  festivalName: string,
  dishName: string,
  festivalId: string
): Promise<void> {
  if (await alreadySent(cookUid, 'FESTIVAL_COOK', festivalId)) return;

  const success = await sendFCM(
    cookFCMToken,
    `🎉 ${festivalName} Special Opportunity`,
    `Offer ${dishName} for ${festivalName}! Tap to set up a special slot.`,
    { type: 'FESTIVAL_COOK', festival_id: festivalId, dish_name: dishName },
    false
  );

  await logNotification(cookUid, 'FESTIVAL_COOK', festivalId, 'fcm', success);
}

export async function sendFestivalAlertToUser(
  userUid: string,
  userFCMToken: string,
  festivalName: string,
  nearbyCount: number,
  festivalId: string
): Promise<void> {
  if (await alreadySent(userUid, 'FESTIVAL_USER', festivalId)) return;

  const success = await sendFCM(
    userFCMToken,
    `🎉 ${festivalName} Specials Near You!`,
    `${nearbyCount} home cooks are offering ${festivalName} specials. Order now!`,
    { type: 'FESTIVAL_USER', festival_id: festivalId },
    false
  );

  await logNotification(userUid, 'FESTIVAL_USER', festivalId, 'fcm', success);
}

export async function sendVoiceMessageReceived(
  recipientUid: string,
  recipientFCMToken: string,
  orderId: string,
  msgId: string
): Promise<void> {
  await sendFCM(
    recipientFCMToken,
    '🎙 New Voice Message',
    'You received a voice message from your order.',
    { type: 'VOICE_MESSAGE', order_id: orderId, msg_id: msgId },
    false
  );
}
