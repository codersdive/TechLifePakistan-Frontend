"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/hooks/use-add-to-cart"
import type { Product } from "@/types"
import { PriceTag } from "./price-tag"

/** Appears once the main purchase panel scrolls out of view. */
export function StickyBuyBar({ product, watchId }: { product: Product; watchId: string }) {
  const [visible, setVisible] = useState(false)
  const add = useAddToCart()

  useEffect(() => {
    const el = document.getElementById(watchId)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [watchId])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-30 border-t bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:bottom-0"
        >
          <div className="container-store flex items-center gap-4 py-3">
            <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-xl border bg-surface sm:block">
              <Image src={product.images[0].url} alt="" fill sizes="48px" className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="hidden truncate text-sm font-semibold sm:block">{product.name}</p>
              <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
            </div>
            <Button
              className="h-11 rounded-full px-6 shadow-lg shadow-primary/25"
              disabled={product.stock <= 0}
              onClick={(e) => add(product, 1, e.currentTarget)}
            >
              <ShoppingBag /> Add to cart
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
