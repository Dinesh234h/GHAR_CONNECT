"use client"

import { CalendarDays, CheckCircle2, Crown, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SubscriptionScreen() {
  return (
    <div className="flex flex-col h-full bg-background px-4 pt-6 pb-24 overflow-y-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meal Plans</h1>
        <p className="text-muted-foreground mt-2">Subscribe to home-cooked meals and save</p>
      </div>

      <div className="space-y-6">
        {/* Monthly Plan */}
        <div className="relative p-6 bg-card rounded-2xl border-2 border-primary shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            MOST POPULAR
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Monthly Plan</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">30 days of hassle-free meals</p>
            </div>
          </div>

          <div className="mt-4 mb-6">
            <span className="text-3xl font-bold text-foreground">Rs. 2400</span>
            <span className="text-muted-foreground"> / month</span>
            <p className="text-xs text-green-600 font-medium mt-1">Save 20% compared to daily orders</p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Choose different cooks every day</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Pause/resume anytime</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Priority customer support</span>
            </li>
          </ul>

          <Button className="w-full h-12 text-base font-semibold">
            Select Monthly
          </Button>
        </div>

        {/* Weekly Plan */}
        <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-secondary" />
                <h2 className="text-xl font-bold text-foreground">Weekly Plan</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">7 days of home-cooked goodness</p>
            </div>
          </div>

          <div className="mt-4 mb-6">
            <span className="text-3xl font-bold text-foreground">Rs. 600</span>
            <span className="text-muted-foreground"> / week</span>
            <p className="text-xs text-green-600 font-medium mt-1">Save 10% compared to daily orders</p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
              <span>Flexible menu selection</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
              <span>Cancel anytime</span>
            </li>
          </ul>

          <Button variant="outline" className="w-full h-12 text-base font-semibold border-primary/20 hover:bg-primary/5 text-primary">
            Select Weekly
          </Button>
        </div>

        {/* Customizable Plan */}
        <div className="p-6 bg-muted/50 rounded-2xl border border-dashed border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground">Custom Plan</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Don't need food every day?</p>
            </div>
          </div>

          <div className="mt-4 mb-4">
            <p className="text-sm text-foreground font-medium">Pick exactly which days you want food delivery (e.g. only Mon, Wed, Fri).</p>
          </div>

          <Button variant="secondary" className="w-full h-10 font-semibold bg-background">
            Customize Days
          </Button>
        </div>
      </div>
    </div>
  )
}
