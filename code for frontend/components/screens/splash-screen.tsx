"use client"

import { ChefHat, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SplashScreenProps {
  onUserSelect: () => void
  onCookSelect: () => void
}

export function SplashScreen({ onUserSelect, onCookSelect }: SplashScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 bg-background">
      {/* Logo */}
      <div className="flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-6">
        <div className="relative">
          <ChefHat className="h-12 w-12 text-primary" />
          <Flame className="h-5 w-5 text-primary absolute -top-1 -right-1" />
        </div>
      </div>

      {/* Brand */}
      <h1 className="text-3xl font-bold text-foreground">GharConnect</h1>
      <p className="text-muted-foreground mt-2">Home food, made for you</p>

      {/* Illustration placeholder - minimal kitchen scene */}
      <div className="w-full max-w-[280px] h-[200px] mt-10 mb-10 rounded-2xl bg-muted/50 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 280 200" className="w-full h-full">
          {/* Simple kitchen line art */}
          <g stroke="currentColor" className="text-primary/40" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Counter */}
            <path d="M40 140 L240 140" />
            {/* Pot */}
            <ellipse cx="100" cy="130" rx="25" ry="8" />
            <path d="M75 130 L75 105 C75 95 125 95 125 105 L125 130" />
            <path d="M85 95 L85 85 M115 95 L115 85" />
            {/* Steam lines */}
            <path d="M90 75 Q95 65 90 55" className="text-secondary/60" />
            <path d="M100 72 Q105 62 100 52" className="text-secondary/60" />
            <path d="M110 75 Q115 65 110 55" className="text-secondary/60" />
            {/* Plate */}
            <ellipse cx="180" cy="135" rx="30" ry="5" />
            <ellipse cx="180" cy="130" rx="22" ry="4" className="text-primary/20" />
            {/* Spoon */}
            <path d="M200 150 L220 120" />
            <ellipse cx="224" cy="115" rx="6" ry="4" transform="rotate(-40 224 115)" />
            {/* Window */}
            <rect x="150" y="50" width="50" height="40" rx="4" />
            <path d="M175 50 L175 90 M150 70 L200 70" />
            {/* Plant */}
            <path d="M60 140 L60 100" />
            <path d="M50 100 Q60 80 70 100" className="text-secondary/60" />
            <path d="M45 105 Q60 85 75 105" className="text-secondary/60" />
          </g>
        </svg>
      </div>

      {/* CTAs */}
      <div className="w-full space-y-3">
        <Button 
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onUserSelect}
        >
          Find home food
        </Button>
        <Button 
          variant="outline"
          className="w-full h-14 text-base font-semibold border-primary text-primary hover:bg-primary/5"
          onClick={onCookSelect}
        >
          {"I'm a home cook"}
        </Button>
      </div>
    </div>
  )
}
