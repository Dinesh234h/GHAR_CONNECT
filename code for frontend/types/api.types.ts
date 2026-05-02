// types/api.types.ts — mirrors backend types for the frontend

export type DietaryType = "veg" | "non_veg" | "vegan" | "jain";
export type SpiceLevel = "mild" | "medium" | "spicy";
export type UserRole = "user" | "cook" | "admin";
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed" | "timeout";
export type CookBadge = "new" | "trusted" | "top_cook";

export interface UserPreferences {
  dietary: DietaryType[];
  cuisines: string[];
  spice_level: SpiceLevel;
  max_price_inr: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  phone: string;
  display_name: string;
  email?: string;
  roles: UserRole[];
  home_location?: GeoPoint;
  preferences: UserPreferences;
  cancellation_count: number;
  region_code: string;
}

export interface CookLocation {
  approx_lat: number;
  approx_lng: number;
  neighbourhood?: string;
}

export interface MealSummary {
  meal_id: string;
  name: string;
  price_inr: number;
  dietary_type: DietaryType;
  cuisine_tag: string;
  is_festival_special: boolean;
}

export interface SlotSummary {
  slot_id: string;
  cook_id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_display_time: string;
  max_capacity: number;
  confirmed_count: number;
  pending_count: number;
  is_available: boolean;
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
  score: number;
  meals: MealSummary[];
  slots: SlotSummary[];
}

export interface CookProfile {
  cook_id: string;
  name: string;
  bio: string;
  meal_types: DietaryType[];
  cuisine_tags: string[];
  location: CookLocation;
  kitchen_images: string[];
  trust_score: number;
  rating_avg: number;
  rating_count: number;
  badge: CookBadge;
  is_active: boolean;
  is_verified: boolean;
  total_orders: number;
  completed_orders: number;
  repeat_user_rate: number;
  response_time_avg_sec: number;
}

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
  image_url?: string;
}

export interface Rating {
  rating_id: string;
  user_id: string;
  cook_id: string;
  rating_overall: number;
  text?: string;
  tags?: string[];
  created_at: { _seconds: number };
}

export interface CookProfileResponse {
  cook: CookProfile;
  meals: Meal[];
  slots: SlotSummary[];
  recent_ratings: Rating[];
}

export interface Order {
  order_id: string;
  user_id: string;
  cook_id: string;
  meal_id: string;
  slot_id: string;
  customisation?: string;
  status: OrderStatus;
  created_at: { _seconds: number };
  ttl_expires_at: { _seconds: number };
  communication_window_open: boolean;
  rated: boolean;
  price_inr: number;
  meal_name: string;
  slot_display_time: string;
  cook_name?: string;
  cook_neighbourhood?: string;
}

export interface PlaceOrderPayload {
  slot_id: string;
  meal_id: string;
  customisation?: string;
}

export interface PlaceOrderResponse {
  order_id: string;
  status: OrderStatus;
  ttl_expires_at: string;
}

export interface CookDashboard {
  today_confirmed_orders: Order[];
  today_pending_orders: Order[];
  active_slots: SlotSummary[];
  trust_score: number;
  rating_avg: number;
  badge: CookBadge;
  earnings_today: number;
  earnings_this_week: number;
  repeat_user_rate: number;
  pending_commission: number;
  festival_suggestions: FestivalSuggestion[];
  recent_ratings: Rating[];
}

export interface FestivalSuggestion {
  festival_name: string;
  date: string;
  suggested_dishes: string[];
  capacity_boost: number;
  has_responded: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}
