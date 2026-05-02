"use client"

import { cn } from "@/lib/utils"

type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "timeout"

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-teal-100 text-teal-800 border-teal-200",
  ready: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-muted text-muted-foreground border-border",
  timeout: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready for pickup",
  completed: "Completed",
  timeout: "Timeout",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      statusStyles[status],
      className
    )}>
      {statusLabels[status]}
    </span>
  )
}
