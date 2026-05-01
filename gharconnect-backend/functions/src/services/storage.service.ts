// services/storage.service.ts
// Firebase Storage operations for voice messages and cook kitchen images.

import { storage } from '../config/firebase';
import { CONSTANTS } from '../config/constants';
import { AppError } from '../utils/error.utils';

const VOICE_PREFIX = 'voice_messages';
const IMAGES_PREFIX = 'cook_images';

// ─── Voice Messages ───────────────────────────────────────────────────────────
/**
 * Upload a voice message audio file and return a signed URL valid for 48 hours.
 * Path: voice_messages/{orderId}/{msgId}.webm
 */
export async function uploadVoiceMessage(
  orderId: string,
  msgId: string,
  audioBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const bucket = storage.bucket();
  const filePath = `${VOICE_PREFIX}/${orderId}/${msgId}.webm`;
  const file = bucket.file(filePath);

  const expiresAt = new Date(
    Date.now() + CONSTANTS.VOICE_MESSAGE_EXPIRY_HOURS * 3600 * 1000
  );

  await file.save(audioBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        order_id: orderId,
        expires_at: expiresAt.toISOString(),
      },
    },
  });

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: expiresAt,
  });

  return signedUrl;
}

/**
 * Generate a fresh signed URL for an existing voice message.
 * Called in GET /comms/:orderId to refresh possibly-expired URLs.
 */
export async function getVoiceMessageUrl(
  orderId: string,
  msgId: string
): Promise<string> {
  const bucket = storage.bucket();
  const file = bucket.file(`${VOICE_PREFIX}/${orderId}/${msgId}.webm`);
  const [exists] = await file.exists();
  if (!exists) throw new AppError('VOICE_NOT_FOUND', 'Voice message not found.', 404);

  const expiry = new Date(Date.now() + CONSTANTS.VOICE_MESSAGE_EXPIRY_HOURS * 3600 * 1000);
  const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: expiry });
  return signedUrl;
}

// ─── Cook Kitchen Images ─────────────────────────────────────────────────────
/**
 * Upload a cook kitchen image and return a 1-year signed URL.
 * Path: cook_images/{cookId}/kitchen_{index}.jpg
 */
export async function uploadKitchenImage(
  cookId: string,
  imageBuffer: Buffer,
  mimeType: string,
  index: number
): Promise<string> {
  const bucket = storage.bucket();
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const filePath = `${IMAGES_PREFIX}/${cookId}/kitchen_${index}.${ext}`;
  const file = bucket.file(filePath);

  await file.save(imageBuffer, { metadata: { contentType: mimeType } });

  const expiry = new Date(Date.now() + 365 * 24 * 3600 * 1000);
  const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: expiry });
  return signedUrl;
}

// ─── Cleanup Expired Voice Messages (daily cron) ──────────────────────────────
export async function deleteExpiredVoiceMessages(): Promise<number> {
  const bucket = storage.bucket();
  const [files] = await bucket.getFiles({ prefix: `${VOICE_PREFIX}/` });
  const now = new Date();
  let deleted = 0;

  for (const file of files) {
    try {
      const [meta] = await file.getMetadata();
      const expiresAt = meta.metadata?.['expires_at'] as string | undefined;
      if (expiresAt && new Date(expiresAt) < now) {
        await file.delete();
        deleted++;
      }
    } catch (err) {
      console.error(`[storage] Failed to delete ${file.name}:`, err);
    }
  }

  console.info(`[storage] Deleted ${deleted} expired voice messages`);
  return deleted;
}
