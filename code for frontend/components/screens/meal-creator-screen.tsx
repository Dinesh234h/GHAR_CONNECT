"use client"

import { useState } from "react"
import { ArrowLeft, Camera, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MealCreatorScreenProps {
  onBack: () => void
  onSave: () => void
}

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks", "Sweets"]
const dietaryTags = ["Veg", "Non-veg", "Jain", "Vegan", "Gluten-free"]

export function MealCreatorScreen({ onBack, onSave }: MealCreatorScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    selectedMealTypes: [] as string[],
    selectedDietTags: [] as string[],
    slots: [
      { date: "Today", startTime: "12:00 PM", endTime: "1:00 PM", capacity: 10 }
    ],
  })

  const toggleSelection = (item: string, field: "selectedMealTypes" | "selectedDietTags") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const addSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [...prev.slots, { date: "Today", startTime: "1:00 PM", endTime: "2:00 PM", capacity: 10 }]
    }))
  }

  const updateSlot = (index: number, field: keyof typeof formData.slots[0], value: any) => {
    setFormData(prev => {
      const newSlots = [...prev.slots]
      newSlots[index] = { ...newSlots[index], [field]: value }
      return { ...prev, slots: newSlots }
    })
  }

  const removeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }))
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
        <h1 className="font-semibold text-foreground">Create Meal</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        {/* Photo Upload */}
        <div className="w-full aspect-video bg-muted rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mt-2">Add meal photo</span>
        </div>

        {/* Basic Info */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Meal Name</label>
            <Input
              placeholder="e.g., Sambar Rice Combo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-14 rounded-xl mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="What's included in this meal..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="rounded-xl mt-2 min-h-[80px] resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Price (Rs.)</label>
            <Input
              type="number"
              placeholder="80"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="h-14 rounded-xl mt-2"
            />
          </div>
        </div>

        {/* Meal Type */}
        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Meal Type</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {mealTypes.map((type) => (
              <Badge
                key={type}
                variant="outline"
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-colors",
                  formData.selectedMealTypes.includes(type)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
                onClick={() => toggleSelection(type, "selectedMealTypes")}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Dietary</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {dietaryTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-colors",
                  formData.selectedDietTags.includes(tag)
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "hover:bg-muted"
                )}
                onClick={() => toggleSelection(tag, "selectedDietTags")}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Pickup Slots</label>
          <div className="mt-2 space-y-3">
            {formData.slots.map((slot, index) => (
              <div 
                key={index}
                className="p-4 bg-card rounded-xl border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">Slot {index + 1}</span>
                  {formData.slots.length > 1 && (
                    <button 
                      onClick={() => removeSlot(index)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Day</p>
                    <Input 
                      value={slot.date} 
                      onChange={(e) => updateSlot(index, "date", e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <Input 
                      value={slot.startTime} 
                      onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                    <Input 
                      type="number"
                      value={slot.capacity}
                      onChange={(e) => updateSlot(index, "capacity", Number(e.target.value))}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={addSlot}
            className="flex items-center gap-2 mt-3 text-sm text-primary font-medium"
          >
            <Plus className="h-4 w-4" />
            Add another slot
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] p-4 bg-card border-t border-border">
        <Button 
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onSave}
        >
          Create menu
        </Button>
      </div>
    </div>
  )
}
