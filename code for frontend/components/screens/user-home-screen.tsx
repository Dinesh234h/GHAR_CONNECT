"use client"

import { MapPin, Search, Bell, ChevronDown, Map } from "lucide-react"
import { CookCard } from "@/components/cook-card"

interface UserHomeScreenProps {
  onViewCook: (cookId: string) => void
  onOrder: (cookId: string) => void
  onNotifications: () => void
  onMapView?: () => void
  onLocationPicker?: () => void
  currentLocation?: string
}

const mockCooks = [
  {
    id: "1",
    name: "Lakshmi Devi",
    avatar: "",
    rating: 4.8,
    orderCount: 156,
    badge: "trusted" as const,
    walkTime: "8 min",
    distance: "600m",
    neighborhood: "Koramangala",
    todayMeal: "Curd Rice, Sambar, Poriyal",
    priceRange: "Rs. 60-90",
    availableSlots: "Lunch 12-1 PM",
    slotsLeft: 5,
    trustScore: 98,
  },
  {
    id: "2",
    name: "Geeta Sharma",
    avatar: "",
    rating: 4.9,
    orderCount: 243,
    badge: "top" as const,
    walkTime: "12 min",
    distance: "950m",
    neighborhood: "Indiranagar",
    todayMeal: "Rajma Chawal, Roti, Raita",
    priceRange: "Rs. 80-120",
    availableSlots: "Lunch 1-2 PM",
    slotsLeft: 3,
    trustScore: 85,
  },
  {
    id: "3",
    name: "Meenakshi K",
    avatar: "",
    rating: 4.6,
    orderCount: 45,
    badge: "new" as const,
    walkTime: "5 min",
    distance: "400m",
    neighborhood: "Koramangala",
    todayMeal: "Idli, Vada, Coconut Chutney",
    priceRange: "Rs. 40-60",
    availableSlots: "Breakfast 8-10 AM",
    slotsLeft: 8,
    trustScore: 92,
  },
]

export function UserHomeScreen({ 
  onViewCook, 
  onOrder, 
  onNotifications,
  onMapView,
  onLocationPicker,
  currentLocation = "Indiranagar"
}: UserHomeScreenProps) {
  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/50">
        <button 
          className="flex items-center gap-1 text-foreground"
          onClick={onLocationPicker}
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">{currentLocation}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <button 
            className="p-2 hover:bg-muted rounded-full transition-colors"
            onClick={onMapView}
          >
            <Map className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
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
          <p className="text-sm text-muted-foreground mt-0.5">Fresh meals ready for pickup</p>
        </div>

        {/* Cook Cards */}
        <div className="px-4 mt-4 space-y-4 pb-4">
          {[...mockCooks].sort((a, b) => b.trustScore - a.trustScore).map((cook) => (
            <CookCard
              key={cook.id}
              cook={cook}
              onViewProfile={() => onViewCook(cook.id)}
              onOrder={() => onOrder(cook.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
