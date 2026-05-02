"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, MessageCircle, Navigation, MapPin, Clock, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PickupNavigationScreenProps {
  orderId: string
  cookName: string
  cookAvatar?: string
  pickupTime: string
  onBack: () => void
  onCall: () => void
  onMessage: () => void
  onArrived: () => void
}

const navigationSteps = [
  { id: 1, instruction: "Head north on 12th Main Road", distance: "150m", completed: true },
  { id: 2, instruction: "Turn right onto 100 Feet Road", distance: "200m", completed: true },
  { id: 3, instruction: "Continue straight past Cafe Coffee Day", distance: "180m", completed: false, current: true },
  { id: 4, instruction: "Turn left at the HDFC ATM", distance: "50m", completed: false },
  { id: 5, instruction: "Destination will be on your right", distance: "20m", completed: false },
]

export function PickupNavigationScreen({ 
  cookName, 
  pickupTime,
  onBack, 
  onCall, 
  onMessage, 
  onArrived 
}: PickupNavigationScreenProps) {
  const [expandedDirections, setExpandedDirections] = useState(false)
  const [eta, setEta] = useState(4)
  const [distance, setDistance] = useState(250)

  // Simulate live tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 0.1))
      setDistance(prev => Math.max(0, prev - 5))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const currentStep = navigationSteps.find(s => s.current)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Map Area */}
      <div className="relative flex-1 bg-gradient-to-b from-secondary/5 to-secondary/10">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="navGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-secondary/30"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#navGrid)" />
          </svg>
        </div>

        {/* Simulated Route */}
        <svg className="absolute inset-0" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          {/* Completed route (dotted) */}
          <path
            d="M 200 500 L 200 350"
            stroke="#0F6E56"
            strokeWidth="4"
            strokeDasharray="8 4"
            fill="none"
            opacity="0.5"
          />
          {/* Active route */}
          <path
            d="M 200 350 L 200 250 L 280 250 L 280 150"
            stroke="#0F6E56"
            strokeWidth="5"
            fill="none"
          />
          {/* Remaining route (lighter) */}
          <path
            d="M 280 150 L 280 100"
            stroke="#0F6E56"
            strokeWidth="4"
            strokeDasharray="8 4"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* User Marker (pulsing) */}
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="w-6 h-6 bg-primary rounded-full border-3 border-card shadow-lg flex items-center justify-center">
              <Navigation className="h-3 w-3 text-primary-foreground rotate-45" />
            </div>
            <div className="absolute -inset-2 bg-primary/30 rounded-full animate-ping" />
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute top-[15%] left-[70%] -translate-x-1/2 z-20">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-card">
              <MapPin className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-secondary" />
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg z-30"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* ETA Badge */}
        <div className="absolute top-4 right-4 bg-card rounded-xl shadow-lg p-3 z-30">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">Arrives by</p>
              <p className="font-semibold text-foreground">{pickupTime}</p>
            </div>
          </div>
        </div>

        {/* Current Step Overlay */}
        {currentStep && (
          <div className="absolute top-20 left-4 right-4 bg-secondary text-secondary-foreground rounded-xl shadow-lg p-4 z-30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Navigation className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{currentStep.instruction}</p>
                <p className="text-sm opacity-80">{currentStep.distance}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="bg-card border-t border-border rounded-t-3xl shadow-xl">
        {/* Handle */}
        <button 
          onClick={() => setExpandedDirections(!expandedDirections)}
          className="w-full py-2 flex justify-center"
        >
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </button>

        {/* Live Stats */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Live tracking</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-foreground">{Math.ceil(eta)}</span>
                <span className="text-muted-foreground">min</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{distance}m away</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onMessage}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-foreground" />
              </button>
              <button 
                onClick={onCall}
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/90 transition-colors"
              >
                <Phone className="h-5 w-5 text-secondary-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Cook Info */}
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="flex items-center gap-3 pt-4">
            <Avatar className="h-12 w-12 border-2 border-secondary/20">
              <AvatarImage src="" alt={cookName} />
              <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                {cookName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{cookName}</p>
              <p className="text-sm text-muted-foreground">Your meal is being packed</p>
            </div>
          </div>
        </div>

        {/* Expanded Directions */}
        {expandedDirections && (
          <div className="px-4 pb-4 border-t border-border/50 max-h-48 overflow-y-auto">
            <div className="pt-4 space-y-3">
              {navigationSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3",
                    step.completed && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                    step.completed 
                      ? "bg-secondary text-secondary-foreground" 
                      : step.current 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                  )}>
                    {step.completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      step.current ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {step.instruction}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.distance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand/Collapse */}
        <button 
          onClick={() => setExpandedDirections(!expandedDirections)}
          className="w-full py-3 flex items-center justify-center gap-1 text-sm text-muted-foreground border-t border-border/50"
        >
          {expandedDirections ? (
            <>
              <span>Hide directions</span>
              <ChevronDown className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Show all directions</span>
              <ChevronUp className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Arrived Button */}
        <div className="p-4 pt-0">
          <Button 
            className="w-full h-14 bg-primary hover:bg-primary/90 text-base font-semibold"
            onClick={onArrived}
          >
            {"I've arrived"}
          </Button>
        </div>
      </div>
    </div>
  )
}
