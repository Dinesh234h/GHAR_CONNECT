"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOrderPolling } from "@/hooks/useOrderPolling"
import { cancelOrder } from "@/services/order.service"

interface OrderWaitingScreenProps {
  orderId: string
  cookName: string
  cookAvatar?: string
  onTimeout: () => void
  onConfirmed: () => void
}

export function OrderWaitingScreen({
  orderId,
  cookName,
  cookAvatar,
  onTimeout,
  onConfirmed,
}: OrderWaitingScreenProps) {
  const { order, loading, error } = useOrderPolling(orderId)

  // React to status changes from the backend
  useEffect(() => {
    if (!order) return
    if (order.status === "accepted") {
      onConfirmed()
    } else if (order.status === "rejected" || order.status === "timeout" || order.status === "cancelled") {
      onTimeout()
    }
  }, [order, onConfirmed, onTimeout])

  // Derive time left from TTL in the order
  const ttlDate = order?.ttl_expires_at
    ? new Date((order.ttl_expires_at as { _seconds: number })._seconds * 1000)
    : null
  const totalSec = 180 // 3 minutes
  const remaining = ttlDate
    ? Math.max(0, Math.floor((ttlDate.getTime() - Date.now()) / 1000))
    : totalSec
  const progress = (remaining / totalSec) * 100
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId)
    } catch (_) {
      // ignore — onTimeout will still fire via polling
    }
    onTimeout()
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background px-6">
      {/* Countdown Ring */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="96" cy="96" r="88"
            stroke="currentColor" strokeWidth="8" fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="96" cy="96" r="88"
            stroke="currentColor" strokeWidth="8" fill="none"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
            <AvatarImage src={cookAvatar} alt={cookName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {cookName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Timer */}
      <div className="mt-6 text-center">
        {loading && !order ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        ) : (
          <p className="text-4xl font-bold text-foreground tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Waiting for {order?.cook_name ?? cookName}
        </h2>
        <p className="text-muted-foreground mt-1">
          {error ? "Connection issue — retrying..." : "to confirm your order..."}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Order ID pill */}
      <div className="mt-6 px-4 py-2 bg-muted rounded-full">
        <p className="text-xs text-muted-foreground font-mono">
          Order #{orderId.slice(-6).toUpperCase()}
        </p>
      </div>

      {/* Cancel */}
      <button
        className="mt-auto mb-8 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={handleCancel}
      >
        <X className="h-3.5 w-3.5" />
        Cancel order
      </button>
    </div>
  )
}
