"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product, ProductVariant } from "@/types"
import { lineKey, toCartItem } from "./cart-utils"

export interface AppliedCoupon {
  code: string
  discount: number
  /** Subtotal the discount was calculated for — re-validated when the cart changes. */
  subtotal: number
}

interface CartState {
  items: CartItem[]
  coupon: AppliedCoupon | null
  setCoupon: (coupon: AppliedCoupon | null) => void
  /** Adds a product (or one of its variants) to the cart. */
  add: (product: Product, quantity?: number, variant?: ProductVariant | null) => void
  remove: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
}

export { lineKey, toCartItem }

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      setCoupon: (coupon) => set({ coupon }),
      add: (product, quantity = 1, variant) =>
        set((s) => {
          const line = toCartItem(product, quantity, variant)
          const existing = s.items.find((i) => i.key === line.key)
          if (existing) {
            return {
              items: s.items.map((i) => (i.key === line.key ? { ...i, stock: line.stock, quantity: Math.min(i.quantity + quantity, line.stock) } : i)),
            }
          }
          return { items: [...s.items, { ...line, quantity: Math.min(quantity, line.stock) }] }
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i)),
        })),
      clear: () => set({ items: [], coupon: null }),
    }),
    {
      name: "store-cart",
      version: 2,
      // v1 carts had no line key — derive it so existing shoppers keep their cart.
      migrate: (state) => {
        const s = state as { items?: CartItem[]; coupon?: AppliedCoupon | null }
        return { ...s, items: (s.items ?? []).map((i) => ({ ...i, key: i.key ?? lineKey(i.documentId, i.variantSku) })) } as CartState
      },
    }
  )
)

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0)
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0)
export const cartSavings = (items: CartItem[]) =>
  items.reduce((n, i) => n + (i.compareAtPrice ? (i.compareAtPrice - i.price) * i.quantity : 0), 0)
