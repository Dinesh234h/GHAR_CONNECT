// types/festival.types.ts
import { Timestamp } from 'firebase-admin/firestore';

export interface Festival {
  festival_id: string;
  name: string;
  date: string;                  // 'YYYY-MM-DD'
  regions: string[];             // ['all'] or ['KA', 'MH']
  suggested_dishes: string[];
  capacity_boost: string;        // '+3 plates'
  notified_at?: Timestamp;
}

export interface FestivalDishData {
  dishes: string[];
  regions: string[];
  boost: string;
}

export interface CookFestivalResponse {
  response_id: string;
  cook_id: string;
  festival_id: string;
  festival_name: string;
  accepted: boolean;
  dish_name: string;
  meal_id?: string;
  slot_ids?: string[];
  created_at: Timestamp;
}

export interface FestivalSuggestion {
  festival_name: string;
  date: string;
  suggested_dishes: string[];
  capacity_boost: string;
  has_responded: boolean;
}
