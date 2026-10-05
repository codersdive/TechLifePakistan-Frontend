"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { Suspense, useMemo } from "react"
import { Check, MessageCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, whatsappLink } from "@/lib/format"
import { useSite } from "@/components/site-provider"
import { PaymentAccounts, SubmitPaymentForm } from "@/components/checkout/pay-in-advance"
import { useMounted } from "@/hooks/use-mounted"

const COLORS = ["var(--primary)", "var(--brand-accent)", "var(--sale)", "var(--success)"]

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        x: (i * 37) % 100,
        delay: (i % 12) * 0.05,
        rotate: (i * 53) % 360,
        drift: ((i * 29) % 80) - 40,
        color: COLORS[i % COLORS.length],
        w: 6 + (i % 3) * 3,
      })),
    []
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{ left: `${p.x}%`, width: p.w, height: p.w * 1.6, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 520, x: p.drift, opacity: 0, rotate: p.rotate + 360 }}
          transition={{ duration: 2.4, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  )
}

function lastOrderPhone(order: string) {
  try {
    const saved = JSON.parse(sessionStorage.getItem("last-order") ?? "null") as { order: string; phone: string } | null
    return saved?.order === order ? saved.phone : undefined
  } catch {
    return undefined
  }
}

function Success() {
  const params = useSearchParams()
  const order = params.get("order") ?? "—"
  const total = Number(params.get("total") ?? 0)
  const method = params.get("method") ?? "cod"
  const site = useSite()
  const mounted = useMounted()
  const checkoutPhone = mounted ? lastOrderPhone(order) : undefined
  return (
    <div className="container-store relative py-16">
      <Confetti />
      <div className="relative mx-auto max-w-xl rounded-[2rem] border bg-card p-8 text-center shadow-xl sm:p-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          className="mx-auto grid size-20 place-items-center rounded-full bg-success text-success-foreground shadow-lg shadow-success/30"
        >
          <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="block">
            <Check className="size-10" strokeWidth={3} />
          </motion.span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h1 className="mt-6 text-3xl font-extrabold">Thank you for your order!</h1>
          <p className="mt-2 text-muted-foreground">
            Your order <b className="font-mono text-foreground">{order}</b> has been placed. We’ll call you shortly to confirm delivery details.
          </p>
          {total > 0 && (
            <p className="mt-4 rounded-2xl border bg-surface px-4 py-3 text-sm">
              Order total <b className="font-display text-lg">{formatPrice(total)}</b>
              <span className="mt-1 block text-muted-foreground">
                {method === "cod"
                  ? "Please keep the exact amount ready — you pay when your parcel arrives."
                  : "Please send the total to one of the accounts below. Your order ships once payment is confirmed."}
              </span>
            </p>
          )}
          {method !== "cod" && order !== "—" && (
            <div className="mt-4 space-y-4">
              <PaymentAccounts method={method} orderNumber={order} />
              {mounted && <SubmitPaymentForm orderNumber={order} amountDue={total || undefined} phone={checkoutPhone} askPhone={!checkoutPhone} />}
              <p className="text-xs text-muted-foreground">You can also send the transaction ID later from the “Track order” page or your account.</p>
            </div>
          )}
          <div className="mt-8 grid gap-3 rounded-2xl bg-surface p-5 text-left text-sm sm:grid-cols-2">
            <p className="flex items-start gap-3"><Package className="mt-0.5 size-5 text-primary" /><span><b className="block">Estimated delivery</b>2–5 working days</span></p>
            <p className="flex items-start gap-3"><MessageCircle className="mt-0.5 size-5 text-primary" /><span><b className="block">Order updates</b>Via SMS & WhatsApp</span></p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full"><Link href="/shop">Continue shopping</Link></Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href={whatsappLink(site.contact.whatsapp, `Hi! I just placed order ${order}.`)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <Success />
    </Suspense>
  )
}
