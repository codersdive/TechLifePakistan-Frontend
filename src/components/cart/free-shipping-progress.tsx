"use client"

import { motion } from "motion/react"
import { PartyPopper, Truck } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { useSite } from "@/components/site-provider"

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const goal = useSite().shipping.freeThreshold
  const pct = Math.min(100, (subtotal / goal) * 100)
  const done = subtotal >= goal
  return (
    <div className="rounded-2xl border bg-surface p-3.5">
      <p className="mb-2 flex items-center gap-2 text-sm">
        {done ? <PartyPopper className="size-4 text-success" /> : <Truck className="size-4 text-primary" />}
        {done ? (
          <span><b className="text-success">You’ve unlocked free delivery!</b></span>
        ) : (
          <span>Add <b>{formatPrice(goal - subtotal)}</b> more for <b>free delivery</b></span>
        )}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={done ? "h-full rounded-full bg-success" : "h-full rounded-full bg-gradient-to-r from-primary to-brand-accent"}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
