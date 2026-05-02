"use client"

import { motion } from "framer-motion"
import { CheckCircle, Phone, Mic, MapPin, Clock, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderConfirmedScreenProps {
  onViewDetails: () => void
  onCall: () => void
  onVoiceMessage: () => void
  onContinue: () => void
  onNavigate?: () => void
}

const mockOrder = {
  cookName: "Lakshmi Devi",
  cookAvatar: "",
  meal: "Sambar Rice Combo",
  slot: "12:30 PM",
  location: "Koramangala 4th Block",
  orderId: "#1234",
}

export function OrderConfirmedScreen({ onCall, onVoiceMessage, onContinue, onNavigate }: OrderConfirmedScreenProps) {
  return (
    <div className="flex flex-col items-center h-full bg-background px-6 py-8">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
        className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle className="h-12 w-12 text-secondary" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <h1 className="text-2xl font-bold text-foreground">Order confirmed!</h1>
        <p className="text-muted-foreground mt-1">Get ready for a delicious meal</p>
      </motion.div>

      {/* Order Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full mt-8 p-4 bg-card rounded-2xl border border-border/50"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mockOrder.cookAvatar} alt={mockOrder.cookName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {mockOrder.cookName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{mockOrder.cookName}</h3>
            <p className="text-sm text-muted-foreground">{mockOrder.meal}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Pickup time</p>
              <p className="font-medium">{mockOrder.slot}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Pickup location</p>
              <p className="font-medium">{mockOrder.location}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Preview */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onNavigate}
        className="w-full mt-4 h-[100px] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden hover:bg-muted/80 transition-colors"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-secondary/10" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-secondary/30"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
          </svg>
        </div>
        <div className="flex items-center gap-2 z-10 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <Navigation className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">Navigate to pickup</span>
        </div>
      </motion.button>

      {/* Communication Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-3 mt-6 w-full"
      >
        <Button 
          variant="outline"
          className="flex-1 h-12 gap-2"
          onClick={onCall}
        >
          <Phone className="h-4 w-4" />
          Call cook
        </Button>
        <Button 
          variant="outline"
          className="flex-1 h-12 gap-2"
          onClick={onVoiceMessage}
        >
          <Mic className="h-4 w-4" />
          Voice message
        </Button>
      </motion.div>

      {/* Reminder */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-muted-foreground text-center mt-4"
      >
        {"We'll remind you 15 min before pickup"}
      </motion.p>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-auto w-full"
      >
        <Button 
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onContinue}
        >
          Continue browsing
        </Button>
        <button className="w-full mt-3 text-sm text-primary font-medium">
          View order details
        </button>
      </motion.div>
    </div>
  )
}
