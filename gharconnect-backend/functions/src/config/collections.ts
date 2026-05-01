// config/collections.ts
// Single source of truth for all Firestore collection names.
// Prevents typos from scattering collection name literals across the codebase.

export const COLLECTIONS = {
  USERS: 'users',
  COOK_PROFILES: 'cook_profiles',
  MEALS: 'meals',
  TIME_SLOTS: 'time_slots',
  ORDERS: 'orders',
  RATINGS: 'ratings',
  FESTIVALS: 'festivals',
  COOK_FESTIVAL_RESPONSES: 'cook_festival_responses',
  VOICE_MESSAGES: 'voice_messages',
  NOTIFICATION_LOG: 'notification_log',
  SMS_LOG: 'sms_log',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
