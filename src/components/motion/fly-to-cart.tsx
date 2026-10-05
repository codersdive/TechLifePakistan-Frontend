"use client"

import { AnimatePresence, motion } from "motion/react"
import { create } from "zustand"

interface Flight {
  id: number
  src: string
  from: DOMRect
  to: DOMRect
}

const useFlights = create<{ flights: Flight[]; push: (f: Flight) => void; done: (id: number) => void }>()((set) => ({
  flights: [],
  push: (f) => set((s) => ({ flights: [...s.flights, f] })),
  done: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id) })),
}))

let seq = 0

/** Animates a thumbnail from `source` to whichever visible element carries `data-cart-target`. */
export function flyToCart(source: Element | null, src: string) {
  if (typeof window === "undefined" || !source) return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find(
    (t) => t.getClientRects().length > 0
  )
  if (!target) return
  useFlights.getState().push({ id: ++seq, src, from: source.getBoundingClientRect(), to: target.getBoundingClientRect() })
}

export function FlyToCartLayer() {
  const { flights, done } = useFlights()
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <AnimatePresence>
        {flights.map((f) => {
          const size = Math.min(f.from.width, f.from.height, 160)
          const startX = f.from.left + f.from.width / 2 - size / 2
          const startY = f.from.top + f.from.height / 2 - size / 2
          const endX = f.to.left + f.to.width / 2 - size / 2
          const endY = f.to.top + f.to.height / 2 - size / 2
          return (
            <motion.img
              key={f.id}
              src={f.src}
              alt=""
              className="absolute left-0 top-0 rounded-2xl bg-card shadow-2xl ring-1 ring-border"
              style={{ width: size, height: size }}
              initial={{ x: startX, y: startY, scale: 1, opacity: 1 }}
              animate={{
                x: [startX, (startX + endX) / 2, endX],
                y: [startY, Math.min(startY, endY) - 120, endY],
                scale: [1, 0.6, 0.12],
                opacity: [1, 1, 0.4],
              }}
              transition={{ duration: 0.85, ease: [0.5, 0, 0.3, 1] }}
              onAnimationComplete={() => done(f.id)}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}
