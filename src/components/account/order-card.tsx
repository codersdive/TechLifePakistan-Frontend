import Image from "next/image"
import { Banknote, Building2, CalendarClock, Smartphone, Truck } from "lucide-react"
import type { TrackedOrder } from "@/app/actions/forms"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { PaymentAccounts, SubmitPaymentForm } from "@/components/checkout/pay-in-advance"
import { CancelOrderButton } from "./cancel-order-button"

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"]
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-brand-accent/20 text-brand-accent-foreground dark:text-brand-accent",
  confirmed: "bg-primary/12 text-primary",
  processing: "bg-primary/12 text-primary",
  shipped: "bg-primary/12 text-primary",
  delivered: "bg-success/12 text-success",
  cancelled: "bg-destructive/12 text-destructive",
  returned: "bg-muted text-muted-foreground",
}
const METHOD = { cod: ["Cash on Delivery", Banknote], bank: ["Bank transfer", Building2], wallet: ["JazzCash / Easypaisa", Smartphone] } as const

/** One order with a status timeline — used on /account and /track-order. */
export function OrderCard({ order, phone, onChanged }: { order: TrackedOrder; phone?: string; onChanged?: () => void }) {
  const step = STEPS.indexOf(order.orderStatus)
  const [methodLabel, MethodIcon] = METHOD[order.paymentMethod as keyof typeof METHOD] ?? METHOD.cod
  return (
    <article className="rounded-3xl border bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", STATUS_STYLE[order.orderStatus])}>{order.orderStatus}</span>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", order.paymentStatus === "paid" ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")}>
            {order.paymentStatus}
          </span>
        </div>
      </header>

      {step >= 0 && (
        <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-1.5">
              <span className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
              <span className={cn("text-[11px] capitalize", i <= step ? "font-semibold text-foreground" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
      )}

      <ul className="mt-5 divide-y rounded-2xl border">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 p-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border bg-surface">
              {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-contain p-1" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.productName}{item.variantTitle && <span className="text-muted-foreground"> — {item.variantTitle}</span>}</span>
              <span className="text-xs text-muted-foreground">
                {item.quantity} × {formatPrice(item.unitPrice)}
              </span>
            </span>
            <span className="text-sm font-semibold">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <footer className="mt-4 flex flex-wrap items-end justify-between gap-3 text-sm">
        <div className="space-y-1 text-muted-foreground">
          <p className="flex items-center gap-2"><MethodIcon className="size-4" /> {methodLabel}</p>
          {(order.courier || order.trackingNumber) && (
            <p className="flex items-center gap-2">
              <Truck className="size-4" /> {order.courier ?? "Courier"}
              {order.trackingNumber && <> · <b className="font-mono text-foreground">{order.trackingNumber}</b></>}
            </p>
          )}
          {order.estimatedDelivery && ["confirmed", "processing", "shipped"].includes(order.orderStatus) && (
            <p className="flex items-center gap-2"><CalendarClock className="size-4" /> Expected by {new Date(order.estimatedDelivery).toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
          )}
          {order.cancelReason && order.orderStatus === "cancelled" && <p>Cancelled: {order.cancelReason}</p>}
        </div>
        <dl className="min-w-48 space-y-1">
          {order.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd>−{formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between text-muted-foreground"><dt>Shipping</dt><dd>{order.shippingFee ? formatPrice(order.shippingFee) : "Free"}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>
      </footer>

      {order.paymentPending && (
        <p className="mt-4 rounded-2xl bg-amber-500/10 p-3 text-sm font-medium text-amber-700 dark:text-amber-400">
          We’ve received your payment details and are verifying them.
        </p>
      )}
      {order.canSubmitPayment && (
        <details className="group mt-4 rounded-2xl border border-primary/30 bg-accent/30 p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-primary marker:content-none">
            Payment due: {formatPrice(order.amountDue)} — <span className="group-open:hidden">show how to pay</span><span className="hidden group-open:inline">how to pay</span>
          </summary>
          <div className="mt-4 space-y-4">
            <PaymentAccounts method={order.paymentMethod} orderNumber={order.orderNumber} />
            <SubmitPaymentForm orderNumber={order.orderNumber} amountDue={order.amountDue} phone={phone} onSubmitted={onChanged} />
          </div>
        </details>
      )}

      {(order.events.length > 0 || order.canCancel) && (
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-4">
          {order.events.length > 0 && (
            <details className="group min-w-0 flex-1 text-sm">
              <summary className="cursor-pointer font-medium text-primary marker:content-none">
                Order updates ({order.events.length}) <span className="text-muted-foreground group-open:hidden">— show</span>
              </summary>
              <ol className="mt-3 space-y-2 border-l pl-4">
                {order.events.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                    <p>{e.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </li>
                ))}
              </ol>
            </details>
          )}
          {order.canCancel && <CancelOrderButton orderNumber={order.orderNumber} phone={phone} onCancelled={onChanged} />}
        </div>
      )}
    </article>
  )
}
