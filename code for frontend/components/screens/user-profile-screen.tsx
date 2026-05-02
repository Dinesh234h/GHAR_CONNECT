"use client"

import { ChevronRight, LogOut, MapPin, Bell, Settings, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface UserProfileScreenProps {
  onLogout: () => void
}

const dietaryPreferences = ["Veg", "Non-veg", "Jain", "Vegan"]

export function UserProfileScreen({ onLogout }: UserProfileScreenProps) {
  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-6 bg-card border-b border-border/50">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              RK
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">Rahul Kumar</h1>
            <p className="text-muted-foreground">+91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Preferences */}
        <div className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Dietary Preferences
          </h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {dietaryPreferences.map((pref, index) => (
              <Badge
                key={pref}
                variant="outline"
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-colors",
                  index === 0 
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "hover:bg-muted"
                )}
              >
                {pref}
              </Badge>
            ))}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="p-4 border-t border-border/50">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Saved Addresses
          </h2>
          <div className="mt-3 space-y-2">
            {[
              { label: "Home", address: "123, 4th Block, Koramangala, Bengaluru" },
              { label: "Office", address: "WeWork, Indiranagar, Bengaluru" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50"
              >
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.address}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
            <button className="w-full p-3 text-sm text-primary font-medium text-center">
              + Add new address
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="p-4 border-t border-border/50">
          <button className="w-full flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <span className="font-medium text-foreground">Order History</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Notifications */}
        <div className="p-4 border-t border-border/50">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Notifications
          </h2>
          <div className="mt-3 space-y-2">
            {[
              { label: "Order updates", enabled: true },
              { label: "Festival specials", enabled: true },
              { label: "New cooks nearby", enabled: false },
              { label: "Promotions", enabled: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{item.label}</span>
                </div>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="p-4 border-t border-border/50">
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Help & Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 pb-8">
          <button 
            onClick={onLogout}
            className="w-full p-3 text-destructive font-medium text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="h-5 w-5" />
              Sign out
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
