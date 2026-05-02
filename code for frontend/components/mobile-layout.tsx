"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobileLayoutProps {
  children: ReactNode
  className?: string
  showSafeArea?: boolean
}

export function MobileLayout({ children, className, showSafeArea = true }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-4">
      <div 
        className={cn(
          "relative w-full max-w-[393px] h-[852px] bg-background rounded-[3rem] overflow-hidden shadow-2xl",
          "border-[8px] border-charcoal",
          className
        )}
      >
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-charcoal rounded-b-3xl z-50" />
        
        {/* Screen content */}
        <div className={cn(
          "h-full w-full overflow-y-auto overflow-x-hidden",
          showSafeArea && "pt-12 pb-8"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
