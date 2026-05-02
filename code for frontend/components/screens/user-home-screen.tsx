"use client"

import { useState, useCallback } from "react"
import { MapPin, Search, Bell, ChevronDown, Map, Loader2, AlertCircle, RefreshCcw, WifiOff } from "lucide-react"
import { CookCard } from "@/components/cook-card"
import { useLocation } from "@/hooks/useLocation"
import { useApi } from "@/hooks/useApi"
import { getNearbyCooks } from "@/services/cook.service"
import type { CookCardResult } from "@/types/api.types"
import { Button } from "@/components/ui/button"

interface UserHomeScreenProps {
  onViewCook: (cookId: string) => void
  onOrder: (cookId: string) => void
  onNotifications: () => void
  onMapView?: () => void
  onLocationPicker?: () => void
  currentLocation?: string
}

// Skeleton Loader for cook cards
function CookCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      </div>
      <div className="mt-3 h-9 bg-muted rounded-xl" />
    </div>
  )
}

export function UserHomeScreen({
  onViewCook,
  onOrder,
  onNotifications,
  onMapView,
  onLocationPicker,
  currentLocation = "Locating...",
}: UserHomeScreenProps) {
  const { location, requestLocation } = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const lat = location.status === "granted" ? location.lat : 12.9716  // Bangalore fallback
  const lng = location.status === "granted" ? location.lng : 77.5946

  const { data, loading, error, refetch } = useApi<{ cooks?: CookCardResult[] }>(
    useCallback(() => getNearbyCooks({ lat, lng }), [lat, lng]),
    [lat, lng]
  )

  const cooks = data?.cooks ?? []
  const filteredCooks = cooks
    .filter(c =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cuisine_tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.trust_score - a.trust_score)

  const displayLocation =
    location.status === "granted"
      ? (location.label ?? currentLocation)
      : currentLocation

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/50">
        <button
          className="flex items-center gap-1 text-foreground"
          onClick={onLocationPicker}
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">{displayLocation}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <button
            className="p-2 hover:bg-muted rounded-full transition-colors"
            onClick={onMapView}
          >
            <Map className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-full transition-colors"
            onClick={() => setShowSearch((v) => !v)}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-full transition-colors relative"
            onClick={onNotifications}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pt-3 pb-1">
          <input
            type="text"
            placeholder="Search cooks, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-muted text-foreground text-sm outline-none border border-border focus:border-primary transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Location denied banner */}
      {location.status === "denied" && (
        <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
          <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 flex-1">{location.message}</p>
          <button
            className="text-xs text-amber-600 font-semibold underline shrink-0"
            onClick={requestLocation}
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Festival Banner */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-primary/90 to-primary rounded-2xl text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-90">Festival special</p>
              <h3 className="font-semibold text-lg mt-0.5">Onam Sadya nearby!</h3>
              <p className="text-sm mt-1 opacity-90">4 cooks are making Sadya today</p>
            </div>
            <span className="text-3xl">🍛</span>
          </div>
          <button className="mt-3 px-4 py-2 bg-card/20 hover:bg-card/30 rounded-xl text-sm font-medium transition-colors">
            View specials
          </button>
        </div>

        {/* Available Now Section */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-semibold text-foreground">Available now near you</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Finding fresh meals..." : `${filteredCooks.length} cooks nearby`}
          </p>
        </div>

        {/* Cook Cards */}
        <div className="px-4 mt-4 space-y-4 pb-4">
          {/* Loading state */}
          {loading && (
            <>
              <CookCardSkeleton />
              <CookCardSkeleton />
              <CookCardSkeleton />
            </>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Could not load cooks</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredCooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-5xl mb-4">🍽️</span>
              <p className="font-semibold text-foreground">No cooks available nearby</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later or expand your area
              </p>
            </div>
          )}

          {/* Cook list */}
          {!loading && !error && filteredCooks.map((cook) => (
            <CookCard
              key={cook.cook_id}
              cook={{
                id: cook.cook_id,
                name: cook.name,
                avatar: cook.kitchen_images?.[0] ?? "",
                rating: cook.rating_avg,
                orderCount: 0,
                badge: cook.badge === "top_cook" ? "top" : cook.badge as "new" | "trusted",
                walkTime: cook.walking_time,
                distance: cook.distance_text,
                neighborhood: cook.neighbourhood,
                todayMeal: cook.meals.map(m => m.name).join(", ") || "Menu available",
                priceRange: cook.meals.length
                  ? `Rs. ${Math.min(...cook.meals.map(m => m.price_inr))}–${Math.max(...cook.meals.map(m => m.price_inr))}`
                  : "Ask cook",
                availableSlots: cook.slots[0]?.slot_display_time ?? "No slots",
                slotsLeft: cook.slots.reduce((a, s) => a + (s.max_capacity - s.confirmed_count - s.pending_count), 0),
                trustScore: cook.trust_score,
              }}
              onViewProfile={() => onViewCook(cook.cook_id)}
              onOrder={() => onOrder(cook.cook_id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
