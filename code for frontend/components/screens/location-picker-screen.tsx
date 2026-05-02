"use client"

import { useState } from "react"
import { ArrowLeft, Search, MapPin, Navigation, Home, Briefcase, Heart, Clock, ChevronRight, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LocationPickerScreenProps {
  onBack: () => void
  onSelectLocation: (location: SavedLocation) => void
}

interface SavedLocation {
  id: string
  name: string
  address: string
  type: "home" | "work" | "other" | "recent"
  isDefault?: boolean
}

const savedLocations: SavedLocation[] = [
  {
    id: "1",
    name: "Home",
    address: "Flat 302, Lake View Apartments, Indiranagar 1st Stage",
    type: "home",
    isDefault: true,
  },
  {
    id: "2",
    name: "Office",
    address: "WeWork Galaxy, Residency Road, Ashok Nagar",
    type: "work",
  },
  {
    id: "3",
    name: "Gym",
    address: "Gold's Gym, 100 Feet Road, Koramangala",
    type: "other",
  },
]

const recentLocations: SavedLocation[] = [
  {
    id: "r1",
    name: "Cubbon Park",
    address: "Cubbon Park, Kasturba Road, Bangalore",
    type: "recent",
  },
  {
    id: "r2",
    name: "Mantri Square Mall",
    address: "Mantri Square, Sampige Road, Malleshwaram",
    type: "recent",
  },
]

const searchSuggestions = [
  { id: "s1", name: "Indiranagar Metro Station", address: "100 Feet Road, Indiranagar" },
  { id: "s2", name: "Indira Nagar Double Road", address: "Double Road, Indiranagar" },
  { id: "s3", name: "Indiranagar BDA Complex", address: "12th Main, Indiranagar" },
]

export function LocationPickerScreen({ onBack, onSelectLocation }: LocationPickerScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [locating, setLocating] = useState(false)

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-5 w-5 text-primary" />
      case "work":
        return <Briefcase className="h-5 w-5 text-secondary" />
      case "other":
        return <Heart className="h-5 w-5 text-amber-500" />
      case "recent":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <MapPin className="h-5 w-5 text-muted-foreground" />
    }
  }

  const handleUseCurrentLocation = () => {
    setLocating(true)
    // Simulate geolocation
    setTimeout(() => {
      setLocating(false)
      onSelectLocation({
        id: "current",
        name: "Current Location",
        address: "Near HDFC Bank, 12th Main Road, Indiranagar",
        type: "other",
      })
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-lg text-foreground">Select Location</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearching(e.target.value.length > 0)
              }}
              className="pl-12 h-12 bg-muted/50 border-0 rounded-xl text-base"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Use Current Location */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            locating ? "bg-primary/10" : "bg-secondary/10"
          )}>
            {locating ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation className="h-5 w-5 text-secondary" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">
              {locating ? "Locating..." : "Use current location"}
            </p>
            <p className="text-sm text-muted-foreground">Using GPS</p>
          </div>
        </button>

        {/* Search Results */}
        {isSearching && (
          <div className="p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">SEARCH RESULTS</h2>
            <div className="space-y-1">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => onSelectLocation({
                    id: suggestion.id,
                    name: suggestion.name,
                    address: suggestion.address,
                    type: "other",
                  })}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground truncate">{suggestion.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{suggestion.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Places */}
        {!isSearching && (
          <>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">SAVED PLACES</h2>
                <button className="flex items-center gap-1 text-primary text-sm font-medium">
                  <Plus className="h-4 w-4" />
                  Add new
                </button>
              </div>
              
              <div className="space-y-1">
                {savedLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => onSelectLocation(location)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                      {getLocationIcon(location.type)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{location.name}</p>
                        {location.isDefault && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{location.address}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Locations */}
            <div className="p-4 pt-0">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">RECENT</h2>
              <div className="space-y-1">
                {recentLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => onSelectLocation(location)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                      {getLocationIcon(location.type)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-foreground text-sm">{location.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{location.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Map Picker Button */}
      <div className="p-4 bg-card border-t border-border/50">
        <Button 
          variant="outline" 
          className="w-full h-12 gap-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <MapPin className="h-5 w-5" />
          Pick from map
        </Button>
      </div>
    </div>
  )
}
