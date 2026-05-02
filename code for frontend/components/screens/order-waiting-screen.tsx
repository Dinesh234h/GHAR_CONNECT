"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderWaitingScreenProps {
  cookName: string
  cookAvatar?: string
  onTimeout: () => void
  onConfirmed: () => void
}

export function OrderWaitingScreen({ cookName, cookAvatar, onConfirmed }: OrderWaitingScreenProps) {
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const progress = (timeLeft / 180) * 100

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Simulate confirmation for demo
          setTimeout(onConfirmed, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Simulate cook accepting after random time for demo
    const acceptTimer = setTimeout(() => {
      clearInterval(timer)
      onConfirmed()
    }, 3000 + Math.random() * 2000)

    return () => {
      clearInterval(timer)
      clearTimeout(acceptTimer)
    }
  }, [onConfirmed])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background px-6">
      {/* Countdown Ring */}
      <div className="relative w-48 h-48">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        {/* Cook Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
            <AvatarImage src={cookAvatar} alt={cookName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {cookName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Timer */}
      <div className="mt-6 text-center">
        <p className="text-4xl font-bold text-foreground">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>

      {/* Status */}
      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Waiting for {cookName}
        </h2>
        <p className="text-muted-foreground mt-1">to confirm your order...</p>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Cancel Link */}
      <button className="mt-auto mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Cancel order
      </button>
    </div>
  )
}
