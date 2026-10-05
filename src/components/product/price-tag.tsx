import { discountPercent, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
  showSave = false,
  className,
}: {
  price: number
  compareAtPrice?: number | null
  size?: "sm" | "md" | "lg"
  showSave?: boolean
  className?: string
}) {
  const off = discountPercent(price, compareAtPrice)
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-3xl sm:text-4xl",
          off > 0 && "text-sale"
        )}
      >
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-lg" : "text-sm")}>
          {formatPrice(compareAtPrice!)}
        </span>
      )}
      {showSave && off > 0 && (
        <span className="rounded-full bg-sale/10 px-2.5 py-0.5 text-xs font-semibold text-sale">
          Save {formatPrice(compareAtPrice! - price)} ({off}%)
        </span>
      )}
    </div>
  )
}
