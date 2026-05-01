// types/notification.types.ts

export type NotificationType =
  | 'ORDER_REQUEST'
  | 'ORDER_ACCEPTED'
  | 'ORDER_REJECTED'
  | 'ORDER_TIMEOUT'
  | 'PICKUP_REMINDER'
  | 'RATING_PROMPT'
  | 'FESTIVAL_COOK'
  | 'FESTIVAL_USER'
  | 'VOICE_MESSAGE'
  | 'COOK_PAUSED';

export interface NotificationLogEntry {
  log_id: string;
  recipient_uid: string;
  type: NotificationType;
  order_id?: string;
  festival_id?: string;
  sent_at: import('firebase-admin/firestore').Timestamp;
  channel: 'fcm' | 'sms';
  success: boolean;
}
