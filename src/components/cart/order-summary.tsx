"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/format"
import { cartSavings, cartSubtotal, useCart } from "@/stores/cart"
import type { CartItem } from "@/types"
import { useSite } from "@/components/site-provider"

export function shippingFor(amount: number, rules: { freeThreshold: number; flatRate: number }) {
  return amount <= 0 || amount >= rules.freeThreshold ? 0 : rules.flatRate
}

/** Server quote overriding the local estimate on the checkout page. */
export interface SummaryQuote {
  shippingFee: number
  shippingLabel?: string
  codFee: number
  tax: number
  taxLabel?: string | null
  taxInclusive: boolean
  total: number
}

export function OrderSummary({ items, showItems = false, quote, children }: { items: CartItem[]; showItems?: boolean; quote?: SummaryQuote | null; children?: React.ReactNode }) {
  const site = useSite()
  const coupon = useCart((s) => s.coupon)
  const subtotal = cartSubtotal(items)
  const savings = cartSavings(items)
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0
  const shipping = quote ? quote.shippingFee : shippingFor(subtotal - discount, site.shipping)
  const total = quote ? quote.total : subtotal - discount + shipping
  return (
    <div className="rounded-3xl border bg-card p-6">
      <h2 className="font-display text-xl font-bold">Order summary</h2>
      {showItems && (
        <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-3">
              <span className="relative size-14 shrink-0 rounded-xl border bg-surface">
                <Image src={i.image.url} alt="" fill sizes="56px" className="object-contain p-1.5" />
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">{i.quantity}</span>
              </span>
              <span className="line-clamp-2 flex-1 text-sm">{i.name}{i.variantTitle && <span className="block text-xs text-muted-foreground">{i.variantTitle}</span>}</span>
              <span className="text-sm font-semibold">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium">{formatPrice(subtotal)}</dd></div>
        {discount > 0 && (
          <div className="flex justify-between text-success"><dt>Coupon <span className="font-mono">{coupon!.code}</span></dt><dd className="font-medium">−{formatPrice(discount)}</dd></div>
        )}
        <div className="flex justify-between"><dt className="text-muted-foreground">{quote?.shippingLabel ?? "Shipping"}</dt><dd className="font-medium">{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</dd></div>
        {quote && quote.codFee > 0 && (
          <div className="flex justify-between"><dt className="text-muted-foreground">Cash on Delivery fee</dt><dd className="font-medium">{formatPrice(quote.codFee)}</dd></div>
        )}
        {quote && quote.tax > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{quote.taxLabel ?? "Tax"}{quote.taxInclusive ? " (included)" : ""}</dt>
            <dd className="font-medium">{formatPrice(quote.tax)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t pt-4 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-2xl font-extrabold">{formatPrice(total)}</dd>
        </div>
      </dl>
      {savings + discount > 0 && (
        <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-center text-sm font-medium text-success">
          You’re saving {formatPrice(savings + discount)} on this order
        </p>
      )}
      {children}
    </div>
  )
}
