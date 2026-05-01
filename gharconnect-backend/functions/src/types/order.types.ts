// types/order.types.ts
import { Timestamp } from 'firebase-admin/firestore';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'timeout';

export interface Order {
  order_id: string;
  user_id: string;
  cook_id: string;
  meal_id: string;
  slot_id: string;
  customisation?: string;

  status: OrderStatus;

  // Timing
  created_at: Timestamp;
  ttl_expires_at: Timestamp;
  responded_at?: Timestamp;
  completed_at?: Timestamp;
  pickup_slot_start_time: string;  // ISO string for scheduling reminders

  // Task references (for Cloud Tasks cancellation)
  timeout_task_name?: string;
  sms_task_name?: string;
  reminder_task_name?: string;

  // Communication
  communication_window_open: boolean;

  // Post-completion
  rated: boolean;
  price_inr: number;
  commission_deducted: number;

  // Derived display
  meal_name: string;
  slot_display_time: string;
  map_preview_url?: string;
}

export interface OrderWithContext extends Order {
  cook_name: string;
  cook_neighbourhood: string;
}
