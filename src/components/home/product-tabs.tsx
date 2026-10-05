"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { SectionHeading } from "@/components/common/section-heading"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

export function ProductTabs({ tabs }: { tabs: { key: string; label: string; products: Product[] }[] }) {
  const [active, setActive] = useState(tabs[0].key)
  const current = tabs.find((t) => t.key === active)!

  return (
    <section className="container-store py-16">
      <SectionHeading eyebrow="Our range" title="Shop the products" href="/shop">
        <div role="tablist" className="flex rounded-full border bg-muted/50 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              onClick={() => setActive(t.key)}
              className={cn("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors", active === t.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {active === t.key && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </SectionHeading>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          role="tabpanel"
          className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-6"
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {current.products.slice(0, 10).map((p) => (
            <motion.div key={p.documentId} variants={{ hidden: { opacity: 0, y: 24, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
