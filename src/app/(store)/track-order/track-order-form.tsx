"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState, useTransition } from "react"
import { Loader2, PackageSearch, Search } from "lucide-react"
import { toast } from "sonner"
import { trackOrder, type TrackedOrder } from "@/app/actions/forms"
import { OrderCard } from "@/components/account/order-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState<TrackedOrder | null | undefined>(undefined)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await trackOrder(orderNumber, phone)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setResult(res.data)
    })
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="grid gap-4 rounded-3xl border bg-card p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="order">Order number</Label>
          <Input id="order" required placeholder="VT-261001-ABCD" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} className="h-11 font-mono uppercase" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" required type="tel" placeholder="03XX XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
        </div>
        <Button type="submit" size="lg" className="h-11 rounded-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Search />} Track
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {result === null && (
          <motion.div key="none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-14 text-center">
            <PackageSearch className="size-10 text-muted-foreground" />
            <p className="font-display text-lg font-bold">No matching order</p>
            <p className="max-w-sm text-sm text-muted-foreground">Check the order number and use the same mobile number you entered at checkout.</p>
          </motion.div>
        )}
        {result && (
          <motion.div key={result.orderNumber} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <OrderCard
              order={result}
              phone={phone}
              onChanged={() => startTransition(async () => {
                const res = await trackOrder(orderNumber, phone)
                if (res.ok) setResult(res.data)
              })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
