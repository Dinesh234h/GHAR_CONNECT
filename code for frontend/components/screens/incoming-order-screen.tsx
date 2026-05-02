"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IncomingOrderScreenProps {
  onAccept: () => void
  onReject: () => void
}

const mockOrder = {
  buyerName: "Rahul K",
  meal: "Sambar Rice Combo",
  quantity: 1,
  slot: "12:30 PM",
  notes: "Less spicy please",
  price: 80,
}

export function IncomingOrderScreen({ onAccept, onReject }: IncomingOrderScreenProps) {
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onReject()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onReject])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isUrgent = timeLeft < 60

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Urgent Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`px-4 py-4 text-center ${isUrgent ? 'bg-destructive' : 'bg-amber-500'} text-white`}
      >
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="font-bold text-xl">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <p className="text-sm mt-1 opacity-90">
          {isUrgent ? "Respond now!" : "Time to respond"}
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          {/* New Order Badge */}
          <div className="px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="text-primary font-semibold">New Order Request</span>
          </div>

          {/* Meal Info */}
          <h1 className="text-3xl font-bold text-foreground text-center">
            {mockOrder.meal}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {mockOrder.quantity} plate{mockOrder.quantity > 1 ? 's' : ''}
          </p>

          {/* Order Details Card */}
          <div className="w-full mt-8 p-6 bg-card rounded-2xl border border-border/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium text-foreground">{mockOrder.buyerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pickup time</span>
                <span className="font-medium text-foreground">{mockOrder.slot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-primary">Rs. {mockOrder.price}</span>
              </div>
              {mockOrder.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Customer note:</p>
                  <p className="text-foreground mt-1">{mockOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mt-auto"
        >
          <Button
            variant="outline"
            className="flex-1 h-16 text-lg font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onReject}
          >
            Reject
          </Button>
          <Button
            className="flex-1 h-16 text-lg font-semibold bg-secondary hover:bg-secondary/90"
            onClick={onAccept}
          >
            Accept
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
