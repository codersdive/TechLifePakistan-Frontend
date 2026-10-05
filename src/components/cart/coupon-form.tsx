"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Loader2, Tag, X } from "lucide-react"
import { toast } from "sonner"
import { validateCoupon } from "@/app/actions/checkout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/format"
import { cartSubtotal, useCart } from "@/stores/cart"

/** Applies a coupon via the backend and keeps its discount in sync when the cart changes. */
export function CouponForm() {
  const items = useCart((s) => s.items)
  const coupon = useCart((s) => s.coupon)
  const setCoupon = useCart((s) => s.setCoupon)
  const [code, setCode] = useState("")
  const [pending, startTransition] = useTransition()
  const subtotal = cartSubtotal(items)

  const apply = (value: string, quiet = false) =>
    startTransition(async () => {
      const res = await validateCoupon(value, subtotal)
      if (res.ok && res.data.valid) {
        setCoupon({ code: res.data.code, discount: res.data.discount, subtotal })
        if (!quiet) toast.success(res.data.message)
      } else {
        setCoupon(null)
        toast.error(res.ok ? res.data.message : res.error)
      }
    })

  // Cart total changed since the coupon was applied → re-check it (minimums / caps may differ).
  useEffect(() => {
    if (coupon && coupon.subtotal !== subtotal && subtotal > 0) apply(coupon.code, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the subtotal changes
  }, [subtotal])

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-success/30 bg-success/10 p-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-success">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          <span>
            <b className="font-mono">{coupon.code}</b> — saving {formatPrice(coupon.discount)}
          </span>
        </span>
        <button type="button" onClick={() => setCoupon(null)} className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground" aria-label="Remove coupon">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    // Not a <form>: this box is also rendered inside the checkout form, and forms can't be nested.
    <div className="flex gap-2 rounded-2xl border bg-card p-2" role="group" aria-label="Apply coupon">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (code.trim()) apply(code.trim())
            }
          }}
          placeholder="Coupon code"
          className="h-10 rounded-xl border-0 pl-9 uppercase shadow-none focus-visible:ring-0"
          aria-label="Coupon code"
        />
      </div>
      <Button type="button" variant="secondary" className="h-10 rounded-xl" disabled={pending || !code.trim()} onClick={() => apply(code.trim())}>
        {pending && <Loader2 className="size-4 animate-spin" />} Apply
      </Button>
    </div>
  )
}
