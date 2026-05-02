"use client"

import { useState } from "react"
import { Phone, Mic, ChevronRight, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

interface UserOrdersScreenProps {
  onOrderSelect: (orderId: string) => void
  userType?: "user" | "cook"
}

type OrderStatus = "pending" | "confirmed" | "ready" | "completed"

interface Order {
  id: string
  cookName: string
  cookAvatar: string
  meal: string
  slot: string
  status: OrderStatus
  countdown?: string
  location: string
}

const mockUpcomingOrders: Order[] = [
  {
    id: "1",
    cookName: "Lakshmi Devi",
    cookAvatar: "",
    meal: "Sambar Rice Combo",
    slot: "12:30 PM",
    status: "confirmed",
    countdown: "In 45 min",
    location: "Koramangala 4th Block",
  },
  {
    id: "2",
    cookName: "Geeta Sharma",
    cookAvatar: "",
    meal: "Rajma Chawal",
    slot: "1:00 PM",
    status: "pending",
    countdown: "Waiting...",
    location: "Indiranagar",
  },
]

const mockPastOrders: Order[] = [
  {
    id: "3",
    cookName: "Meenakshi K",
    cookAvatar: "",
    meal: "Idli Vada Combo",
    slot: "Yesterday",
    status: "completed",
    location: "Koramangala",
  },
  {
    id: "4",
    cookName: "Lakshmi Devi",
    cookAvatar: "",
    meal: "Full Meals",
    slot: "2 days ago",
    status: "completed",
    location: "Koramangala 4th Block",
  },
]

export function UserOrdersScreen({ onOrderSelect, userType = "user" }: UserOrdersScreenProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [upcomingOrders, setUpcomingOrders] = useState(mockUpcomingOrders)

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setUpcomingOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  const orders = activeTab === "upcoming" ? upcomingOrders : mockPastOrders

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border/50">
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "upcoming"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "past"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            Past
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h3 className="font-semibold text-foreground">No orders yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start exploring cooks nearby
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={order.cookAvatar} alt={order.cookName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {order.cookName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">
                          {order.cookName}
                        </h3>
                        {order.countdown && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            {order.countdown}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.meal}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{order.slot}</span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      expandedOrder === order.id && "rotate-90"
                    )} />
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedOrder === order.id && activeTab === "upcoming" && (
                  <div className="px-4 pb-4 border-t border-border/50">
                    {/* Map */}
                    <div className="mt-4 h-[80px] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-secondary/10" />
                      <div className="flex items-center gap-2 z-10">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{order.location}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-2 h-10 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 h-10 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                        <Mic className="h-4 w-4" />
                        Voice message
                      </button>
                    </div>

                    {/* Cook specific actions */}
                    {userType === "cook" && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                        {order.status === "pending" && (
                          <button onClick={() => handleUpdateStatus(order.id, "confirmed")} className="flex-1 flex items-center justify-center gap-2 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                            Accept Order
                          </button>
                        )}
                        {order.status === "confirmed" && (
                          <button onClick={() => handleUpdateStatus(order.id, "ready")} className="flex-1 flex items-center justify-center gap-2 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                            Start Preparing
                          </button>
                        )}
                        {order.status === "ready" && (
                          <button onClick={() => handleUpdateStatus(order.id, "completed")} className="flex-1 flex items-center justify-center gap-2 h-10 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90 transition-colors">
                            Ready for Pickup
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Rate button for past orders */}
                {activeTab === "past" && userType !== "cook" && (
                  <button 
                    onClick={() => onOrderSelect(order.id)}
                    className="w-full p-3 border-t border-border/50 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    Rate this order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
