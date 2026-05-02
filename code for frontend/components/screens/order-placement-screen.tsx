"use client"

import { useState } from "react"
import { ArrowLeft, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getCookProfile } from "@/services/cook.service"
import { placeOrder } from "@/services/order.service"
import type { CookProfileResponse } from "@/types/api.types"

interface OrderPlacementScreenProps {
  cookId: string
  slotId: string
  mealId: string
  onBack: () => void
  onPlaceOrder: (orderId: string) => void
}

export function OrderPlacementScreen({ cookId, slotId, mealId, onBack, onPlaceOrder }: OrderPlacementScreenProps) {
  const [notes, setNotes] = useState("")
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)

  const { data, loading, error } = useApi<CookProfileResponse>(
    () => getCookProfile(cookId),
    [cookId]
  )

  const selectedMeal = data?.meals.find(m => m.meal_id === mealId)
  const selectedSlot = data?.slots.find(s => s.slot_id === slotId)
  const cook = data?.cook

  const handlePlaceOrder = async () => {
    if (!selectedMeal || !selectedSlot) return
    setPlacing(true)
    setPlaceError(null)
    try {
      const result = await placeOrder({
        slot_id: slotId,
        meal_id: mealId,
        customisation: notes.trim() || undefined,
      })
      onPlaceOrder(result.order_id)
    } catch (err) {
      setPlaceError((err as Error).message || "Failed to place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/50">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">Place Order</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !selectedMeal || !selectedSlot) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/50">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">Place Order</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-semibold text-foreground">Could not load order details</p>
          <p className="text-sm text-muted-foreground">{error || "Meal or slot not found"}</p>
          <Button variant="outline" onClick={onBack}>Go back</Button>
        </div>
      </div>
    )
  }

  const availableInSlot = selectedSlot.max_capacity - selectedSlot.confirmed_count - selectedSlot.pending_count

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/50">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Place Order</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        {/* Cook + Meal Card */}
        <div className="p-4 bg-card rounded-2xl border border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={cook?.kitchen_images?.[0]} alt={cook?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {cook?.name?.charAt(0) ?? "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{cook?.name}</p>
              <h2 className="font-semibold text-foreground">{selectedMeal.name}</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{selectedMeal.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              selectedMeal.dietary_type === "veg"
                ? "bg-green-500/10 text-green-600"
                : "bg-red-500/10 text-red-600"
            )}>
              {selectedMeal.dietary_type === "veg" ? "🟢 Veg" : "🔴 Non-veg"}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              Spice: {selectedMeal.spice_level}
            </span>
          </div>
        </div>

        {/* Selected Slot */}
        <div className="mt-4 p-4 bg-card rounded-2xl border border-primary/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Pickup Slot</p>
          <p className="font-semibold text-foreground">{selectedSlot.slot_display_time}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {availableInSlot} {availableInSlot === 1 ? "spot" : "spots"} remaining
          </p>
        </div>

        {/* Dietary Notes */}
        <div className="mt-5">
          <h3 className="font-medium text-foreground">Dietary notes <span className="text-muted-foreground font-normal">(optional)</span></h3>
          <Textarea
            placeholder="Any allergies or preferences (e.g. no peanuts, less spice)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 rounded-xl resize-none"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{notes.length}/300</p>
        </div>

        {/* Pickup Location */}
        <div className="mt-5">
          <h3 className="font-medium text-foreground">Pickup location</h3>
          <div className="mt-2 h-[100px] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-secondary/10" />
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                {cook?.location?.neighbourhood ?? "Cook's neighbourhood"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-5 p-4 bg-card rounded-2xl border border-border/50">
          <h3 className="font-medium text-foreground">Order Summary</h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{selectedMeal.name} × 1</span>
              <span>Rs. {selectedMeal.price_inr}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pickup slot</span>
              <span>{selectedSlot.slot_display_time}</span>
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">Rs. {selectedMeal.price_inr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {placeError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{placeError}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Cook has 3 minutes to confirm your order
        </p>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] p-4 bg-card border-t border-border">
        <Button
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 gap-2"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Placing order...</>
          ) : (
            `Place order — Rs. ${selectedMeal.price_inr}`
          )}
        </Button>
      </div>
    </div>
  )
}
