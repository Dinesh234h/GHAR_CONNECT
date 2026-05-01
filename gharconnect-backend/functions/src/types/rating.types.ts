// types/rating.types.ts
import { Timestamp } from 'firebase-admin/firestore';

export interface Rating {
  rating_id: string;
  order_id: string;
  user_id: string;
  cook_id: string;
  rating_overall: number;         // 1–5 integer
  sub_ratings?: SubRatings;
  tags?: RatingTag[];
  text?: string;
  locked: boolean;                // true after RATING_LOCK_HOURS
  edit_count: number;             // max RATING_MAX_EDITS
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SubRatings {
  taste: number;
  hygiene: number;
  packaging: number;
  value_for_money: number;
}

export type RatingTag =
  | 'authentic'
  | 'generous_portion'
  | 'on_time'
  | 'great_packaging'
  | 'repeat_worthy'
  | 'needs_improvement';
