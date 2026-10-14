"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Banner } from "@/types"

const DURATION = 6500
const EASE = [0.22, 1, 0.36, 1] as const

const themes: Record<NonNullable<Banner["theme"]>, string> = {
  primary: "from-primary via-primary to-[color-mix(in_oklch,var(--primary)_70%,black)] text-primary-foreground",
  dark: "from-[oklch(0.22_0.04_262)] via-[oklch(0.18_0.03_262)] to-[oklch(0.12_0.02_262)] text-white",
  accent: "from-brand-accent via-[color-mix(in_oklch,var(--brand-accent)_85%,orange)] to-[color-mix(in_oklch,var(--brand-accent)_65%,red)] text-brand-accent-foreground",
}

export function Hero({ slides, side }: { slides: Banner[]; side: Banner[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const go = useCallback((n: number) => setIndex((n + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => go(index + 1), DURATION)
    return () => clearTimeout(t)
  }, [index, paused, go])

  const s = slides[index]

  return (
    <section className="container-store pt-4 sm:pt-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div
          className="relative isolate min-h-[440px] overflow-hidden rounded-3xl sm:min-h-[480px] lg:min-h-[520px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={s.documentId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={cn("absolute inset-0 bg-gradient-to-br", themes[s.theme ?? "primary"])}
            >
              <div className="bg-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
              <motion.div
                className="absolute -right-24 top-1/2 size-[520px] -translate-y-1/2 rounded-full bg-white/15 blur-3xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <div className="relative grid h-full items-center gap-4 p-7 pb-16 sm:p-10 sm:pb-20 md:grid-cols-[1.1fr_1fr] lg:p-14">
                <div className="z-10 max-w-xl">
                  {[
                    s.eyebrow && (
                      <span key="e" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ring-1 ring-white/25 backdrop-blur">
                        <span className="size-1.5 animate-pulse rounded-full bg-current" /> {s.eyebrow}
                      </span>
                    ),
                    <h1 key="t" className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">{s.title}</h1>,
                    s.subtitle && <p key="s" className="mt-4 max-w-md text-base opacity-85 sm:text-lg">{s.subtitle}</p>,
                    <div key="c" className="mt-8 flex flex-wrap items-center gap-3">
                      <Link
                        href={s.cta.href}
                        className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-[oklch(0.2_0.03_260)] shadow-xl transition-transform hover:scale-105"
                      >
                        {s.cta.label}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link href="/shop" className="hidden h-12 items-center rounded-full px-5 font-semibold ring-1 ring-current/30 transition-colors hover:bg-white/10 sm:inline-flex">
                        Browse all
                      </Link>
                    </div>,
                  ]
                    .filter(Boolean)
                    .map((el, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease: EASE }}
                      >
                        {el}
                      </motion.div>
                    ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: EASE }}
                  className="pointer-events-none absolute -bottom-12 -right-12 size-52 opacity-25 min-[400px]:size-60 sm:-bottom-10 sm:-right-10 sm:size-64 sm:opacity-60 md:relative md:bottom-auto md:right-auto md:size-auto md:opacity-100"
                >
                  <div className="relative mx-auto aspect-square w-full max-w-[420px] animate-float">
                    <motion.div
                      className="absolute inset-0"
                      animate={{ scale: [1, 1.06] }}
                      transition={{ duration: DURATION / 1000, ease: "linear" }}
                    >
                      <Image src={s.image.url} alt={s.image.alternativeText ?? ""} fill priority sizes="(min-width: 768px) 40vw, 60vw" className="object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.35)]" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute inset-x-7 bottom-6 z-20 flex items-center justify-between sm:inset-x-10 lg:inset-x-14">
            <div className="flex gap-2">
              {slides.map((sl, i) => (
                <button
                  key={sl.documentId}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/30 sm:w-14"
                >
                  {i === index && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      initial={{ width: paused ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="hidden gap-2 sm:flex">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/30">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/30">
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Side promo tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {side.map((b, i) => (
            <motion.div
              key={b.documentId}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: EASE }}
            >
              <Link
                href={b.cta.href}
                className={cn(
                  "group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-6",
                  themes[b.theme ?? "dark"]
                )}
              >
                <div className="bg-grid absolute inset-0 opacity-15" />
                <div className="relative z-10 max-w-[60%]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">{b.eyebrow}</p>
                  <p className="mt-2 font-display text-2xl leading-tight font-extrabold">{b.title}</p>
                </div>
                <span className="relative z-10 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/25 backdrop-blur transition-colors group-hover:bg-white group-hover:text-[oklch(0.2_0.03_260)]">
                  {b.cta.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
                <Image
                  src={b.image.url}
                  alt=""
                  width={220}
                  height={220}
                  className="absolute -bottom-6 -right-6 size-44 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 xl:size-52"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
