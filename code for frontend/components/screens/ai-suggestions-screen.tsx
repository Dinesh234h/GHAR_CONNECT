"use client"

import { useState } from "react"
import { ArrowLeft, Sparkles, X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AiSuggestionsScreenProps {
  onBack: () => void
  onAddMeal: (meal: string) => void
}

const defaultIngredients = ["Rice", "Dal", "Potato", "Onion", "Tomato", "Curd"]

const mockSuggestions = [
  {
    name: "Curd Rice",
    demand: "High demand today",
    demandIcon: "fire",
    suggestedPrice: "Rs. 50-70",
    estimatedPlates: 15,
  },
  {
    name: "Sambar Rice",
    demand: "Trending in your area",
    demandIcon: "trending",
    suggestedPrice: "Rs. 60-80",
    estimatedPlates: 12,
  },
  {
    name: "Lemon Rice",
    demand: "Popular choice",
    demandIcon: "star",
    suggestedPrice: "Rs. 45-65",
    estimatedPlates: 10,
  },
]

export function AiSuggestionsScreen({ onBack, onAddMeal }: AiSuggestionsScreenProps) {
  const [ingredients, setIngredients] = useState<string[]>(defaultIngredients)
  const [newIngredient, setNewIngredient] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("lunch")
  const [capacity, setCapacity] = useState("10")
  const [showResults, setShowResults] = useState(false)

  const addIngredient = () => {
    if (newIngredient && !ingredients.includes(newIngredient)) {
      setIngredients([...ingredients, newIngredient])
      setNewIngredient("")
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const handleGetSuggestions = () => {
    setShowResults(true)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/50">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">AI Dish Suggestions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!showResults ? (
          <>
            {/* Ingredients Input */}
            <div>
              <h2 className="font-semibold text-foreground">
                {"What's in your kitchen today?"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add ingredients and we&apos;ll suggest popular dishes
              </p>

              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Add ingredient..."
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                  className="h-12 rounded-xl flex-1"
                />
                <Button 
                  onClick={addIngredient}
                  className="h-12 px-6"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="px-3 py-2 text-sm gap-1"
                  >
                    {ingredient}
                    <button onClick={() => removeIngredient(ingredient)}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Slot Selection */}
            <div className="mt-8">
              <h2 className="font-semibold text-foreground">For which meal?</h2>
              <div className="flex gap-2 mt-3">
                {["breakfast", "lunch", "dinner"].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-colors",
                      selectedSlot === slot
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity */}
            <div className="mt-6">
              <h2 className="font-semibold text-foreground">How many plates?</h2>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="h-12 rounded-xl mt-3"
              />
            </div>

            {/* Get Suggestions Button */}
            <Button 
              className="w-full h-14 mt-8 text-base font-semibold bg-secondary hover:bg-secondary/90"
              onClick={handleGetSuggestions}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Get suggestions
            </Button>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                Recommended for you
              </h2>
              <button 
                className="text-sm text-primary font-medium"
                onClick={() => setShowResults(false)}
              >
                Edit inputs
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {mockSuggestions.map((dish, index) => (
                <div
                  key={index}
                  className="p-4 bg-card rounded-2xl border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {dish.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        {dish.demandIcon === "trending" ? (
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <span className="text-sm">🔥</span>
                        )}
                        <span className="text-sm text-primary font-medium">
                          {dish.demand}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-secondary/10 text-secondary border-0">
                      {dish.suggestedPrice}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Est. {dish.estimatedPlates} plates today
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => onAddMeal(dish.name)}
                    >
                      Add to menu
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Suggestions based on local demand and your ingredients
            </p>
          </>
        )}
      </div>
    </div>
  )
}
