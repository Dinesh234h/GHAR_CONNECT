"use client"

import { ArrowLeft, CheckCircle, AlertCircle, Bell, Mic, Star, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationsScreenProps {
  onBack: () => void
  onNotificationClick: (id: string, type: string) => void
}

type NotificationType = "confirmed" | "timeout" | "festival" | "rating" | "voice"

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "confirmed",
    title: "Order confirmed!",
    description: "Lakshmi Devi accepted your order. Pickup at 12:30 PM",
    timestamp: "Just now",
    read: false,
  },
  {
    id: "2",
    type: "voice",
    title: "New voice message",
    description: "Geeta Sharma sent you a voice message",
    timestamp: "5 min ago",
    read: false,
  },
  {
    id: "3",
    type: "festival",
    title: "Diwali specials nearby!",
    description: "6 cooks are preparing festive treats",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    type: "rating",
    title: "Rate your meal",
    description: "How was your meal from Meenakshi K?",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "timeout",
    title: "Order timed out",
    description: "Cook couldn't accept. Try other cooks nearby",
    timestamp: "2 days ago",
    read: true,
  },
]

const typeStyles: Record<NotificationType, { border: string; icon: React.ElementType; iconColor: string }> = {
  confirmed: { border: "border-l-secondary", icon: CheckCircle, iconColor: "text-secondary" },
  timeout: { border: "border-l-amber-500", icon: AlertCircle, iconColor: "text-amber-500" },
  festival: { border: "border-l-primary", icon: Bell, iconColor: "text-primary" },
  rating: { border: "border-l-purple-500", icon: Star, iconColor: "text-purple-500" },
  voice: { border: "border-l-blue-500", icon: Mic, iconColor: "text-blue-500" },
}

export function NotificationsScreen({ onBack, onNotificationClick }: NotificationsScreenProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Notifications</h1>
        </div>
        <button className="text-sm text-primary font-medium">
          Mark all read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {"We'll notify you when something happens"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {mockNotifications.map((notification) => {
              const style = typeStyles[notification.type]
              const Icon = style.icon
              
              return (
                <button
                  key={notification.id}
                  onClick={() => onNotificationClick(notification.id, notification.type)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors border-l-4",
                    style.border,
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      notification.read ? "bg-muted" : "bg-card"
                    )}>
                      <Icon className={cn("h-5 w-5", style.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={cn(
                          "font-medium text-foreground truncate",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h3>
                        <button className="p-1 hover:bg-muted rounded-full flex-shrink-0">
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
