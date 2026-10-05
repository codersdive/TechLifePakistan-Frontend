"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { Expand } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Media } from "@/types"

export function ProductGallery({ images, name, zoom = true, className }: { images: Media[]; name: string; zoom?: boolean; className?: string }) {
  const [active, setActive] = useState(0)
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)
  const [lightbox, setLightbox] = useState(false)
  const current = images[active]

  return (
    <div className={cn("flex flex-col-reverse gap-3 sm:flex-row", className)}>
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto sm:flex-col">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className="relative size-18 shrink-0 overflow-hidden rounded-xl border bg-surface p-1.5 sm:size-20"
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1.5" />
              {i === active && (
                <motion.span layoutId={`thumb-${name}`} className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background" />
              )}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative aspect-square flex-1 overflow-hidden rounded-3xl border bg-gradient-to-br from-surface via-background to-accent/40 dark:from-white/[0.1] dark:via-white/[0.04] dark:to-accent/40",
          zoom && "cursor-zoom-in"
        )}
        onMouseMove={(e) => {
          if (!zoom) return
          const r = e.currentTarget.getBoundingClientRect()
          setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setOrigin(null)}
        onClick={() => zoom && setLightbox(true)}
      >
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] opacity-60" />
        <AnimatePresence mode="wait">
          <motion.div
            key={current.url + active}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.alternativeText ?? name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-8 transition-transform duration-200 ease-out sm:p-12"
              style={origin ? { transform: "scale(1.8)", transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
            />
          </motion.div>
        </AnimatePresence>
        {zoom && (
          <span className="pointer-events-none absolute bottom-4 right-4 grid size-10 place-items-center rounded-full border bg-background/80 backdrop-blur">
            <Expand className="size-4" />
          </span>
        )}
      </div>

      {zoom && (
        <Dialog open={lightbox} onOpenChange={setLightbox}>
          <DialogContent className="max-w-[min(92vw,900px)] border-0 bg-background/95 p-2 backdrop-blur sm:max-w-[min(92vw,900px)]">
            <DialogTitle className="sr-only">{name}</DialogTitle>
            <div className="relative aspect-square w-full">
              <Image src={current.url} alt={current.alternativeText ?? name} fill sizes="900px" className="object-contain p-6" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
