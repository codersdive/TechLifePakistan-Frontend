"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { cancelOrder } from "@/app/actions/forms"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

/** Lets the customer cancel while the order is still pending/confirmed. */
export function CancelOrderButton({ orderNumber, phone, onCancelled }: { orderNumber: string; phone?: string; onCancelled?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  const confirm = () =>
    startTransition(async () => {
      const res = await cancelOrder(orderNumber, phone, reason)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(res.data.message)
      setOpen(false)
      if (onCancelled) onCancelled()
      else router.refresh()
    })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive">
          <XCircle /> Cancel order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel order {orderNumber}?</DialogTitle>
          <DialogDescription>We haven’t shipped it yet, so you can cancel it now. This can’t be undone.</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional) — e.g. ordered by mistake" rows={3} maxLength={300} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Keep order</Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Cancel order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
