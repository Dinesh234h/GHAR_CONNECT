"use client"

import { useState, useCallback } from "react"
import { IndianRupee, Star, Shield, Package, Edit3, Plus, Sparkles, Check, X, Loader2, AlertCircle, RefreshCcw, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getCookDashboard } from "@/services/cook.service"
import { respondToOrder, completeOrder } from "@/services/order.service"
import type { CookDashboard, Order } from "@/types/api.types"

interface CookDashboardScreenProps {
  onIncomingOrder: () => void
  onAiSuggestions: () => void
  onEditMenu: () => void
  onCreateMeal: () => void
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={cn("rounded-2xl p-4 flex flex-col gap-1", color)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <div className="opacity-70">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-muted animate-pulse rounded-2xl h-24" />
  )
}

export function CookDashboardScreen({ onIncomingOrder, onAiSuggestions, onEditMenu, onCreateMeal }: CookDashboardScreenProps) {
  const [isAvailable, setIsAvailable] = useState(true)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { data, loading, error, refetch } = useApi<CookDashboard>(
    useCallback(() => getCookDashboard(), []),
    []
  )

  const handleRespond = async (orderId: string, action: "accept" | "reject") => {
    setActionLoading(orderId)
    try {
      await respondToOrder(orderId, action)
      refetch()
    } catch (err) {
      console.error("Respond failed", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      await completeOrder(orderId)
      refetch()
    } catch (err) {
      console.error("Complete failed", err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background p-4 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-40 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded-lg mt-1" />
          </div>
          <div className="w-12 h-12 bg-muted animate-pulse rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-muted animate-pulse rounded-2xl h-36" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="font-semibold text-foreground">Could not load dashboard</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refetch} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    )
  }

  const pendingOrders = data?.today_pending_orders ?? []
  const confirmedOrders = data?.today_confirmed_orders ?? []

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto pb-24">
      <div className="px-4 pt-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">My Kitchen</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted-foreground">Available</p>
              <Switch
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
                className="mt-0.5"
              />
            </div>
            <Avatar className="w-12 h-12 rounded-2xl">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                C
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Orders today"
            value={confirmedOrders.length + pendingOrders.length}
            icon={<Package className="h-5 w-5" />}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            label="Earnings today"
            value={`₹${data?.earnings_today ?? 0}`}
            icon={<IndianRupee className="h-5 w-5" />}
            color="bg-green-500/10 text-green-700"
          />
          <StatCard
            label="Rating"
            value={(data?.rating_avg ?? 0).toFixed(1)}
            icon={<Star className="h-5 w-5" />}
            color="bg-amber-500/10 text-amber-700"
          />
          <StatCard
            label="Trust Score"
            value={data?.trust_score ?? 0}
            icon={<Shield className="h-5 w-5" />}
            color="bg-blue-500/10 text-blue-700"
          />
        </div>

        {/* This Week Earnings */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">This week</p>
            <p className="text-2xl font-bold text-foreground">₹{data?.earnings_this_week ?? 0}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500 opacity-70" />
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Pending Orders ({pendingOrders.length})
            </h2>
            <div className="space-y-3">
              {pendingOrders.map((order: Order) => (
                <div key={order.order_id} className="bg-card rounded-2xl border border-amber-500/30 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.meal_name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Slot: {order.slot_display_time}</p>
                      <p className="text-sm font-medium text-primary mt-1">Rs. {order.price_inr}</p>
                    </div>
                    <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-lg font-medium">
                      Pending
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleRespond(order.order_id, "accept")}
                      disabled={actionLoading === order.order_id}
                    >
                      {actionLoading === order.order_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRespond(order.order_id, "reject")}
                      disabled={actionLoading === order.order_id}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Orders */}
        {confirmedOrders.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3">
              Confirmed Orders ({confirmedOrders.length})
            </h2>
            <div className="space-y-3">
              {confirmedOrders.map((order: Order) => (
                <div key={order.order_id} className={cn(
                  "bg-card rounded-2xl border p-4",
                  order.status === "completed" ? "border-green-500/30" : "border-border/50"
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.meal_name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{order.slot_display_time}</p>
                      <p className="text-sm font-medium text-primary mt-1">Rs. {order.price_inr}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-lg font-medium capitalize",
                      order.status === "completed"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-blue-500/10 text-blue-600"
                    )}>
                      {order.status}
                    </span>
                  </div>
                  {order.status === "accepted" && (
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => handleComplete(order.order_id)}
                      disabled={actionLoading === order.order_id}
                    >
                      {actionLoading === order.order_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      ) : null}
                      Mark as Completed
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no orders */}
        {pendingOrders.length === 0 && confirmedOrders.length === 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
            <p className="text-4xl mb-3">🍱</p>
            <p className="font-semibold text-foreground">No orders yet today</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add meals and slots to start getting orders
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-16 flex-col gap-1.5" onClick={onCreateMeal}>
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add Meal</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-1.5" onClick={onAiSuggestions}>
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm">AI Ideas</span>
          </Button>
        </div>

        {/* Recent Ratings */}
        {(data?.recent_ratings ?? []).length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3">Recent Reviews</h2>
            <div className="space-y-3">
              {data!.recent_ratings.slice(0, 3).map((r) => (
                <div key={r.rating_id} className="bg-card rounded-xl border border-border/50 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Customer
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating_overall }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  {r.text && (
                    <p className="text-sm text-muted-foreground">{r.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
