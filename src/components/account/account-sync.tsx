"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { syncAccountLists } from "@/app/actions/account"
import { useCart } from "@/stores/cart"
import { useWishlist } from "@/stores/lists"

const MARKER = "store_signed_in"
const MERGED_KEY = "store-account-merged"

const readMarker = () => document.cookie.split("; ").find((c) => c.startsWith(`${MARKER}=`))?.slice(MARKER.length + 1) ?? null

const snapshot = () => ({
  cart: useCart.getState().items.map((i) => ({ productId: i.documentId, variantSku: i.variantSku ?? null, quantity: i.quantity })),
  wishlist: useWishlist.getState().ids,
})

/**
 * Keeps a signed-in customer's cart and wishlist on their account:
 * merges the browser's lists into the account once per sign-in, then saves changes (debounced).
 */
export function AccountSync() {
  const pathname = usePathname()
  const marker = useRef<string | null>(null)
  const ready = useRef(false)

  // Detect sign-in / sign-out (auth happens through server actions followed by a navigation).
  useEffect(() => {
    const current = readMarker()
    if (current === marker.current) return
    marker.current = current
    ready.current = false
    if (!current) return

    let mergedFor: string | null = null
    try {
      mergedFor = sessionStorage.getItem(MERGED_KEY)
    } catch {}
    if (mergedFor === current) {
      ready.current = true
      return
    }

    void syncAccountLists({ ...snapshot(), merge: true }).then((res) => {
      if (marker.current !== current) return
      if (res.ok && res.data) {
        useCart.setState({ items: res.data.cart })
        useWishlist.setState({ ids: res.data.wishlist })
      }
      try {
        sessionStorage.setItem(MERGED_KEY, current)
      } catch {}
      ready.current = true
    })
  }, [pathname])

  // Save changes after the initial merge.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      if (!ready.current || !marker.current) return
      clearTimeout(timer)
      timer = setTimeout(() => void syncAccountLists({ ...snapshot(), merge: false }), 1200)
    }
    const unsubCart = useCart.subscribe((s, prev) => s.items !== prev.items && schedule())
    const unsubWish = useWishlist.subscribe((s, prev) => s.ids !== prev.ids && schedule())
    return () => {
      clearTimeout(timer)
      unsubCart()
      unsubWish()
    }
  }, [])

  return null
}
