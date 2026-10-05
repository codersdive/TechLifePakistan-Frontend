"use client"

import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function QtyStepper({
  value,
  onChange,
  max = 99,
  size = "md",
  className,
}: {
  value: number
  onChange: (v: number) => void
  max?: number
  size?: "sm" | "md"
  className?: string
}) {
  const btn = cn(
    "grid place-items-center rounded-full transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "size-7" : "size-10"
  )
  return (
    <div className={cn("inline-flex items-center rounded-full border bg-background p-0.5", className)}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-3.5" />
      </button>
      <div className={cn("relative overflow-hidden text-center font-semibold tabular-nums", size === "sm" ? "w-7 text-sm" : "w-10")}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
