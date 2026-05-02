"use client"

import { Star, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface CookCardProps {
  cook: {
    id: string
    name: string
    avatar: string
    rating: number
    orderCount: number
    badge?: "trusted" | "top" | "new"
    walkTime: string
    distance: string
    neighborhood: string
    todayMeal: string
    priceRange: string
    availableSlots: string
    slotsLeft: number
  }
  onOrder?: () => void
  onViewProfile?: () => void
}

const badgeStyles = {
  trusted: "bg-secondary text-secondary-foreground",
  top: "bg-primary text-primary-foreground",
  new: "bg-muted text-muted-foreground",
}

const badgeLabels = {
  trusted: "Trusted",
  top: "Top Cook",
  new: "New",
}

export function CookCard({ cook, onOrder, onViewProfile }: CookCardProps) {
  return (
    <div 
      className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onViewProfile}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          <AvatarImage src={cook.avatar} alt={cook.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {cook.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        {/* Cook Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{cook.name}</h3>
            {cook.badge && (
              <Badge className={cn("text-xs py-0 px-2", badgeStyles[cook.badge])}>
                {badgeLabels[cook.badge]}
              </Badge>
            )}
          </div>

          {/* Rating & Orders */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{cook.rating}</span>
            </div>
            <span className="text-muted-foreground text-sm">
              {cook.orderCount} orders
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{cook.walkTime} walk</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{cook.distance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Info */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{cook.neighborhood}</p>
            <p className="font-medium mt-0.5">{cook.todayMeal}</p>
            <p className="text-primary font-semibold mt-0.5">{cook.priceRange}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{cook.availableSlots}</p>
            <p className="text-xs text-secondary font-medium mt-0.5">
              {cook.slotsLeft} left
            </p>
          </div>
        </div>

        <Button 
          className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={(e) => {
            e.stopPropagation()
            onOrder?.()
          }}
        >
          Order now
        </Button>
      </div>
    </div>
  )
}
