"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { useMounted } from "@/hooks/use-mounted"

/** Counts down to the next midnight (daily flash sale). Swap `endsAt` for a CMS value later. */
function nextMidnight() {
  const d = new Date()
  d.setHours(24, 0, 0, 0)
  return d.getTime()
}

function Digit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0")
  return (
    <div className="flex flex-col items-center">
      <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-background font-display text-2xl font-extrabold tabular-nums text-foreground shadow-lg sm:h-16 sm:w-16 sm:text-3xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={v} initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ duration: 0.35 }}>
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
    </div>
  )
}

export function Countdown({ endsAt }: { endsAt?: number }) {
  const mounted = useMounted()
  const [now, setNow] = useState(() => Date.now())
  const [target] = useState(() => endsAt ?? nextMidnight())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = mounted ? Math.max(0, target - now) : 0
  const h = Math.floor(diff / 3.6e6)
  const m = Math.floor((diff % 3.6e6) / 6e4)
  const s = Math.floor((diff % 6e4) / 1000)

  return (
    <div className="flex items-start gap-2 sm:gap-3" role="timer" aria-label="Time left in sale">
      <Digit value={h} label="Hours" />
      <span className="pt-3 text-2xl font-bold opacity-60">:</span>
      <Digit value={m} label="Mins" />
      <span className="pt-3 text-2xl font-bold opacity-60">:</span>
      <Digit value={s} label="Secs" />
    </div>
  )
}
