// types/cook.types.ts
import { Timestamp } from 'firebase-admin/firestore';
import { DietaryType } from './user.types';

export type CookBadge = 'new' | 'trusted' | 'top_cook';
export type AvailabilityStatus = 'active' | 'unavailable_today' | 'custom_off';

export interface CookProfile {
  cook_id: string;               // same as uid
  name: string;
  bio: string;
  meal_types: DietaryType[];
  cuisine_tags: string[];

  home_location: CookLocation;

  kitchen_images: string[];      // Firebase Storage signed URLs

  // Trust & reputation
  trust_score: number;           // 0–100, WRITE-PROTECTED (server only)
  rating_avg: number;            // WRITE-PROTECTED (server only)
  rating_count: number;          // WRITE-PROTECTED (server only)
  badge: CookBadge;              // WRITE-PROTECTED (server only)

  // Availability
  is_active: boolean;
  is_verified: boolean;
  availability_status: AvailabilityStatus;
  has_available_slots: boolean;
  unavailable_until?: Timestamp;

  // Metrics (server-maintained)
  total_orders: number;
  completed_orders: number;
  missed_requests_count: number;
  repeat_user_rate: number;
  response_time_avg_sec: number;

  // Financials
  earnings_total: number;
  pending_commission: number;

  fcm_token?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CookLocation {
  lat: number;
  lng: number;
  geohash: string;
  approx_lat: number;            // snapped to ~100m grid (privacy)
  approx_lng: number;
  neighbourhood?: string;        // Reverse geocoded area name
}

export interface CookCardResult {
  cook_id: string;
  name: string;
  bio: string;
  rating_avg: number;
  rating_count: number;
  trust_score: number;
  badge: CookBadge;
  cuisine_tags: string[];
  meal_types: DietaryType[];
  distance_m: number;
  distance_text: string;
  walking_time: string;
  neighbourhood: string;
  kitchen_images: string[];
  has_festival_special: boolean;
  score: number;                 // composite recommendation score
  map_pin_color: string;
  meals: import('./meal.types').MealSummary[];
  slots: import('./slot.types').SlotSummary[];
}

export interface CookGeoPoint extends Pick<CookLocation, 'lat' | 'lng'> {}
