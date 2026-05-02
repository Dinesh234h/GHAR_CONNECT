// hooks/useOrderPolling.ts
// Polls an order's status every 5s to simulate real-time updates
// (Use Firebase Firestore SDK for true real-time in production)

import { useState, useEffect, useRef } from "react";
import { getOrderById } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/api.types";

const TERMINAL_STATUSES: OrderStatus[] = [
  "accepted",
  "rejected",
  "cancelled",
  "completed",
  "timeout",
];

export function useOrderPolling(orderId: string | null, intervalMs = 4000) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const result = await getOrderById(orderId);
      setOrder(result);
      setError(null);

      // Stop polling once a terminal state is reached
      if (TERMINAL_STATUSES.includes(result.status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    // Immediate first fetch
    fetchOrder();

    // Start polling
    intervalRef.current = setInterval(fetchOrder, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, intervalMs]);

  return { order, loading, error };
}
