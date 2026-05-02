"use client"

import { useState } from "react"
import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RatingScreenProps {
  orderId: string
  onBack: () => void
  onSubmit: () => void
}

const tagOptions = [
  "Tasty", "Generous portion", "Homestyle", "Punctual", 
  "Great packaging", "Fresh ingredients", "Value for money"
]

export function RatingScreen({ onBack, onSubmit }: RatingScreenProps) {
  const [rating, setRating] = useState(0)
  const [subRatings, setSubRatings] = useState({
    taste: 0,
    packaging: 0,
    punctuality: 0,
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const setSubRating = (key: keyof typeof subRatings, value: number) => {
    setSubRatings(prev => ({ ...prev, [key]: value }))
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
        <h1 className="font-semibold text-foreground">Rate your meal</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Cook Info */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt="Lakshmi Devi" />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              LD
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            How was your meal from Lakshmi Devi?
          </h2>
        </div>

        {/* Main Rating */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1"
            >
              <Star 
                className={cn(
                  "h-10 w-10 transition-colors",
                  star <= rating 
                    ? "fill-amber-400 text-amber-400" 
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>

        {/* Sub Ratings */}
        <div className="mt-8 space-y-4">
          {[
            { key: "taste" as const, label: "Taste" },
            { key: "packaging" as const, label: "Packaging" },
            { key: "punctuality" as const, label: "Punctuality" },
          ].map(({ key, label }) => (
            <div key={key}>
              <p className="text-sm font-medium text-foreground mb-2">{label}</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSubRating(key, star)}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                      star <= subRatings[key]
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary"
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
                  "px-3 py-2 cursor-pointer text-sm transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-secondary text-secondary-foreground border-secondary"
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
          <p className="text-sm font-medium text-foreground mb-2">Tell us more (optional)</p>
          <Textarea
            placeholder="Share your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="rounded-xl resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-card border-t border-border">
        <Button 
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onSubmit}
          disabled={rating === 0}
        >
          Submit review
        </Button>
        <button 
          className="w-full mt-3 text-sm text-muted-foreground"
          onClick={onBack}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
