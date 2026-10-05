"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useRef } from "react"
import { Eye, GitCompareArrows, Heart, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAddToCart, useToggleWishlist } from "@/hooks/use-add-to-cart"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"
import { useCompare, useWishlist } from "@/stores/lists"
import { useUI } from "@/stores/ui"
import type { Product } from "@/types"
import { PriceTag } from "./price-tag"
import { ProductBadges } from "./product-badges"
import { RatingStars } from "./rating-stars"

export function ProductCard({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  const imgRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const addToCart = useAddToCart()
  const toggleWish = useToggleWishlist()
  const mounted = useMounted()
  const wishToggle = useWishlist((s) => s.toggle)
  const wished = useWishlist((s) => s.ids.includes(product.documentId)) && mounted
  const compareToggle = useCompare((s) => s.toggle)
  const compared = useCompare((s) => s.ids.includes(product.documentId)) && mounted
  const setQuickView = useUI((s) => s.setQuickView)
  const soldOut = product.stock <= 0
  const hasVariants = !!product.variants?.length
  // Variant products open quick view (with the option picker) instead of adding directly.
  const quickAdd = () => (hasVariants ? setQuickView(product) : addToCart(product, 1, imgRef.current))
  const href = `/product/${product.slug}`

  const actions = [
    {
      label: wished ? "Remove from wishlist" : "Add to wishlist",
      icon: Heart,
      active: wished,
      onClick: () => toggleWish(product, wishToggle),
    },
    { label: "Quick view", icon: Eye, onClick: () => setQuickView(product) },
    {
      label: compared ? "Remove from compare" : "Compare",
      icon: GitCompareArrows,
      active: compared,
      onClick: () => {
        const added = compareToggle(product.documentId)
        toast(added ? "Added to compare" : "Removed from compare", {
          action: added ? { label: "Compare now", onClick: () => router.push("/compare") } : undefined,
        })
      },
    },
  ]

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      <div ref={imgRef} className="relative aspect-square overflow-hidden bg-gradient-to-b from-surface to-muted/60 dark:from-white/[0.09] dark:to-white/[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <Image
            src={product.images[0].url}
            alt={product.images[0].alternativeText ?? product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
            className={cn(
              "object-contain p-6 transition-all duration-500 ease-out group-hover/card:scale-105",
              product.images[1] && "group-hover/card:opacity-0",
              soldOut && "opacity-60 grayscale"
            )}
          />
          {product.images[1] && (
            <Image
              src={product.images[1].url}
              alt=""
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
              className="scale-95 object-contain p-6 opacity-0 transition-all duration-500 ease-out group-hover/card:scale-105 group-hover/card:opacity-100"
            />
          )}
        </Link>

        <ProductBadges product={product} className="pointer-events-none absolute left-3 top-3" />

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {actions.map((a, i) => (
            <Tooltip key={a.label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={a.onClick}
                  aria-label={a.label}
                  aria-pressed={a.active}
                  style={{ transitionDelay: `${i * 50}ms` }}
                  className={cn(
                    "grid size-9 place-items-center rounded-full border bg-background/90 shadow-sm backdrop-blur transition-all duration-300 hover:bg-primary hover:text-primary-foreground",
                    "lg:translate-x-12 lg:opacity-0 lg:group-hover/card:translate-x-0 lg:group-hover/card:opacity-100 lg:focus-visible:translate-x-0 lg:focus-visible:opacity-100",
                    i > 0 && "max-lg:hidden",
                    a.active && "bg-primary text-primary-foreground lg:translate-x-0 lg:opacity-100"
                  )}
                >
                  <a.icon className={cn("size-4", a.active && a.icon === Heart && "fill-current")} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">{a.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-4 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
            <button
              type="button"
              onClick={quickAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ShoppingBag className="size-4" /> {hasVariants ? "Choose options" : "Add to cart"}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="truncate">{product.brand?.name}</span>
          {product.model && <span className="shrink-0 font-mono normal-case tracking-normal">{product.model}</span>}
        </div>
        <Link href={href} className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug transition-colors hover:text-primary">
          {product.name}
        </Link>
        <RatingStars rating={product.rating} count={product.reviewCount} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" className="flex-col gap-0 sm:flex-row sm:gap-x-2" />
          <button
            type="button"
            onClick={quickAdd}
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none lg:hidden"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
