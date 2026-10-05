"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { PriceTag } from "@/components/product/price-tag"
import { ProductBadges } from "@/components/product/product-badges"
import { RatingStars } from "@/components/product/rating-stars"
import { useAddToCart } from "@/hooks/use-add-to-cart"
import { useUI } from "@/stores/ui"
import type { Product } from "@/types"
import { useShopUrl } from "./use-shop-url"

function ListRow({ product }: { product: Product }) {
  const add = useAddToCart()
  const setQuickView = useUI((s) => s.setQuickView)
  return (
    <div className="group grid gap-5 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-lg sm:grid-cols-[200px_1fr_auto]">
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden rounded-xl bg-surface">
        <Image src={product.images[0].url} alt={product.name} fill sizes="200px" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
        <ProductBadges product={product} className="absolute left-2 top-2" />
      </Link>
      <div className="flex flex-col gap-2 py-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brand?.name} · {product.model}</p>
        <Link href={`/product/${product.slug}`} className="font-display text-lg font-bold leading-snug hover:text-primary">{product.name}</Link>
        <RatingStars rating={product.rating} count={product.reviewCount} />
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {product.specs.slice(0, 3).map((s) => (
            <li key={s.label} className="rounded-md bg-muted px-2 py-1 text-xs"><span className="text-muted-foreground">{s.label}:</span> {s.value}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} className="sm:flex-col sm:items-end sm:gap-0" />
        <Button className="rounded-full" disabled={product.stock <= 0} onClick={(e) => product.variants?.length ? setQuickView(product) : add(product, 1, e.currentTarget.closest(".group")?.querySelector("a"))}>
          {product.stock <= 0 ? "Sold out" : product.variants?.length ? "Choose options" : "Add to cart"}
        </Button>
      </div>
    </div>
  )
}

export function ProductResults({ products, view }: { products: Product[]; view: "grid" | "list" }) {
  const { pending, update } = useShopUrl()

  if (products.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-accent"><PackageSearch className="size-8 text-primary" /></span>
        <div>
          <p className="font-display text-xl font-bold">No products found</p>
          <p className="text-sm text-muted-foreground">Try removing some filters or searching for something else.</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => update({ brand: null, min: null, max: null, stock: null, tag: null, q: null })}>
          Clear filters
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      animate={{ opacity: pending ? 0.5 : 1 }}
      className={view === "list" ? "flex flex-col gap-4" : "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.div
            key={p.documentId + view}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(i * 0.03, 0.3) } }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
          >
            {view === "list" ? <ListRow product={p} /> : <ProductCard product={p} priority={i < 4} />}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
