"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useUI } from "@/stores/ui"
import { PriceTag } from "./price-tag"
import { ProductGallery } from "./product-gallery"
import { ProductPurchase } from "./product-purchase"
import { RatingStars } from "./rating-stars"

export function QuickViewDialog() {
  const product = useUI((s) => s.quickView)
  const setQuickView = useUI((s) => s.setQuickView)

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && setQuickView(null)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-0 sm:max-w-4xl">
        {product && (
          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-2">
            <ProductGallery images={product.images} name={`qv-${product.slug}`} zoom={false} />
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{product.brand?.name} · {product.category.name}</p>
              <DialogTitle className="font-display text-2xl leading-tight font-extrabold">{product.name}</DialogTitle>
              <RatingStars rating={product.rating} count={product.reviewCount} size="md" />
              <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" showSave />
              <DialogDescription className="text-muted-foreground">{product.shortDescription}</DialogDescription>
              <ProductPurchase product={product} compact />
              <Link
                href={`/product/${product.slug}`}
                onClick={() => setQuickView(null)}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                View full details <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
