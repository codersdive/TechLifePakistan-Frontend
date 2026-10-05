"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Banknote, Check, GitCompareArrows, Heart, Share2, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react"
import { toast } from "sonner"
import { WhatsappIcon } from "@/components/icons/social"
import { Button } from "@/components/ui/button"
import { useAddToCart, useToggleWishlist } from "@/hooks/use-add-to-cart"
import { useMounted } from "@/hooks/use-mounted"
import { formatPrice, whatsappLink } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCart } from "@/stores/cart"
import { useCompare, useRecentlyViewed, useWishlist } from "@/stores/lists"
import type { Product } from "@/types"
import { PriceTag } from "./price-tag"
import { QtyStepper } from "./qty-stepper"
import { defaultVariant, matchVariant, VariantPicker } from "./variant-picker"
import { useSite } from "@/components/site-provider"

function StockIndicator({ stock }: { stock: number }) {
  if (stock <= 0) return <p className="text-sm font-semibold text-destructive">Out of stock — contact us for restock date</p>
  const low = stock <= 8
  return (
    <div className="space-y-2">
      <p className={cn("flex items-center gap-2 text-sm font-semibold", low ? "text-sale" : "text-success")}>
        <span className="relative flex size-2.5">
          <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", low ? "bg-sale" : "bg-success")} />
          <span className={cn("relative inline-flex size-2.5 rounded-full", low ? "bg-sale" : "bg-success")} />
        </span>
        {low ? `Hurry! Only ${stock} left in stock` : "In stock — ready to ship"}
      </p>
      {low && (
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-sale"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(8, (stock / 20) * 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  )
}

export function ProductPurchase({ product, compact = false, imageSource }: { product: Product; compact?: boolean; imageSource?: string }) {
  const [qty, setQty] = useState(1)
  const site = useSite()
  const [added, setAdded] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const mounted = useMounted()
  const addToCart = useAddToCart()
  const addRaw = useCart((s) => s.add)
  const toggleWish = useToggleWishlist()
  const wishToggle = useWishlist((s) => s.toggle)
  const wished = useWishlist((s) => s.ids.includes(product.documentId)) && mounted
  const compareToggle = useCompare((s) => s.toggle)
  const compared = useCompare((s) => s.ids.includes(product.documentId)) && mounted
  const addRecent = useRecentlyViewed((s) => s.add)
  const hasVariants = !!product.variants?.length
  const [values, setValues] = useState<string[]>(() => defaultVariant(product)?.values ?? [])
  const variant = hasVariants ? matchVariant(product, values) : null
  const stock = hasVariants ? (variant?.stock ?? 0) : product.stock
  const soldOut = stock <= 0

  useEffect(() => {
    if (!compact) addRecent(product.documentId)
  }, [compact, product.documentId, addRecent])

  const handleAdd = () => {
    const source = imageSource ? document.querySelector(imageSource) : btnRef.current
    addToCart(product, qty, source, variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const buyNow = () => {
    if (hasVariants && !variant) return
    addRaw(product, qty, variant)
    router.push("/checkout")
  }

  const share = async () => {
    const url = window.location.origin + `/product/${product.slug}`
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      {hasVariants && (
        <div className="space-y-4 rounded-3xl border bg-surface p-5">
          <VariantPicker product={product} values={values} onChange={(v) => { setValues(v); setQty(1) }} />
          {variant ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t pt-4">
              <PriceTag price={variant.price} compareAtPrice={variant.compareAtPrice} size="md" showSave />
              <span className="font-mono text-xs text-muted-foreground">SKU {variant.sku}</span>
            </div>
          ) : (
            <p className="border-t pt-4 text-sm text-muted-foreground">This combination isn’t available — try another option.</p>
          )}
        </div>
      )}

      <StockIndicator stock={stock} />

      <div className="flex flex-wrap items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} max={Math.max(1, stock)} />
        <Button
          ref={btnRef}
          size="lg"
          onClick={handleAdd}
          disabled={soldOut}
          className="relative h-12 min-w-44 flex-1 overflow-hidden rounded-full text-base font-semibold shadow-lg shadow-primary/25"
        >
          <motion.span key={added ? "added" : "add"} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
            {added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
            {added ? "Added!" : "Add to cart"}
          </motion.span>
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={buyNow}
          disabled={soldOut}
          className="h-12 flex-1 rounded-full border-foreground/80 text-base font-semibold hover:bg-foreground hover:text-background"
        >
          <Zap className="size-5" /> Buy now
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" className="rounded-full bg-[#25D366]/12 text-[#128C7E] hover:bg-[#25D366]/20 dark:text-[#25D366]">
          <a href={whatsappLink(site.contact.whatsapp, `Hi! I'd like to order: ${product.name}${variant ? ` — ${variant.title}` : ""} (${variant?.sku ?? product.sku}) × ${qty}`)} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon className="size-4" /> Order on WhatsApp
          </a>
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={() => toggleWish(product, wishToggle)} aria-pressed={wished}>
          <Heart className={cn("size-4", wished && "fill-sale text-sale")} /> {wished ? "Saved" : "Wishlist"}
        </Button>
        <Button
          variant="ghost"
          className="rounded-full"
          aria-pressed={compared}
          onClick={() => toast(compareToggle(product.documentId) ? "Added to compare" : "Removed from compare")}
        >
          <GitCompareArrows className={cn("size-4", compared && "text-primary")} /> Compare
        </Button>
        {!compact && (
          <Button variant="ghost" className="rounded-full" onClick={share}>
            <Share2 className="size-4" /> Share
          </Button>
        )}
      </div>

      {!compact && (
        <ul className="grid gap-3 rounded-2xl border bg-surface p-4 text-sm sm:grid-cols-3">
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <b className="block">{product.warranty ? `${product.warranty} warranty` : "100% original"}</b>
              <span className="text-muted-foreground">{product.warranty ? "Brand-backed" : "Genuine brand product"}</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Banknote className="mt-0.5 size-5 shrink-0 text-primary" />
            <span><b className="block">Cash on Delivery</b><span className="text-muted-foreground">Pay when it arrives</span></span>
          </li>
          <li className="flex items-start gap-3">
            <Truck className="mt-0.5 size-5 shrink-0 text-primary" />
            <span><b className="block">Free delivery</b><span className="text-muted-foreground">Over {formatPrice(site.shipping.freeThreshold)}</span></span>
          </li>
        </ul>
      )}
    </div>
  )
}
