"use client"

import { useState } from "react"
import { ArrowLeft, Filter, ChefHat, Star, Clock, MapPin, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MapViewScreenProps {
  onBack: () => void
  onCookSelect: (cookId: string) => void
  onFilter: () => void
}

const mockCooksOnMap = [
  { 
    id: "1", 
    name: "Lakshmi Devi", 
    avatar: "",
    rating: 4.8,
    walkTime: "8 min",
    distance: "600m",
    todayMeal: "Curd Rice, Sambar",
    price: 60,
    slotsLeft: 5,
    lat: 12.9352,
    lng: 77.6245,
    badge: "trusted" as const,
  },
  { 
    id: "2", 
    name: "Geeta Sharma", 
    avatar: "",
    rating: 4.9,
    walkTime: "12 min",
    distance: "950m",
    todayMeal: "Rajma Chawal",
    price: 80,
    slotsLeft: 3,
    lat: 12.9380,
    lng: 77.6280,
    badge: "top" as const,
  },
  { 
    id: "3", 
    name: "Meenakshi K", 
    avatar: "",
    rating: 4.6,
    walkTime: "5 min",
    distance: "400m",
    todayMeal: "Idli, Vada",
    price: 40,
    slotsLeft: 8,
    lat: 12.9340,
    lng: 77.6220,
    badge: "new" as const,
  },
  { 
    id: "4", 
    name: "Sunita Agarwal", 
    avatar: "",
    rating: 4.7,
    walkTime: "15 min",
    distance: "1.2km",
    todayMeal: "Poha, Jalebi",
    price: 50,
    slotsLeft: 4,
    lat: 12.9320,
    lng: 77.6300,
    badge: "trusted" as const,
  },
]

export function MapViewScreen({ onBack, onCookSelect, onFilter }: MapViewScreenProps) {
  const [selectedCook, setSelectedCook] = useState<string | null>(null)
  const [distanceFilter, setDistanceFilter] = useState<"500m" | "1km" | "2km">("1km")

  const selectedCookData = mockCooksOnMap.find(c => c.id === selectedCook)

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case "top":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "trusted":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "new":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Map Container */}
      <div className="relative flex-1 bg-gradient-to-b from-secondary/5 to-secondary/10">
        {/* Map Grid Pattern (simulated map) */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-secondary/30"/>
              </pattern>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="url(#smallGrid)"/>
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary/40"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Street lines (simulated) */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-6 bg-muted/40" />
          <div className="absolute top-2/3 left-0 right-0 h-4 bg-muted/30" />
          <div className="absolute left-1/4 top-0 bottom-0 w-5 bg-muted/35" />
          <div className="absolute left-2/3 top-0 bottom-0 w-4 bg-muted/30" />
        </div>

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <button 
            onClick={onFilter}
            className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-lg"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Distance Filter Pills */}
        <div className="absolute top-20 left-0 right-0 px-4 z-10">
          <div className="flex gap-2 justify-center">
            {(["500m", "1km", "2km"] as const).map((distance) => (
              <button
                key={distance}
                onClick={() => setDistanceFilter(distance)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all",
                  distanceFilter === distance
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                )}
              >
                {distance}
              </button>
            ))}
          </div>
        </div>

        {/* User Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-5 h-5 bg-primary rounded-full border-3 border-card shadow-lg" />
            <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute -inset-6 bg-primary/10 rounded-full" />
          </div>
        </div>

        {/* Cook Markers */}
        {mockCooksOnMap.map((cook, index) => {
          const positions = [
            { top: "25%", left: "30%" },
            { top: "35%", left: "70%" },
            { top: "60%", left: "25%" },
            { top: "70%", left: "65%" },
          ]
          const pos = positions[index % positions.length]
          
          return (
            <button
              key={cook.id}
              onClick={() => setSelectedCook(cook.id)}
              className={cn(
                "absolute z-20 transition-all duration-200",
                selectedCook === cook.id ? "scale-110 z-30" : "hover:scale-105"
              )}
              style={{ top: pos.top, left: pos.left }}
            >
              <div className={cn(
                "relative flex flex-col items-center",
              )}>
                {/* Pin */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2",
                  selectedCook === cook.id 
                    ? "bg-primary border-primary-foreground" 
                    : "bg-card border-border"
                )}>
                  <ChefHat className={cn(
                    "h-6 w-6",
                    selectedCook === cook.id ? "text-primary-foreground" : "text-primary"
                  )} />
                </div>
                
                {/* Price Tag */}
                <div className={cn(
                  "absolute -bottom-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow",
                  selectedCook === cook.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-foreground"
                )}>
                  Rs. {cook.price}
                </div>
              </div>
            </button>
          )
        })}

        {/* Recenter Button */}
        <button className="absolute bottom-36 right-4 w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg z-10">
          <Navigation className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Selected Cook Card */}
      {selectedCookData && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={selectedCookData.avatar} alt={selectedCookData.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {selectedCookData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{selectedCookData.name}</h3>
                  <Badge variant="outline" className={cn("text-xs", getBadgeStyles(selectedCookData.badge))}>
                    {selectedCookData.badge === "top" ? "Top Rated" : 
                     selectedCookData.badge === "trusted" ? "Trusted" : "New"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {selectedCookData.todayMeal}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{selectedCookData.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{selectedCookData.distance}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{selectedCookData.walkTime} walk</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-semibold text-primary">Rs. {selectedCookData.price}</span>
                <p className="text-xs text-muted-foreground">{selectedCookData.slotsLeft} slots left</p>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 h-12 bg-primary hover:bg-primary/90"
              onClick={() => onCookSelect(selectedCookData.id)}
            >
              View Menu & Order
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCook && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Tap on a cook marker to see their menu
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockCooksOnMap.length} cooks available within {distanceFilter}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
