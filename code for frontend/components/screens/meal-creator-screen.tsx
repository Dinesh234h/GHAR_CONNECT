"use client"

import { useState } from "react"
import { ArrowLeft, Camera, Plus, X, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createMeal, createSlot } from "@/services/cook.service"

interface MealCreatorScreenProps {
  onBack: () => void
  onSave: () => void
}

const DIETARY_OPTIONS = [
  { label: "🟢 Veg", value: "veg" },
  { label: "🔴 Non-veg", value: "non_veg" },
  { label: "🕉️ Jain", value: "jain" },
  { label: "🌱 Vegan", value: "vegan" },
]

const CUISINE_TAGS = [
  "south_indian", "north_indian", "punjabi", "bengali",
  "gujarati", "street_food", "tiffin", "home_style"
]

const SPICE_LEVELS = [
  { label: "😌 Mild", value: "mild" },
  { label: "🌶 Medium", value: "medium" },
  { label: "🔥 Spicy", value: "spicy" },
]

interface SlotForm {
  date: string
  start_time: string
  end_time: string
  capacity: number
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0]
}

export function MealCreatorScreen({ onBack, onSave }: MealCreatorScreenProps) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [mealForm, setMealForm] = useState({
    name: "",
    description: "",
    price_inr: "",
    dietary_type: "",
    cuisine_tag: "",
    spice_level: "",
    ingredients: "",
    allergens: "",
  })

  const [slots, setSlots] = useState<SlotForm[]>([
    { date: getTodayDate(), start_time: "12:00", end_time: "13:00", capacity: 8 }
  ])

  const addSlot = () =>
    setSlots(prev => [...prev, { date: getTodayDate(), start_time: "13:00", end_time: "14:00", capacity: 8 }])

  const updateSlot = (i: number, field: keyof SlotForm, value: string | number) => {
    setSlots(prev => {
      const copy = [...prev]
      copy[i] = { ...copy[i], [field]: value }
      return copy
    })
  }

  const removeSlot = (i: number) =>
    setSlots(prev => prev.filter((_, idx) => idx !== i))

  const isValid = () =>
    mealForm.name.length >= 2 &&
    Number(mealForm.price_inr) >= 30 &&
    mealForm.dietary_type !== "" &&
    mealForm.cuisine_tag !== "" &&
    mealForm.spice_level !== "" &&
    slots.length > 0

  const handleSave = async () => {
    if (!isValid()) return
    setSaving(true)
    setSaveError(null)
    try {
      // 1. Create meal
      const ingredientsList = mealForm.ingredients
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
      const allergensList = mealForm.allergens
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)

      await createMeal({
        name: mealForm.name,
        description: mealForm.description,
        price_inr: Number(mealForm.price_inr),
        dietary_type: mealForm.dietary_type,
        cuisine_tag: mealForm.cuisine_tag,
        spice_level: mealForm.spice_level,
        ingredients: ingredientsList,
        allergens: allergensList,
        is_festival_special: false,
      })

      // 2. Create all slots in parallel
      await Promise.all(
        slots.map(slot =>
          createSlot({
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            max_capacity: slot.capacity,
            is_festival_slot: false,
          })
        )
      )

      setSaved(true)
      setTimeout(onSave, 1800)
    } catch (err) {
      setSaveError((err as Error).message || "Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Success screen
  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-4 px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Meal Created! 🎉</h2>
        <p className="text-muted-foreground">
          Your meal and {slots.length} slot{slots.length > 1 ? "s are" : " is"} now live.
          Customers can start ordering!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/50">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Create Meal</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-6">
        {/* Photo placeholder */}
        <div className="w-full aspect-video bg-muted rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-2 border-dashed border-border">
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mt-2">Add meal photo (optional)</span>
        </div>

        {/* Meal Info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Meal Name *</label>
            <Input
              placeholder="e.g., Sambar Rice Combo"
              value={mealForm.name}
              onChange={e => setMealForm(p => ({ ...p, name: e.target.value }))}
              className="h-14 rounded-xl mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="What's included in this meal..."
              value={mealForm.description}
              onChange={e => setMealForm(p => ({ ...p, description: e.target.value }))}
              className="rounded-xl mt-2 min-h-[80px] resize-none"
              maxLength={300}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Price (Rs.) *</label>
            <Input
              type="number"
              placeholder="80"
              min={30}
              max={500}
              value={mealForm.price_inr}
              onChange={e => setMealForm(p => ({ ...p, price_inr: e.target.value }))}
              className="h-14 rounded-xl mt-2"
            />
          </div>
        </div>

        {/* Dietary Type */}
        <div>
          <label className="text-sm font-medium text-foreground">Dietary Type *</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DIETARY_OPTIONS.map(({ label, value }) => (
              <Badge
                key={value}
                variant="outline"
                className={cn(
                  "px-4 py-2 cursor-pointer text-sm transition-all",
                  mealForm.dietary_type === value
                    ? "bg-primary text-primary-foreground border-primary scale-105"
                    : "hover:bg-muted"
                )}
                onClick={() => setMealForm(p => ({ ...p, dietary_type: value }))}
              >{label}</Badge>
            ))}
          </div>
        </div>

        {/* Cuisine Tag */}
        <div>
          <label className="text-sm font-medium text-foreground">Cuisine *</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CUISINE_TAGS.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-all capitalize",
                  mealForm.cuisine_tag === tag
                    ? "bg-secondary text-secondary-foreground border-secondary scale-105"
                    : "hover:bg-muted"
                )}
                onClick={() => setMealForm(p => ({ ...p, cuisine_tag: tag }))}
              >{tag.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div>
          <label className="text-sm font-medium text-foreground">Spice Level *</label>
          <div className="flex gap-2 mt-2">
            {SPICE_LEVELS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setMealForm(p => ({ ...p, spice_level: value }))}
                className={cn(
                  "flex-1 py-3 rounded-xl border text-sm font-medium transition-all",
                  mealForm.spice_level === value
                    ? "bg-primary/10 border-primary text-primary scale-105"
                    : "border-border hover:border-primary/50"
                )}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Ingredients + Allergens */}
        <div>
          <label className="text-sm font-medium text-foreground">Ingredients</label>
          <Input
            placeholder="rice, dal, coconut (comma-separated)"
            value={mealForm.ingredients}
            onChange={e => setMealForm(p => ({ ...p, ingredients: e.target.value }))}
            className="rounded-xl mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Allergens</label>
          <Input
            placeholder="dairy, gluten, peanuts (comma-separated)"
            value={mealForm.allergens}
            onChange={e => setMealForm(p => ({ ...p, allergens: e.target.value }))}
            className="rounded-xl mt-2"
          />
        </div>

        {/* Pickup Slots */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Pickup Slots *
          </label>
          <div className="mt-3 space-y-3">
            {slots.map((slot, i) => (
              <div key={i} className="p-4 bg-card rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground text-sm">Slot {i + 1}</span>
                  {slots.length > 1 && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <Input
                      type="date"
                      value={slot.date}
                      min={getTodayDate()}
                      onChange={e => updateSlot(i, "date", e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                    <Input
                      type="number"
                      value={slot.capacity}
                      min={1} max={10}
                      onChange={e => updateSlot(i, "capacity", Number(e.target.value))}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start time</p>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={e => updateSlot(i, "start_time", e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End time</p>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={e => updateSlot(i, "end_time", e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addSlot}
            className="flex items-center gap-2 mt-3 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add another slot
          </button>
        </div>

        {/* Error */}
        {saveError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{saveError}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-14 text-base font-semibold gap-2"
          onClick={handleSave}
          disabled={!isValid() || saving}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Creating meal...</>
          ) : (
            <>Create meal + {slots.length} slot{slots.length > 1 ? "s" : ""}</>
          )}
        </Button>
      </div>
    </div>
  )
}
