// services/agora.service.ts
// Agora RTC voice call token generation for in-app masked calling.

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';
import { AppError } from '../utils/error.utils';

/**
 * Generate an Agora RTC token for a user or cook to join the order channel.
 * The channel name is unique per order — no cross-order eavesdropping possible.
 */
export async function generateAgoraToken(
  orderId: string,
  callerId: string,
  role: 'user' | 'cook'
): Promise<{ token: string; channel: string; uid: number; app_id: string }> {
  const appId = process.env.AGORA_APP_ID;
  const appCert = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCert) {
    throw new AppError('AGORA_NOT_CONFIGURED', 'Agora credentials not set.', 500);
  }

  // Verify communication window is open for this order
  const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderSnap.exists) {
    throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);
  }

  const order = orderSnap.data()!;
  if (!order['communication_window_open']) {
    throw new AppError(
      'COMMS_WINDOW_CLOSED',
      'Voice calls are only available for accepted orders.',
      403
    );
  }

  // Verify caller is a party to this order
  if (order['user_id'] !== callerId && order['cook_id'] !== callerId) {
    throw new AppError('FORBIDDEN', 'You are not a party to this order.', 403);
  }

  const channelName = `order_${orderId}`;
  const uid = role === 'user' ? 1001 : 1002; // Fixed UIDs per role per channel
  const expiry = Math.floor(Date.now() / 1000) + CONSTANTS.AGORA_TOKEN_EXPIRY_SECONDS;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCert,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expiry
  );

  return { token, channel: channelName, uid, app_id: appId };
}
