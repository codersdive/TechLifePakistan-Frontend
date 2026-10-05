"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react"
import { DynamicIcon } from "@/components/common/dynamic-icon"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

export function MegaMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const pathname = usePathname()
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setOpen(false)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const show = () => {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  const cat = categories[active]

  return (
    <div onMouseEnter={show} onMouseLeave={hide} className="static">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-95"
      >
        <LayoutGrid className="size-4" />
        All Categories
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full z-50 pt-2"
          >
            <div className="container-store">
              <div className="grid grid-cols-[260px_1fr_280px] overflow-hidden rounded-3xl border bg-popover shadow-2xl shadow-black/10">
                <ul className="border-r bg-muted/40 p-3">
                  {categories.map((c, i) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          i === active ? "text-primary" : "text-foreground/80 hover:text-foreground"
                        )}
                      >
                        {i === active && (
                          <motion.span layoutId="mega-active" className="absolute inset-0 rounded-xl bg-background shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                        )}
                        <DynamicIcon name={c.icon} className="relative size-4.5" />
                        <span className="relative flex-1">{c.name}</span>
                        <span className="relative text-xs text-muted-foreground">{c.productCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="p-7"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Shop by type</p>
                    <h3 className="mt-1 text-2xl font-extrabold">{cat.name}</h3>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">{cat.description}</p>
                    <div className="mt-6 grid grid-cols-2 gap-2">
                      {cat.children?.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/category/${cat.slug}`}
                          className="group flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-accent"
                        >
                          {s.name}
                          <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                    <Link href={`/category/${cat.slug}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      View all {cat.name} <ArrowRight className="size-4" />
                    </Link>
                  </motion.div>
                </AnimatePresence>

                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative m-3 flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground"
                >
                  <div className="bg-grid absolute inset-0 opacity-30" />
                  {cat.image && (
                    <Image src={cat.image.url} alt="" width={220} height={220} className="absolute -right-6 -top-4 drop-shadow-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                  )}
                  <span className="relative w-fit rounded-full bg-brand-accent px-2.5 py-1 text-[11px] font-bold text-brand-accent-foreground">{cat.productCount} products</span>
                  <p className="relative mt-2 font-display text-xl font-extrabold leading-tight">Explore {cat.name}</p>
                  <span className="relative mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                    Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
