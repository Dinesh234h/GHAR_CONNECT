"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, RefreshCcw, Loader2, AlertCircle, ChevronRight, Phone, Mic, MapPin } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getUserOrders, cancelOrder } from "@/services/order.service"
import type { Order, OrderStatus } from "@/types/api.types"

interface UserOrdersScreenProps {
  onOrderSelect: (orderId: string) => void
  userType?: "user" | "cook"
}

// Map backend status to what StatusBadge expects
function toDisplayStatus(status: OrderStatus): "pending" | "confirmed" | "ready" | "completed" {
  switch (status) {
    case "accepted": return "confirmed"
    case "completed": return "completed"
    case "pending": return "pending"
    default: return "ready" // rejected, cancelled, timeout → fallback
  }
}

function isActive(status: OrderStatus) {
  return status === "pending" || status === "accepted"
}

function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function UserOrdersScreen({ onOrderSelect, userType = "user" }: UserOrdersScreenProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { data, loading, error, refetch } = useApi<{ orders: Order[] }>(
    useCallback(() => getUserOrders(), []),
    []
  )

  const allOrders = data?.orders ?? []
  const upcomingOrders = allOrders.filter(o => isActive(o.status))
  const pastOrders = allOrders.filter(o => !isActive(o.status))
  const displayOrders = activeTab === "upcoming" ? upcomingOrders : pastOrders

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      await cancelOrder(orderId)
      refetch()
    } catch (err) {
      console.error("Cancel failed:", err)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border/50">
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {(["upcoming", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab}
              {tab === "upcoming" && upcomingOrders.length > 0 && (
                <span className="ml-1.5 bg-primary-foreground/20 text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {upcomingOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-semibold text-foreground">Could not load orders</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && displayOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h3 className="font-semibold text-foreground">
              {activeTab === "upcoming" ? "No active orders" : "No past orders"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "upcoming" ? "Find a cook and place your first order!" : "Completed orders will appear here"}
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && displayOrders.length > 0 && (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div
                key={order.order_id}
                className={cn(
                  "bg-card rounded-2xl border overflow-hidden transition-all",
                  order.status === "pending" ? "border-amber-500/30" :
                  order.status === "accepted" ? "border-blue-500/30" :
                  order.status === "completed" ? "border-green-500/30" :
                  "border-border/50"
                )}
              >
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(order.cook_name ?? "C").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {order.cook_name ?? `Cook ${order.cook_id.slice(-4)}`}
                        </h3>
                        <StatusBadge status={toDisplayStatus(order.status)} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{order.meal_name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{order.slot_display_time}</span>
                        <span className="text-xs font-semibold text-primary">Rs. {order.price_inr}</span>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform shrink-0",
                      expandedOrder === order.order_id && "rotate-90"
                    )} />
                  </div>
                </button>

                {/* Expanded */}
                {expandedOrder === order.order_id && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-3">
                    {/* Location */}
                    {order.cook_neighbourhood && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{order.cook_neighbourhood}</span>
                      </div>
                    )}

                    {/* Order ID */}
                    <p className="text-xs text-muted-foreground font-mono mb-3">
                      Order #{order.order_id.slice(-8).toUpperCase()}
                    </p>

                    {/* Active order actions */}
                    {isActive(order.status) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button className="flex-1 flex items-center justify-center gap-2 h-10 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                            <Phone className="h-4 w-4" />
                            Call
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 h-10 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                            <Mic className="h-4 w-4" />
                            Voice message
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={() => handleCancel(order.order_id)}
                          disabled={cancellingId === order.order_id}
                        >
                          {cancellingId === order.order_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Cancel order
                        </Button>
                      </div>
                    )}

                    {/* Rate button for completed orders */}
                    {order.status === "completed" && !order.rated && userType === "user" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 border-primary/30 text-primary"
                        onClick={() => onOrderSelect(order.order_id)}
                      >
                        ⭐ Rate this order
                      </Button>
                    )}

                    {order.status === "completed" && order.rated && (
                      <p className="text-sm text-center text-muted-foreground mt-2">✓ Rated</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
