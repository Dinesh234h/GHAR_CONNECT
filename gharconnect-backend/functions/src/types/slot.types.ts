// types/slot.types.ts
import { Timestamp } from 'firebase-admin/firestore';

export interface TimeSlot {
  slot_id: string;
  cook_id: string;
  date: string;                  // 'YYYY-MM-DD'
  start_time: string;            // 'HH:MM' (24h IST)
  end_time: string;
  slot_display_time: string;     // '7:30 AM – 8:30 AM'
  max_capacity: number;
  confirmed_count: number;
  pending_count: number;         // pre-reserved, awaiting cook accept
  is_available: boolean;
  is_festival_slot: boolean;
  created_at: Timestamp;
}

export interface SlotSummary {
  slot_id: string;
  date: string;
  slot_display_time: string;
  available_capacity: number;
}

// Computed availability for a slot
export interface SlotAvailability {
  slot_id: string;
  available: boolean;
  available_capacity: number;
  reason?: 'slot_full' | 'cook_inactive' | 'slot_expired';
}
