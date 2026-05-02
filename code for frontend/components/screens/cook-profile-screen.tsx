"use client"

import { useState } from "react"
import { ArrowLeft, Star, MapPin, CheckCircle, Clock, Users, Plus, Minus, Loader2, AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getCookProfile } from "@/services/cook.service"
import type { CookProfileResponse, Meal, SlotSummary, Rating } from "@/types/api.types"

interface CookProfileScreenProps {
  cookId: string
  onBack: () => void
  onOrder: (slotId: string, mealId: string) => void
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("bg-muted animate-pulse rounded-xl", className)} />
}

function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <SkeletonBlock className="h-48 rounded-2xl" />
      <div className="flex gap-3 items-center">
        <SkeletonBlock className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>
      </div>
      <SkeletonBlock className="h-12" />
      <SkeletonBlock className="h-32" />
    </div>
  )
}

export function CookProfileScreen({ cookId, onBack, onOrder }: CookProfileScreenProps) {
  const { data, loading, error, refetch } = useApi<CookProfileResponse>(
    () => getCookProfile(cookId),
    [cookId]
  )

  const [activeCategory, setActiveCategory] = useState<"breakfast" | "lunch" | "dinner">("lunch")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const next = (prev[id] || 0) + delta
      if (next <= 0) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: next }
    })
  }

  // Group meals by rough category based on cuisine/dietary (display only)
  const groupMeals = (meals: Meal[]) => {
    const breakfastKeywords = ["idli", "poha", "upma", "dosa", "uttapam", "paratha", "toast"]
    const dinnerKeywords = ["chapati", "roti", "khichdi", "dal", "sabzi", "curry", "pulao"]
    return {
      breakfast: meals.filter(m =>
        breakfastKeywords.some(k => m.name.toLowerCase().includes(k))
      ),
      lunch: meals.filter(m =>
        !breakfastKeywords.some(k => m.name.toLowerCase().includes(k)) &&
        !dinnerKeywords.some(k => m.name.toLowerCase().includes(k))
      ),
      dinner: meals.filter(m =>
        dinnerKeywords.some(k => m.name.toLowerCase().includes(k))
      ),
    }
  }

  const cook = data?.cook
  const meals = data?.meals ?? []
  const slots = data?.slots ?? []
  const recentRatings = data?.recent_ratings ?? []
  const grouped = groupMeals(meals)
  const categoryMeals = grouped[activeCategory].length > 0 ? grouped[activeCategory] : meals

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const meal = meals.find(m => m.meal_id === id)
    return sum + (meal?.price_inr ?? 0) * qty
  }, 0)

  const handleOrderNow = () => {
    const firstCartMeal = Object.keys(cart)[0]
    if (!firstCartMeal || !selectedSlotId) return
    onOrder(selectedSlotId, firstCartMeal)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <button onClick={onBack} className="p-1.5 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">Cook Profile</span>
        </div>
        <ProfileSkeleton />
      </div>
    )
  }

  if (error || !cook) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <button onClick={onBack} className="p-1.5 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">Cook Profile</span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="font-semibold text-foreground">Could not load profile</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={refetch} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Map Hero placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 shrink-0">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-background/90 rounded-full shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {cook.kitchen_images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cook.kitchen_images[0]}
            alt="Kitchen"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-4">
          {/* Cook Header */}
          <div className="flex items-start gap-4 -mt-8 relative z-10">
            <Avatar className="w-16 h-16 rounded-2xl border-4 border-background shadow-md shrink-0">
              <AvatarImage src={cook.kitchen_images?.[0]} />
              <AvatarFallback className="rounded-2xl text-xl font-bold bg-primary/10 text-primary">
                {cook.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="pt-8 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{cook.name}</h1>
                {cook.is_verified && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-foreground">{cook.rating_avg.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({cook.rating_count})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {Math.round(cook.response_time_avg_sec / 60) || "<1"} min response
                  </span>
                </div>
              </div>
              {cook.location.neighbourhood && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{cook.location.neighbourhood}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-muted-foreground mt-4 leading-relaxed">{cook.bio}</p>

          {/* Special Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {cook.badge === "top_cook" && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                🏆 Top cook of month
              </Badge>
            )}
            {cook.badge === "trusted" && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                ✓ Trusted cook
              </Badge>
            )}
            {cook.is_verified && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                🔍 Kitchen inspected
              </Badge>
            )}
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              ⭐ {cook.rating_avg.toFixed(1)} Ratings
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{cook.total_orders}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Orders</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{Math.round(cook.repeat_user_rate)}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Repeat Rate</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{cook.trust_score}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Trust Score</p>
            </div>
          </div>

          {/* Menu Categories */}
          <div className="mt-8">
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              {(["breakfast", "lunch", "dinner"] as const).map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors",
                    activeCategory === cat
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {categoryMeals.length === 0 ? (
              <div className="mt-6 py-8 text-center text-muted-foreground text-sm">
                No meals in this category today
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {categoryMeals.map((meal) => (
                  <div
                    key={meal.meal_id}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{meal.name}</h3>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          meal.dietary_type === "veg"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        )}>
                          {meal.dietary_type === "veg" ? "🟢 Veg" : "🔴 Non-veg"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
                      <span className="inline-block mt-2 font-semibold text-primary">Rs. {meal.price_inr}</span>
                    </div>
                    <div className="shrink-0 flex items-center">
                      {cart[meal.meal_id] ? (
                        <div className="flex items-center bg-primary/10 rounded-lg border border-primary/20 h-9">
                          <button
                            className="w-8 h-full flex items-center justify-center text-primary hover:bg-primary/20 rounded-l-lg transition-colors"
                            onClick={() => handleUpdateQuantity(meal.meal_id, -1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-primary">
                            {cart[meal.meal_id]}
                          </span>
                          <button
                            className="w-8 h-full flex items-center justify-center text-primary hover:bg-primary/20 rounded-r-lg transition-colors"
                            onClick={() => handleUpdateQuantity(meal.meal_id, 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-lg gap-1.5"
                          onClick={() => handleUpdateQuantity(meal.meal_id, 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Slots */}
          {slots.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-foreground">
                <Users className="h-4 w-4 inline mr-1.5" />
                Pick a Slot
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const available = slot.max_capacity - slot.confirmed_count - slot.pending_count
                  const isFull = available <= 0
                  return (
                    <button
                      key={slot.slot_id}
                      onClick={() => !isFull && setSelectedSlotId(slot.slot_id)}
                      disabled={isFull}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        isFull
                          ? "opacity-50 cursor-not-allowed border-border bg-muted"
                          : selectedSlotId === slot.slot_id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">{slot.slot_display_time}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isFull ? "Full" : `${available} left`}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Reviews */}
          {recentRatings.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-foreground">Recent Reviews</h2>
              <div className="mt-3 space-y-3">
                {recentRatings.map((r) => (
                  <div key={r.rating_id} className="p-4 bg-card rounded-xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">
                        User {r.user_id.slice(-4)}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating_overall }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    {r.text && (
                      <p className="text-sm text-muted-foreground mt-2">{r.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart / Order CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        {totalCartItems > 0 ? (
          <Button
            className="w-full h-14 text-base font-semibold gap-3"
            onClick={handleOrderNow}
            disabled={!selectedSlotId}
          >
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{totalCartItems} items</span>
            {selectedSlotId ? `Order Now — Rs. ${totalPrice}` : "Select a slot to continue"}
          </Button>
        ) : (
          <Button variant="outline" className="w-full h-14 text-base font-semibold" disabled>
            Add items to order
          </Button>
        )}
      </div>
    </div>
  )
}
