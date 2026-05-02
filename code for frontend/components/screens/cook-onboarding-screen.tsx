"use client"

import { useState } from "react"
import { ArrowLeft, Camera, MapPin, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { onboardCook } from "@/services/cook.service"
import { useAuth } from "@/context/AuthContext"

interface CookOnboardingScreenProps {
  onBack: () => void
  onComplete: () => void
}

const CUISINE_OPTIONS = [
  "South Indian", "North Indian", "Bengali", "Gujarati",
  "Maharashtrian", "Punjabi", "Tiffin", "Street Food", "Sweets", "Others"
]

const DIET_TYPES: { label: string; value: string }[] = [
  { label: "🟢 Veg", value: "veg" },
  { label: "🔴 Non-veg", value: "non_veg" },
  { label: "🕉️ Jain", value: "jain" },
  { label: "🌱 Vegan", value: "vegan" },
]

export function CookOnboardingScreen({ onBack, onComplete }: CookOnboardingScreenProps) {
  const { updateUser } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    cuisineTags: [] as string[],
    customCuisine: "",
    dietTypes: [] as string[],
    capacity: [5],
    address: "",
  })

  const toggle = (item: string, field: "cuisineTags" | "dietTypes") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const newPhotos = [...photos]
    newPhotos[index] = file
    setPhotos(newPhotos)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const newPreviews = [...photoPreviews]
      newPreviews[index] = ev.target?.result as string
      setPhotoPreviews(newPreviews)
    }
    reader.readAsDataURL(file)
  }

  const validateStep = () => {
    if (step === 1) return formData.name.length >= 2 && formData.bio.length >= 10 && formData.dietTypes.length > 0
    if (step === 2) return formData.address.length >= 5
    return true // step 3 — photos optional
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
      return
    }

    // Step 3: Submit
    setSubmitting(true)
    setSubmitError(null)
    try {
      const cuisineTags = formData.cuisineTags.includes("Others") && formData.customCuisine
        ? [...formData.cuisineTags.filter(c => c !== "Others"), formData.customCuisine]
        : formData.cuisineTags.length > 0
          ? formData.cuisineTags.map(c => c.toLowerCase().replace(" ", "_"))
          : ["home_cooking"]

      await onboardCook(
        {
          name: formData.name,
          bio: formData.bio,
          meal_types: formData.dietTypes,
          cuisine_tags: cuisineTags,
          capacity_default: formData.capacity[0],
          address: formData.address,
        },
        photos.filter(Boolean)
      )

      updateUser({ roles: ["user", "cook"] })
      onComplete()
    } catch (err) {
      setSubmitError((err as Error).message || "Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
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
                <label className="text-sm font-medium text-foreground">Your Name *</label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="h-14 rounded-xl mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Short Bio *</label>
                <Textarea
                  placeholder="Tell customers about your cooking style, specialty, and experience..."
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  className="rounded-xl mt-2 min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{formData.bio.length}/500</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Cuisine Specialties</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUISINE_OPTIONS.map(c => (
                    <Badge
                      key={c}
                      variant="outline"
                      className={cn(
                        "px-3 py-2 cursor-pointer text-sm transition-colors",
                        formData.cuisineTags.includes(c)
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggle(c, "cuisineTags")}
                    >{c}</Badge>
                  ))}
                </div>
                {formData.cuisineTags.includes("Others") && (
                  <Input
                    className="mt-3 rounded-xl"
                    placeholder="Specify cuisine type..."
                    value={formData.customCuisine}
                    onChange={e => setFormData(p => ({ ...p, customCuisine: e.target.value }))}
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Dietary Options *</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DIET_TYPES.map(({ label, value }) => (
                    <Badge
                      key={value}
                      variant="outline"
                      className={cn(
                        "px-3 py-2 cursor-pointer text-sm transition-colors",
                        formData.dietTypes.includes(value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggle(value, "dietTypes")}
                    >{label}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Daily Capacity: <span className="text-primary">{formData.capacity[0]} plates/slot</span>
                </label>
                <Slider
                  value={formData.capacity}
                  onValueChange={val => setFormData(p => ({ ...p, capacity: val }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 plate</span><span>10 plates</span>
                </div>
              </div>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Set your location</h1>
            <p className="text-muted-foreground mt-2">Where do you cook? This helps users find you.</p>

            <div className="mt-8">
              <div className="w-full h-[180px] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-secondary/10" />
                <div className="flex flex-col items-center z-10">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Your kitchen location</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-foreground">Full Address *</label>
                <Textarea
                  placeholder="e.g., 123 MG Road, Koramangala, Bangalore — 560034"
                  value={formData.address}
                  onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="rounded-xl mt-2 resize-none"
                  rows={3}
                />
              </div>

              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-sm text-foreground font-medium">📍 Privacy note</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only your approximate neighbourhood is shown to customers, never your exact address.
                </p>
              </div>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground">Add kitchen photos</h1>
            <p className="text-muted-foreground mt-2">Photos build trust and get you 3× more orders</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Kitchen interiors",
                "Your ingredients",
                "Sample dishes",
                "Optional"
              ].map((label, i) => (
                <label
                  key={i}
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center",
                    photoPreviews[i]
                      ? "border-solid border-primary bg-primary/5"
                      : "border-border hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handlePhotoSelect(e, i)}
                  />
                  {photoPreviews[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreviews[i]} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">{label}</span>
                    </>
                  )}
                </label>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-6 p-4 bg-secondary/10 rounded-xl">
              💡 Tip: Show your cooking space, fresh ingredients, and your best dishes!
            </p>

            {submitError && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}
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
              "h-1.5 flex-1 rounded-full transition-all",
              s < step ? "bg-secondary" : s === step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-2">Step {step} of 3</p>

      {/* Content */}
      <div className="flex-1 mt-6 overflow-y-auto">
        {renderStep()}
      </div>

      {/* CTA */}
      <Button
        className={cn(
          "w-full h-14 mt-6 text-base font-semibold gap-2",
          step === 3 ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
        )}
        onClick={handleNext}
        disabled={!validateStep() || submitting}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
        ) : step === 3 ? (
          <><CheckCircle2 className="h-4 w-4" />Submit for verification</>
        ) : "Continue"}
      </Button>
    </div>
  )
}
