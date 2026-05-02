"use client"

import { ArrowLeft, Star, MapPin, CheckCircle, Clock, Users, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface CookProfileScreenProps {
  cookId: string
  onBack: () => void
  onOrder: () => void
}

const mockCook = {
  id: "1",
  name: "Lakshmi Devi",
  avatar: "",
  rating: 4.8,
  orderCount: 156,
  repeatRate: 68,
  responseTime: "< 1 min",
  bio: "Home cook with 15 years of experience. Specializing in authentic South Indian cuisine with fresh ingredients from local markets.",
  mealTypes: ["South Indian", "Veg", "Tiffin"],
  verified: true,
  menu: {
    breakfast: [
      { id: "m1", name: "Idli Sambar", description: "3 Soft idlis with sambar and chutney", price: 40 },
      { id: "m2", name: "Poha", description: "Flattened rice with peanuts and spices", price: 35 },
    ],
    lunch: [
      { id: "m3", name: "Curd Rice Combo", description: "Curd rice with pickle and papad", price: 60 },
      { id: "m4", name: "Sambar Rice Combo", description: "Sambar rice with poriyal and buttermilk", price: 80 },
    ],
    dinner: [
      { id: "m5", name: "Chapati & Kurma", description: "3 chapatis with vegetable kurma", price: 70 },
      { id: "m6", name: "Dal Khichdi", description: "Comforting dal khichdi with ghee", price: 90 },
    ]
  },
  slots: [
    { id: "s1", time: "12:00 PM", platesLeft: 8 },
    { id: "s2", time: "12:30 PM", platesLeft: 5 },
    { id: "s3", time: "1:00 PM", platesLeft: 3 },
    { id: "s4", time: "1:30 PM", platesLeft: 6 },
  ],
  reviews: [
    { id: "r1", user: "Rahul", rating: 5, text: "Tastes exactly like mom's cooking!", date: "2 days ago" },
    { id: "r2", user: "Priya", rating: 4, text: "Fresh and delicious. Will order again.", date: "1 week ago" },
    { id: "r3", user: "Amit", rating: 5, text: "Best sambar in the neighborhood!", date: "2 weeks ago" },
  ],
}

export function CookProfileScreen({ onBack, onOrder }: CookProfileScreenProps) {
  const [activeCategory, setActiveCategory] = useState<"breakfast" | "lunch" | "dinner">("lunch")
  const [cart, setCart] = useState<string[]>([])

  const handleAddToCart = (id: string) => {
    if (!cart.includes(id)) {
      setCart(prev => [...prev, id])
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Map Hero */}
      <div className="relative h-[180px] bg-muted">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-secondary/20" />
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Map Pin */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        {/* Avatar */}
        <Avatar className="absolute -bottom-10 left-4 h-20 w-20 border-4 border-card shadow-lg">
          <AvatarImage src={mockCook.avatar} alt={mockCook.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {mockCook.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-14 pb-24">
        {/* Cook Info */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{mockCook.name}</h1>
              {mockCook.verified && (
                <CheckCircle className="h-5 w-5 text-secondary fill-secondary/20" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-secondary/10 text-secondary border-0">
                Trusted
              </Badge>
              <span className="text-sm text-muted-foreground">Verified kitchen</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{mockCook.rating}</span>
          </div>
          <span className="text-muted-foreground text-sm">{mockCook.orderCount} orders</span>
          <span className="text-muted-foreground text-sm">|</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{mockCook.repeatRate}% repeat</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{mockCook.responseTime}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-muted-foreground mt-4 leading-relaxed">{mockCook.bio}</p>

        {/* Special Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            🏆 Top cook of month
          </Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            🔍 Kitchen inspected
          </Badge>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            ⭐ {mockCook.rating} Ratings
          </Badge>
        </div>

        {/* Menu Categories */}
        <div className="mt-8">
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            {(["breakfast", "lunch", "dinner"] as const).map((cat) => (
              <button
                key={cat}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors",
                  activeCategory === cat 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="mt-4 space-y-3">
            {mockCook.menu[activeCategory].map((meal) => (
              <div 
                key={meal.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{meal.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
                  <span className="inline-block mt-2 font-semibold text-primary">Rs. {meal.price}</span>
                </div>
                <Button 
                  size="sm" 
                  variant={cart.includes(meal.id) ? "secondary" : "outline"}
                  className={cn(
                    "shrink-0 h-9 rounded-lg gap-1.5",
                    cart.includes(meal.id) && "bg-primary/10 text-primary border-primary/20"
                  )}
                  onClick={() => handleAddToCart(meal.id)}
                >
                  {cart.includes(meal.id) ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Add to cart
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Available Slots */}
        <div className="mt-6">
          <h2 className="font-semibold text-foreground">Available Pickup Slots</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {mockCook.slots.map((slot) => (
              <button
                key={slot.id}
                className={cn(
                  "px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                  slot.platesLeft <= 3
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary"
                )}
              >
                {slot.time}
                <span className="text-xs ml-1 text-muted-foreground">
                  ({slot.platesLeft} left)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="font-semibold text-foreground">Recent Reviews</h2>
          <div className="mt-3 space-y-3">
            {mockCook.reviews.map((review) => (
              <div 
                key={review.id}
                className="p-4 bg-card rounded-xl border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{review.user}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{review.text}</p>
                <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] p-4 bg-card border-t border-border">
        <Button 
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onOrder}
        >
          Order now
        </Button>
      </div>
    </div>
  )
}
