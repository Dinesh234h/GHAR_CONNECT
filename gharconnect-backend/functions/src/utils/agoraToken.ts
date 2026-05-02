// utils/agoraToken.ts
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

/**
 * generateRtcToken — Generates a secure Agora RTC token.
 * Production-ready implementation with configurable expiry.
 */
export function generateRtcToken(channelName: string, uid: number): string {
  const appId = process.env.AGORA_APP_ID;
  const appCert = process.env.AGORA_APP_CERTIFICATE;
  const expirySeconds = parseInt(process.env.AGORA_TOKEN_EXPIRY_SECONDS || '3600');

  if (!appId || !appCert) {
    throw new Error('AGORA_APP_ID or AGORA_APP_CERTIFICATE not set in environment.');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirySeconds;

  console.info(`[Agora] Generating token for channel: ${channelName}, uid: ${uid}, expiry: ${expirySeconds}s`);

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCert,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );
}
