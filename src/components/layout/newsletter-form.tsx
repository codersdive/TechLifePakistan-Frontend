"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState, useTransition } from "react"
import { subscribeNewsletter } from "@/app/actions/forms"
import { ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"

export function NewsletterForm() {
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const email = new FormData(e.currentTarget).get("email") as string
        startTransition(async () => {
          const res = await subscribeNewsletter(email)
          if (!res.ok) {
            toast.error(res.error)
            return
          }
          setDone(true)
          toast.success("You're subscribed! Watch your inbox for deals.")
        })
      }}
      className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-brand-accent"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="Enter your email"
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-current placeholder:opacity-50"
      />
      <button type="submit" disabled={pending || done} className="flex h-10 items-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-semibold text-brand-accent-foreground transition-transform hover:scale-105">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(done)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
            {done ? <>Subscribed <Check className="size-4" /></> : <>Subscribe <ArrowRight className="size-4" /></>}
          </motion.span>
        </AnimatePresence>
      </button>
    </form>
  )
}
