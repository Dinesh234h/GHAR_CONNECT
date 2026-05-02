// services/order.service.ts

import { apiClient } from "@/lib/api";
import type {
  Order,
  PlaceOrderPayload,
  PlaceOrderResponse,
} from "@/types/api.types";

export async function placeOrder(
  payload: PlaceOrderPayload
): Promise<PlaceOrderResponse> {
  return apiClient<PlaceOrderResponse>("/orders/place", {
    method: "POST",
    data: payload,
  });
}

export interface RespondToOrderPayload {
  action: "accept" | "reject";
}

export interface RespondToOrderResponse {
  status: string;
  order_id: string;
  alternatives?: unknown[];
}

export async function respondToOrder(
  orderId: string,
  action: "accept" | "reject"
): Promise<RespondToOrderResponse> {
  return apiClient<RespondToOrderResponse>(`/orders/${orderId}/respond`, {
    method: "POST",
    data: { action },
  });
}

export async function completeOrder(
  orderId: string
): Promise<{ status: string; order_id: string }> {
  return apiClient<{ status: string; order_id: string }>(
    `/orders/${orderId}/complete`,
    { method: "POST" }
  );
}

export async function cancelOrder(
  orderId: string
): Promise<{ status: string }> {
  return apiClient<{ status: string }>(`/orders/${orderId}/cancel`, {
    method: "POST",
  });
}

export async function getUserOrders(): Promise<Order[]> {
  return apiClient<Order[]>("/orders/user", { method: "GET" });
}

export async function getOrderById(orderId: string): Promise<Order> {
  return apiClient<Order>(`/orders/${orderId}`, { method: "GET" });
}

export interface SubmitRatingPayload {
  order_id: string;
  rating_overall: number;
  text?: string;
  tags?: string[];
  sub_ratings?: {
    taste: number;
    hygiene: number;
    packaging: number;
    value_for_money: number;
  };
}

export async function submitRating(
  payload: SubmitRatingPayload
): Promise<{ rating_id: string; message: string }> {
  return apiClient<{ rating_id: string; message: string }>("/ratings", {
    method: "POST",
    data: payload,
  });
}
