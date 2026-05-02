"use client"

import { Home, ClipboardList, Heart, User, Sparkles, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  isActive?: boolean
}

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  variant?: "user" | "cook"
}

const userNavItems: NavItem[] = [
  { icon: Home, label: "Home", href: "home" },
  { icon: Sparkles, label: "AI Insight", href: "ai-insight" },
  { icon: ClipboardList, label: "Orders", href: "orders" },
  { icon: CalendarDays, label: "Subscribe", href: "subscription" },
  { icon: User, label: "Profile", href: "profile" },
]

const cookNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "dashboard" },
  { icon: Sparkles, label: "AI Suggest", href: "ai-suggestions" },
  { icon: ClipboardList, label: "Orders", href: "orders" },
  { icon: User, label: "Profile", href: "profile" },
]

export function BottomNav({ activeTab, onTabChange, variant = "user" }: BottomNavProps) {
  const navItems = variant === "user" ? userNavItems : cookNavItems

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] bg-card border-t border-border px-4 py-2 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.href
          
          return (
            <button
              key={item.href}
              onClick={() => onTabChange(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[64px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                "text-xs",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
