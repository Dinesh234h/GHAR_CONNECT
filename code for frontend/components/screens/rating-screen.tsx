"use client"

import { useState } from "react"
import { ArrowLeft, Star, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { submitRating } from "@/services/order.service"
import { useApi } from "@/hooks/useApi"
import { getOrderById } from "@/services/order.service"
import type { Order } from "@/types/api.types"

interface RatingScreenProps {
  orderId: string
  onBack: () => void
  onSubmit: () => void
}

const tagOptions = [
  "Tasty", "Generous portion", "Homestyle", "Punctual",
  "Great packaging", "Fresh ingredients", "Value for money"
]

export function RatingScreen({ orderId, onBack, onSubmit }: RatingScreenProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [subRatings, setSubRatings] = useState({ taste: 0, hygiene: 0, packaging: 0, value_for_money: 0 })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const { data: order, loading: orderLoading } = useApi<Order>(
    () => getOrderById(orderId),
    [orderId]
  )

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const hasSubRatings = Object.values(subRatings).some(v => v > 0)
      await submitRating({
        order_id: orderId,
        rating_overall: rating,
        text: feedback.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sub_ratings: hasSubRatings ? subRatings : undefined,
      })
      setSubmitted(true)
      setTimeout(onSubmit, 1800)
    } catch (err) {
      setSubmitError((err as Error).message || "Failed to submit rating. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background gap-4">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Thank you!</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Your review helps the cook and other users in the community.
        </p>
      </div>
    )
  }

  const cookInitials = order?.cook_name
    ? order.cook_name.split(" ").map(n => n[0]).join("")
    : "C"

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
        <h1 className="font-semibold text-foreground">Rate your meal</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {/* Cook Info */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {orderLoading ? "..." : cookInitials}
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {orderLoading
              ? "Loading..."
              : `How was your ${order?.meal_name ?? "meal"}?`}
          </h2>
          {order?.cook_name && (
            <p className="text-sm text-muted-foreground mt-1">from {order.cook_name}</p>
          )}
        </div>

        {/* Main Star Rating */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1.5 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "h-10 w-10 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm font-medium mt-2 text-amber-600">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}

        {/* Sub Ratings */}
        <div className="mt-8 space-y-5">
          {[
            { key: "taste" as const, label: "🍛 Taste" },
            { key: "hygiene" as const, label: "✨ Hygiene" },
            { key: "packaging" as const, label: "📦 Packaging" },
            { key: "value_for_money" as const, label: "💰 Value for money" },
          ].map(({ key, label }) => (
            <div key={key}>
              <p className="text-sm font-medium text-foreground mb-2">{label}</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSubRatings(prev => ({ ...prev, [key]: star }))}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                      star <= subRatings[key]
                        ? "bg-primary text-primary-foreground border-primary scale-105"
                        : "bg-card border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-8">
          <p className="text-sm font-medium text-foreground mb-3">What did you like?</p>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-all",
                  selectedTags.includes(tag)
                    ? "bg-primary/10 text-primary border-primary/30 scale-105"
                    : "hover:bg-muted"
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground mb-2">Tell us more <span className="text-muted-foreground font-normal">(optional)</span></p>
          <Textarea
            placeholder="Share your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="rounded-xl resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{feedback.length}/500</p>
        </div>

        {/* Error */}
        {submitError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{submitError}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-14 text-base font-semibold gap-2"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
          ) : "Submit review"}
        </Button>
        <button
          className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={onBack}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
