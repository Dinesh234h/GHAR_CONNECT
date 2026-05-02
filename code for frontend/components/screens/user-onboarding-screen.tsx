"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface UserOnboardingScreenProps {
  onBack: () => void
  onComplete: () => void
}

const dietTypes = ["Veg", "Non-veg", "Vegan", "Jain", "Others"]
const cuisineTypes = ["Punjabi", "Maharashtrian", "Bengali", "Bihari", "South Indian", "Gujarati", "Others"]
const allergyTypes = ["Peanut", "Dairy", "Soya", "Gluten", "Nuts", "Others"]
const healthGoals = ["Weight loss", "Weight gain", "Muscle gain", "Protein rich", "Balanced"]
const spiceLevels = ["Low", "Medium", "Spicy", "Fire"]

export function UserOnboardingScreen({ onBack, onComplete }: UserOnboardingScreenProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: "",
    location: "",
    selectedDiet: [] as string[],
    selectedCuisines: [] as string[],
    spiceLevel: [2], // 1 to 4 mapping to spiceLevels
    budget: [150], // 50 to 400
    allergies: [] as string[],
    healthGoal: [] as string[],
  })

  const toggleSelection = (item: string, field: "selectedDiet" | "selectedCuisines" | "allergies" | "healthGoal") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
            <p className="text-muted-foreground mt-2">Let's get to know you better</p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="h-14 rounded-xl mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Location or Address</label>
                <Input
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="h-14 rounded-xl mt-2"
                />
              </div>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">What do you Eat?</h1>
            <p className="text-muted-foreground mt-2">Select your dietary preferences</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {dietTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "px-4 py-3 cursor-pointer text-sm transition-colors rounded-xl",
                    formData.selectedDiet.includes(type)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(type, "selectedDiet")}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Cuisine You Love</h1>
            <p className="text-muted-foreground mt-2">Select the cuisines you enjoy most</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {cuisineTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "px-4 py-3 cursor-pointer text-sm transition-colors rounded-xl",
                    formData.selectedCuisines.includes(type)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(type, "selectedCuisines")}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </>
        )

      case 4:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Spice Level</h1>
            <p className="text-muted-foreground mt-2">How spicy do you like your food?</p>

            <div className="mt-12 px-2">
              <Slider
                value={formData.spiceLevel}
                onValueChange={(val) => setFormData(prev => ({ ...prev, spiceLevel: val }))}
                max={4}
                min={1}
                step={1}
                className="mt-4"
              />
              <div className="flex justify-between text-sm font-medium text-muted-foreground mt-4">
                {spiceLevels.map((level, idx) => (
                  <span 
                    key={level}
                    className={cn(
                      formData.spiceLevel[0] === idx + 1 && "text-primary font-bold"
                    )}
                  >
                    {level}
                  </span>
                ))}
              </div>
            </div>
          </>
        )

      case 5:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Budget per Meal</h1>
            <p className="text-muted-foreground mt-2">Set your comfortable spending range</p>

            <div className="mt-12 px-2">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-primary">Rs. {formData.budget[0]}</span>
              </div>
              <Slider
                value={formData.budget}
                onValueChange={(val) => setFormData(prev => ({ ...prev, budget: val }))}
                max={400}
                min={50}
                step={10}
                className="mt-4"
              />
              <div className="flex justify-between text-sm font-medium text-muted-foreground mt-4">
                <span>Rs. 50</span>
                <span>Rs. 400</span>
              </div>
            </div>
          </>
        )

      case 6:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Any allergies or intolerances?</h1>
            <p className="text-muted-foreground mt-2">Let us know what to avoid</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {allergyTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "px-4 py-3 cursor-pointer text-sm transition-colors rounded-xl",
                    formData.allergies.includes(type)
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(type, "allergies")}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </>
        )

      case 7:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Health Goal (Optional)</h1>
            <p className="text-muted-foreground mt-2">We'll recommend meals that fit your goals</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {healthGoals.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "px-4 py-3 cursor-pointer text-sm transition-colors rounded-xl",
                    formData.healthGoal.includes(type)
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleSelection(type, "healthGoal")}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex flex-col h-full px-6 pt-4 pb-8 bg-background">
      {/* Header */}
      <button 
        onClick={step > 1 ? () => setStep(step - 1) : onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      {/* Progress */}
      <div className="flex gap-1 mt-6">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div 
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 mt-8 overflow-y-auto">
        {renderStep()}
      </div>

      {/* CTA */}
      <Button 
        className={cn(
          "w-full h-14 mt-6 text-base font-semibold",
          step === 7 
            ? "bg-primary hover:bg-primary/90"
            : "bg-primary hover:bg-primary/90"
        )}
        onClick={handleNext}
      >
        {step === 7 ? "Find Cook Nearby Me" : "Continue"}
      </Button>
    </div>
  )
}
