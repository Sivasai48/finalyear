"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
      <Skeleton className="w-4/5 h-4/5" />
    </div>
  )
}
