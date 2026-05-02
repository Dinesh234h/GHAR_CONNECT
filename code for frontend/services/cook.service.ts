// services/cook.service.ts

import { apiClient } from "@/lib/api";
import type {
  CookCardResult,
  CookProfileResponse,
  CookDashboard,
} from "@/types/api.types";

export interface GetNearbyCooksParams {
  lat: number;
  lng: number;
}

export interface GetNearbyCooksResponse {
  cooks: CookCardResult[];
  total: number;
}

export async function getNearbyCooks(
  params: GetNearbyCooksParams
): Promise<GetNearbyCooksResponse> {
  const query = new URLSearchParams({
    lat: params.lat.toString(),
    lng: params.lng.toString(),
  }).toString();
  return apiClient<GetNearbyCooksResponse>(`/cooks/nearby?${query}`, {
    method: "GET",
  });
}

export async function getCookProfile(
  cookId: string
): Promise<CookProfileResponse> {
  return apiClient<CookProfileResponse>(`/cooks/${cookId}`, {
    method: "GET",
  });
}

export async function getCookDashboard(): Promise<CookDashboard> {
  return apiClient<CookDashboard>("/cook/dashboard", {
    method: "GET",
  });
}

export interface OnboardCookPayload {
  name: string;
  bio: string;
  meal_types: string[];
  cuisine_tags: string[];
  capacity_default: number;
  address?: string;
  lat?: number;
  lng?: number;
}

export async function onboardCook(
  payload: OnboardCookPayload,
  images: File[]
): Promise<{ cook_id: string; message: string }> {
  const formData = new FormData();
  // Append JSON fields as a single JSON string (required by multer on backend)
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Backend zod expects array; send each item separately
      value.forEach((v) => formData.append(key, v as string));
    } else if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  images.forEach((img) => formData.append("kitchen_images", img));

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/demo-gharconnect/asia-south1/api"}/cook/onboard`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || "Onboarding failed");
  }
  return json;
}

export interface CreateMealPayload {
  name: string;
  description: string;
  price_inr: number;
  dietary_type: string;
  cuisine_tag: string;
  spice_level: string;
  ingredients: string[];
  allergens: string[];
  is_festival_special?: boolean;
}

export async function createMeal(
  payload: CreateMealPayload
): Promise<{ meal_id: string; message: string }> {
  return apiClient<{ meal_id: string; message: string }>("/meals", {
    method: "POST",
    data: payload,
  });
}

export interface CreateSlotPayload {
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  is_festival_slot?: boolean;
}

export async function createSlot(
  payload: CreateSlotPayload
): Promise<{ slot_id: string; message: string }> {
  return apiClient<{ slot_id: string; message: string }>("/slots", {
    method: "POST",
    data: payload,
  });
}
