// types/meal.types.ts
import { Timestamp } from 'firebase-admin/firestore';
import { DietaryType, SpiceLevel } from './user.types';

export interface Meal {
  meal_id: string;
  cook_id: string;
  name: string;
  description: string;
  price_inr: number;
  dietary_type: DietaryType;
  cuisine_tag: string;
  spice_level: SpiceLevel;
  ingredients: string[];
  allergens: string[];
  is_active: boolean;
  is_festival_special: boolean;
  festival_name?: string;
  image_url?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface MealSummary {
  meal_id: string;
  name: string;
  price_inr: number;
  dietary_type: DietaryType;
  cuisine_tag: string;
  is_festival_special: boolean;
}
