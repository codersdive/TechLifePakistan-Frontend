"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { getPaymentAccounts, submitPayment, type PaymentAccount } from "@/app/actions/payments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

function CopyValue({ value, mono = true }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <button type="button" onClick={copy} className="group inline-flex items-center gap-1.5 text-left font-semibold text-foreground" aria-label={`Copy ${value}`}>
      <span className={cn(mono && "font-mono")}>{value}</span>
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-muted-foreground group-hover:text-primary" />}
    </button>
  )
}

/** Store accounts to pay into (from Store settings). Renders nothing when none are set up. */
export function PaymentAccounts({ method, orderNumber, accounts: initial }: { method: string; orderNumber: string; accounts?: PaymentAccount[] }) {
  const [accounts, setAccounts] = useState<PaymentAccount[] | null>(initial ?? null)
  useEffect(() => {
    if (initial) return
    let alive = true
    void getPaymentAccounts(method).then((a) => alive && setAccounts(a))
    return () => {
      alive = false
    }
  }, [method, initial])

  if (!accounts?.length) return null
  return (
    <div className="space-y-3">
      {accounts.map((a, i) => (
        <div key={i} className="rounded-2xl border bg-surface p-4 text-left text-sm">
          <p className="font-display font-bold">{a.provider}</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Account title</dt>
            <dd><CopyValue value={a.accountTitle} mono={false} /></dd>
            <dt className="text-muted-foreground">{a.method === "wallet" ? "Mobile number" : "Account no."}</dt>
            <dd><CopyValue value={a.accountNumber} /></dd>
            {a.iban && (
              <>
                <dt className="text-muted-foreground">IBAN</dt>
                <dd className="break-all"><CopyValue value={a.iban} /></dd>
              </>
            )}
          </dl>
          {a.instructions && <p className="mt-2 text-xs text-muted-foreground">{a.instructions}</p>}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Please write <b className="font-mono text-foreground">{orderNumber}</b> in the payment description.
      </p>
    </div>
  )
}

/** "I've paid" — customer enters the transaction ID so the store can verify the payment. */
export function SubmitPaymentForm({
  orderNumber,
  amountDue,
  phone: knownPhone,
  askPhone = false,
  onSubmitted,
}: {
  orderNumber: string
  amountDue?: number
  phone?: string
  askPhone?: boolean
  onSubmitted?: () => void
}) {
  const [reference, setReference] = useState("")
  const [phone, setPhone] = useState(knownPhone ?? "")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reference.trim().length < 4) return void toast.error("Enter the transaction ID from your payment receipt.")
    if (askPhone && !phone.trim()) return void toast.error("Enter the mobile number used at checkout.")
    setBusy(true)
    const res = await submitPayment({ orderNumber, phone: phone || undefined, reference })
    setBusy(false)
    if (!res.ok) return void toast.error(res.error)
    setDone(res.data.message)
    toast.success("Payment details sent")
    onSubmitted?.()
  }

  if (done) {
    return <p className="rounded-2xl bg-success/10 p-4 text-left text-sm font-medium text-success">{done}</p>
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left" noValidate>
      <p className="text-sm font-semibold">
        Already paid{amountDue ? ` ${formatPrice(amountDue)}` : ""}? Send us the transaction ID:
      </p>
      <div className={cn("grid gap-2", askPhone && "sm:grid-cols-2")}>
        {askPhone && <Input type="tel" placeholder="Mobile used at checkout" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" aria-label="Mobile number" />}
        <Input placeholder="Transaction ID / reference" value={reference} onChange={(e) => setReference(e.target.value)} className="h-11 font-mono" aria-label="Transaction ID" />
      </div>
      <Button type="submit" disabled={busy} className="rounded-full">
        {busy ? <Loader2 className="animate-spin" /> : <Send />} Submit payment details
      </Button>
    </form>
  )
}
