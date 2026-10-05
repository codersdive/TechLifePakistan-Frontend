"use client"

import Link from "next/link"
import { AnimatePresence } from "motion/react"
import { ArrowLeft, Lock, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { CartLine } from "@/components/cart/cart-line"
import { CouponForm } from "@/components/cart/coupon-form"
import { FreeShippingProgress } from "@/components/cart/free-shipping-progress"
import { OrderSummary } from "@/components/cart/order-summary"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMounted } from "@/hooks/use-mounted"
import { cartCount, cartSubtotal, useCart } from "@/stores/cart"

export default function CartPage() {
  const mounted = useMounted()
  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)

  return (
    <div className="container-store py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Shopping cart</h1>
      {!mounted ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]"><Skeleton className="h-80 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
          <span className="grid size-20 animate-float place-items-center rounded-full bg-accent"><ShoppingBag className="size-9 text-primary" /></span>
          <p className="font-display text-xl font-bold">Your cart is empty</p>
          <p className="text-muted-foreground">Discover MPPT solar controllers and battery chargers.</p>
          <Button asChild className="rounded-full"><Link href="/shop">Continue shopping</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <FreeShippingProgress subtotal={cartSubtotal(items)} />
            <div className="rounded-3xl border bg-card px-5">
              <div className="flex items-center justify-between border-b py-4 text-sm">
                <span className="font-semibold">{cartCount(items)} items</span>
                <button type="button" onClick={() => { clear(); toast("Cart cleared") }} className="text-muted-foreground hover:text-destructive">Clear cart</button>
              </div>
              <ul className="divide-y">
                <AnimatePresence initial={false}>
                  {items.map((i) => <CartLine key={i.key} item={i} />)}
                </AnimatePresence>
              </ul>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><ArrowLeft className="size-4" /> Continue shopping</Link>
          </div>
          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <CouponForm />
            <OrderSummary items={items}>
              <Button asChild size="lg" className="mt-6 h-12 w-full rounded-full text-base shadow-lg shadow-primary/25">
                <Link href="/checkout"><Lock className="size-4" /> Proceed to checkout</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Cash on Delivery · Bank transfer · JazzCash / Easypaisa</p>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  )
}
