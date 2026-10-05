"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { flyToCart } from "@/components/motion/fly-to-cart"
import { useCart } from "@/stores/cart"
import { useUI } from "@/stores/ui"
import type { Product, ProductVariant } from "@/types"

export function useAddToCart() {
  const add = useCart((s) => s.add)
  const setCartOpen = useUI((s) => s.setCartOpen)

  return useCallback(
    (product: Product, quantity = 1, source?: Element | null, variant?: ProductVariant | null) => {
      if (product.variants?.length && !variant) {
        toast.error("Please choose an option first")
        return
      }
      if ((variant ? variant.stock : product.stock) <= 0) {
        toast.error("This item is currently sold out")
        return
      }
      add(product, quantity, variant)
      flyToCart(source ?? null, variant?.image?.url ?? product.images[0]?.url)
      toast.success("Added to cart", {
        description: variant ? `${product.name} — ${variant.title}` : product.name,
        action: { label: "View cart", onClick: () => setCartOpen(true) },
      })
    },
    [add, setCartOpen]
  )
}

export function useToggleWishlist() {
  return useCallback((product: Product, toggle: (id: string) => boolean) => {
    const added = toggle(product.documentId)
    toast(added ? "Saved to wishlist" : "Removed from wishlist", { description: product.name })
  }, [])
}
