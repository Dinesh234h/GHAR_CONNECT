// types/user.types.ts
import { Timestamp } from 'firebase-admin/firestore';

export interface UserProfile {
  uid: string;
  phone: string;
  display_name: string;
  email?: string;
  roles: UserRole[];
  home_location?: GeoPoint;
  preferences: UserPreferences;
  cancellation_count: number;
  fcm_token?: string;
  region_code: string;         // e.g. 'KA', 'MH' — for festival filtering
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserPreferences {
  dietary: DietaryType[];       // 'veg' | 'non_veg' | 'vegan' | 'jain'
  cuisines: string[];           // ['south_indian', 'north_indian', 'street']
  spice_level: SpiceLevel;
  max_price_inr: number;
}

export type UserRole = 'user' | 'cook' | 'admin';
export type DietaryType = 'veg' | 'non_veg' | 'vegan' | 'jain';
export type SpiceLevel = 'mild' | 'medium' | 'spicy';
