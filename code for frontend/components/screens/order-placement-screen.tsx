"use client"

import { useState } from "react"
import { ArrowLeft, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface OrderPlacementScreenProps {
  cookId: string
  onBack: () => void
  onPlaceOrder: () => void
}

const mockMeal = {
  name: "Sambar Rice Combo",
  description: "Sambar rice with poriyal and buttermilk",
  price: 80,
  cookName: "Lakshmi Devi",
  cookAvatar: "",
}

const mockSlots = [
  { id: "s1", time: "12:00 PM", available: true },
  { id: "s2", time: "12:30 PM", available: true },
  { id: "s3", time: "1:00 PM", available: true },
  { id: "s4", time: "1:30 PM", available: false },
]

export function OrderPlacementScreen({ onBack, onPlaceOrder }: OrderPlacementScreenProps) {
  const [selectedSlot, setSelectedSlot] = useState(mockSlots[0].id)
  const [notes, setNotes] = useState("")

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/50">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Place Order</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        {/* Meal Card */}
        <div className="p-4 bg-card rounded-2xl border border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mockMeal.cookAvatar} alt={mockMeal.cookName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {mockMeal.cookName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{mockMeal.cookName}</p>
              <h2 className="font-semibold text-foreground">{mockMeal.name}</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{mockMeal.description}</p>
        </div>

        {/* Slot Selection */}
        <div className="mt-6">
          <h3 className="font-medium text-foreground">Select pickup slot</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {mockSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  "px-4 py-3 rounded-xl border text-sm font-medium transition-colors",
                  !slot.available && "opacity-50 cursor-not-allowed",
                  selectedSlot === slot.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <h3 className="font-medium text-foreground">Dietary notes (optional)</h3>
          <Textarea
            placeholder="Any allergies or preferences..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 rounded-xl resize-none"
            rows={3}
          />
        </div>

        {/* Map Preview */}
        <div className="mt-6">
          <h3 className="font-medium text-foreground">Pickup location</h3>
          <div className="mt-2 h-[120px] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-secondary/10" />
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Koramangala 4th Block</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-6 p-4 bg-card rounded-2xl border border-border/50">
          <h3 className="font-medium text-foreground">Order Summary</h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{mockMeal.name}</span>
              <span>Rs. {mockMeal.price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pickup slot</span>
              <span>{mockSlots.find(s => s.id === selectedSlot)?.time}</span>
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">Rs. {mockMeal.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Cook has 3 minutes to confirm your order
        </p>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] p-4 bg-card border-t border-border">
        <Button 
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onPlaceOrder}
        >
          Place order - Rs. {mockMeal.price}
        </Button>
      </div>
    </div>
  )
}
