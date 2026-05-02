"use client"

import { useState } from "react"
import { IndianRupee, Star, Shield, Package, Edit3, Plus, Sparkles, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface CookDashboardScreenProps {
  onIncomingOrder: () => void
  onAiSuggestions: () => void
  onEditMenu: () => void
  onCreateMeal: () => void
}

const mockStats = {
  todayOrders: 6,
  earnings: 540,
  rating: 4.8,
  trustScore: 82,
}

const mockIncomingOrders = [
  {
    id: "1",
    buyerName: "Rahul K",
    meal: "Sambar Rice Combo",
    slot: "12:30 PM",
    timeLeft: "2:45",
  },
]

const mockTodaySchedule = [
  { id: "s1", time: "12:00 PM", orders: 3 },
  { id: "s2", time: "12:30 PM", orders: 2 },
  { id: "s3", time: "1:00 PM", orders: 1 },
]

const mockMenu = [
  { id: "m1", name: "Curd Rice Combo", price: 60, orders: 8 },
  { id: "m2", name: "Sambar Rice Combo", price: 80, orders: 12 },
  { id: "m3", name: "Full Meals", price: 120, orders: 5 },
]

const mockAiSuggestions = [
  { name: "Lemon Rice", demand: "High demand today", price: "Rs. 50-70" },
  { name: "Vegetable Biryani", demand: "Trending in your area", price: "Rs. 90-120" },
  { name: "Curd Rice Special", demand: "Popular choice", price: "Rs. 55-75" },
]

export function CookDashboardScreen({ onIncomingOrder, onAiSuggestions, onEditMenu, onCreateMeal }: CookDashboardScreenProps) {
  const [isAvailable, setIsAvailable] = useState(true)
  const [menuItems, setMenuItems] = useState(mockMenu)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", price: 0 })

  const handleEditClick = (item: any) => {
    setEditingItemId(item.id)
    setEditForm({ name: item.name, price: item.price })
  }

  const handleSaveEdit = () => {
    setMenuItems(prev => prev.map(item => 
      item.id === editingItemId 
        ? { ...item, name: editForm.name, price: editForm.price }
        : item
    ))
    setEditingItemId(null)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt="Lakshmi Devi" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                LD
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-muted-foreground text-sm">{getGreeting()}</p>
              <h1 className="font-semibold text-foreground">Lakshmi Devi</h1>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className={cn(
          "flex items-center justify-between mt-4 p-4 rounded-2xl transition-colors",
          isAvailable ? "bg-secondary/10" : "bg-muted"
        )}>
          <div>
            <p className={cn(
              "font-semibold",
              isAvailable ? "text-secondary" : "text-muted-foreground"
            )}>
              {isAvailable ? "Accepting Orders" : "Paused"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isAvailable ? "You're visible to customers" : "Tap to go online"}
            </p>
          </div>
          <Switch
            checked={isAvailable}
            onCheckedChange={setIsAvailable}
            className="data-[state=checked]:bg-secondary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <Package className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground mt-2">{mockStats.todayOrders}</p>
            <p className="text-sm text-muted-foreground">{"Today's orders"}</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-primary mt-2">Rs. {mockStats.earnings}</p>
            <p className="text-sm text-muted-foreground">Earnings today</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <Star className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground mt-2">{mockStats.rating}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-secondary mt-2">{mockStats.trustScore}</p>
            <p className="text-sm text-muted-foreground">Trust score</p>
          </div>
        </div>

        {/* Incoming Orders */}
        {mockIncomingOrders.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Incoming Orders
            </h2>
            <div className="mt-3 space-y-3">
              {mockIncomingOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={onIncomingOrder}
                  className="w-full p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-left hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">{order.meal}</p>
                      <p className="text-sm text-muted-foreground">Pickup: {order.slot}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{order.timeLeft}</p>
                      <p className="text-xs text-amber-600">remaining</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Dish Suggestions
            </h2>
            <button 
              className="text-sm text-primary font-medium"
              onClick={onAiSuggestions}
            >
              View all
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {mockAiSuggestions.map((dish, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50"
              >
                <div>
                  <p className="font-medium text-foreground">{dish.name}</p>
                  <p className="text-xs text-primary">{dish.demand}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{dish.price}</span>
                  <Button size="sm" variant="outline" className="h-8" onClick={onCreateMeal}>
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mt-6">
          <h2 className="font-semibold text-foreground">{"Today's Pickup Schedule"}</h2>
          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2">
            {mockTodaySchedule.map((slot) => (
              <div
                key={slot.id}
                className="flex-shrink-0 px-4 py-3 bg-card rounded-xl border border-border/50 text-center min-w-[100px]"
              >
                <p className="font-semibold text-foreground">{slot.time}</p>
                <p className="text-sm text-muted-foreground">{slot.orders} orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Menu */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Active Menu Today</h2>
            <button 
              className="text-sm text-primary font-medium flex items-center gap-1"
              onClick={onEditMenu}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50"
              >
                {editingItemId === item.id ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={editForm.name} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="h-8 text-sm"
                      />
                      <Input 
                        type="number"
                        value={editForm.price} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="h-8 text-sm w-24"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={handleSaveEdit} className="p-1 text-green-600 bg-green-50 rounded-md">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingItemId(null)} className="p-1 text-red-600 bg-red-50 rounded-md">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">Rs. {item.price}</span>
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-3 h-12 gap-2"
            onClick={onCreateMeal}
          >
            <Plus className="h-4 w-4" />
            Add new meal
          </Button>
        </div>
      </div>
    </div>
  )
}
