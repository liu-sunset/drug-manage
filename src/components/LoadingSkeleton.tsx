import { memo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 bg-white border-[3px] border-pencil/30 space-y-3"
          style={{ borderRadius: "225px 15px 195px 15px / 15px 195px 15px 225px" }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-44" />
        </div>
      ))}
    </div>
  )
})
