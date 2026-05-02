"use client"

import { useState } from "react"
import { X, MapPin, Clock, Star, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LocationFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
}

interface FilterState {
  distance: "500m" | "1km" | "2km" | "5km"
  mealType: string[]
  availability: "now" | "today" | "anytime"
  rating: number
  priceRange: [number, number]
}

const mealTypes = [
  "South Indian",
  "North Indian",
  "Veg Only",
  "Non-Veg",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Tiffin",
]

export function LocationFilterSheet({ isOpen, onClose, onApply }: LocationFilterSheetProps) {
  const [filters, setFilters] = useState<FilterState>({
    distance: "1km",
    mealType: [],
    availability: "now",
    rating: 4,
    priceRange: [0, 150],
  })

  const handleMealTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      mealType: prev.mealType.includes(type)
        ? prev.mealType.filter(t => t !== type)
        : [...prev.mealType, type]
    }))
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      distance: "1km",
      mealType: [],
      availability: "now",
      rating: 4,
      priceRange: [0, 150],
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="font-semibold text-lg text-foreground">Filters</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-6">
          {/* Distance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Distance</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["500m", "1km", "2km", "5km"] as const).map((dist) => (
                <button
                  key={dist}
                  onClick={() => setFilters(prev => ({ ...prev, distance: dist }))}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    filters.distance === dist
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Availability</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "now", label: "Available now" },
                { value: "today", label: "Today" },
                { value: "anytime", label: "Anytime" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({ ...prev, availability: option.value }))}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    filters.availability === option.value
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Meal Type</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleMealTypeToggle(type)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    filters.mealType.includes(type)
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Minimum Rating</h3>
            </div>
            <div className="flex gap-2">
              {[3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilters(prev => ({ ...prev, rating }))}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    filters.rating === rating
                      ? "bg-amber-500 text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  <Star className={cn(
                    "h-3.5 w-3.5",
                    filters.rating === rating ? "fill-white" : "fill-amber-400 text-amber-400"
                  )} />
                  {rating}+
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Price Range</h3>
              <span className="text-sm text-muted-foreground">
                Rs. {filters.priceRange[0]} - Rs. {filters.priceRange[1]}
              </span>
            </div>
            <div className="flex gap-2">
              {[
                { label: "Under Rs. 50", range: [0, 50] as [number, number] },
                { label: "Rs. 50-100", range: [50, 100] as [number, number] },
                { label: "Rs. 100-150", range: [100, 150] as [number, number] },
                { label: "Any", range: [0, 150] as [number, number] },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setFilters(prev => ({ ...prev, priceRange: option.range }))}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs font-medium transition-colors flex-1",
                    filters.priceRange[0] === option.range[0] && filters.priceRange[1] === option.range[1]
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border/50 bg-card">
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
