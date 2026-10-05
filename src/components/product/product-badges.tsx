import { discountPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const off = discountPercent(product.price, product.compareAtPrice)
  const out = product.stock <= 0
  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      {out ? (
        <span className="rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background">Sold out</span>
      ) : off > 0 ? (
        <span className="rounded-full bg-sale px-2.5 py-1 text-[11px] font-bold text-sale-foreground shadow-sm shadow-sale/30">-{off}%</span>
      ) : null}
      {product.badges?.includes("new") && (
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">New</span>
      )}
      {product.badges?.includes("bestseller") && (
        <span className="rounded-full bg-brand-accent px-2.5 py-1 text-[11px] font-semibold text-brand-accent-foreground">Best seller</span>
      )}
    </div>
  )
}
