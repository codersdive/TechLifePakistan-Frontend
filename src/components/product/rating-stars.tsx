import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingStars({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number
  count?: number
  size?: "sm" | "md"
  className?: string
}) {
  // Products without reviews show no rating rather than an empty/fake score.
  if (count === 0) return null
  const iconSize = size === "sm" ? "size-3.5" : "size-4.5"
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative flex" aria-label={`Rated ${rating} out of 5`} role="img">
        <div className="flex text-muted-foreground/30">
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn(iconSize, "fill-current")} />)}
        </div>
        <div className="absolute inset-0 flex overflow-hidden text-rating" style={{ width: `${(rating / 5) * 100}%` }}>
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn(iconSize, "shrink-0 fill-current")} />)}
        </div>
      </div>
      {count != null && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  )
}
