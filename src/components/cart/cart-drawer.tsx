"use client"

import Link from "next/link"
import { AnimatePresence } from "motion/react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useMounted } from "@/hooks/use-mounted"
import { formatPrice } from "@/lib/format"
import { cartCount, cartSavings, cartSubtotal, useCart } from "@/stores/cart"
import { useUI } from "@/stores/ui"
import { CartLine } from "./cart-line"
import { FreeShippingProgress } from "./free-shipping-progress"

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen)
  const setOpen = useUI((s) => s.setCartOpen)
  const items = useCart((s) => s.items)
  const mounted = useMounted()
  const list = mounted ? items : []
  const subtotal = cartSubtotal(list)
  const savings = cartSavings(list)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-lg">
            <ShoppingBag className="size-5" /> Your cart
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{cartCount(list)}</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Items in your shopping cart</SheetDescription>
        </SheetHeader>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-20 animate-float place-items-center rounded-full bg-accent">
              <ShoppingBag className="size-9 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Looks like you haven’t added anything yet.</p>
            </div>
            <Button asChild className="rounded-full" onClick={close}>
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeShippingProgress subtotal={subtotal} />
            </div>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              <AnimatePresence initial={false}>
                {list.map((item) => <CartLine key={item.key} item={item} onNavigate={close} />)}
              </AnimatePresence>
            </ul>
            <SheetFooter className="gap-3 border-t bg-surface px-5 py-4">
              {savings > 0 && (
                <p className="flex justify-between text-sm text-success"><span>You save</span><b>{formatPrice(savings)}</b></p>
              )}
              <p className="flex justify-between text-base"><span className="font-medium">Subtotal</span><b className="font-display text-xl">{formatPrice(subtotal)}</b></p>
              <p className="text-xs text-muted-foreground">Shipping calculated at checkout. Cash on Delivery available.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="h-11 rounded-full" onClick={close}>
                  <Link href="/cart">View cart</Link>
                </Button>
                <Button asChild className="h-11 rounded-full shadow-lg shadow-primary/25" onClick={close}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
