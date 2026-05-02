"use client"

import { useState } from "react"
import { ArrowLeft, Camera, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface CookOnboardingScreenProps {
  onBack: () => void
  onComplete: () => void
}

const mealTypes = [
  "South Indian", "North Indian", "Bengali", "Gujarati", 
  "Maharashtrian", "Tiffin", "Snacks", "Sweets", "Others"
]

const dietTypes = ["Veg", "Non-veg", "Jain", "Vegan"]

export function CookOnboardingScreen({ onBack, onComplete }: CookOnboardingScreenProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    selectedMealTypes: [] as string[],
    customMealType: "",
    selectedDietTypes: [] as string[],
    capacity: [10],
    address: "",
    photos: [] as string[],
  })

  const toggleSelection = (item: string, field: "selectedMealTypes" | "selectedDietTypes") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const handleNext = () => {
    if (step < 3) {
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
            <h1 className="text-2xl font-bold text-foreground">Tell us about yourself</h1>
            <p className="text-muted-foreground mt-2">This helps customers know you better</p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-14 rounded-xl mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Short Bio</label>
                <Textarea
                  placeholder="Tell customers about your cooking style..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="rounded-xl mt-2 min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Meal Types</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mealTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn(
                        "px-3 py-2 cursor-pointer text-sm transition-colors",
                        formData.selectedMealTypes.includes(type)
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleSelection(type, "selectedMealTypes")}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
                {formData.selectedMealTypes.includes("Others") && (
                  <div className="mt-3">
                    <Input
                      placeholder="Specify other meal types..."
                      value={formData.customMealType}
                      onChange={(e) => setFormData(prev => ({ ...prev, customMealType: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Dietary Options</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dietTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn(
                        "px-3 py-2 cursor-pointer text-sm transition-colors",
                        formData.selectedDietTypes.includes(type)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleSelection(type, "selectedDietTypes")}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Default Capacity: {formData.capacity[0]} plates
                </label>
                <Slider
                  value={formData.capacity}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, capacity: val }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 plate</span>
                  <span>10 plates</span>
                </div>
              </div>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Set your location</h1>
            <p className="text-muted-foreground mt-2">
              Where are You?
            </p>

            <div className="mt-8">
              {/* Map placeholder */}
              <div className="w-full h-[200px] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-secondary/10" />
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Drag to adjust location</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-foreground">Address</label>
                <Input
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="h-14 rounded-xl mt-2"
                />
              </div>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Add kitchen photos</h1>
            <p className="text-muted-foreground mt-2">
              Photos build trust and get you 3x more orders
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Kitchen interiors photos",
                "Ingredients that cook uses",
                "Sample dishes",
                "Optional"
              ].map((label, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors p-2 text-center",
                    formData.photos[index] && "border-solid border-secondary bg-secondary/5"
                  )}
                >
                  {formData.photos[index] ? (
                    <div className="flex flex-col items-center">
                      <Check className="h-8 w-8 text-secondary" />
                      <span className="text-xs text-secondary mt-1">Uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">{label}</span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-6 p-4 bg-secondary/10 rounded-xl">
              Tip: Show your cooking space, ingredients, and sample dishes!
            </p>
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
      <div className="flex gap-2 mt-6">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              s <= step ? "bg-secondary" : "bg-muted"
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
          step === 3 
            ? "bg-secondary hover:bg-secondary/90"
            : "bg-primary hover:bg-primary/90"
        )}
        onClick={handleNext}
      >
        {step === 3 ? "Submit for verification" : "Continue"}
      </Button>
    </div>
  )
}
