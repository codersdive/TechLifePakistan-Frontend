import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"
import { ProductCarousel } from "@/components/product/product-carousel"
import type { Product } from "@/types"
import { Countdown } from "./countdown"

export function FlashSale({ products }: { products: Product[] }) {
  return (
    <section className="container-store py-8">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sale via-[color-mix(in_oklch,var(--sale)_80%,var(--brand-accent))] to-brand-accent p-5 sm:p-8 lg:p-10">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <Zap className="pointer-events-none absolute -right-10 -top-10 size-72 rotate-12 fill-white/10 stroke-none" />
        <div className="relative mb-8 flex flex-wrap items-end justify-between gap-6 text-white">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">
              <Zap className="size-3.5 fill-current" /> Flash sale
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Today’s hottest deals</h2>
            <p className="mt-1 opacity-85">Prices drop at midnight. Limited stock — grab them before they’re gone.</p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <Countdown />
            <Link href="/shop?tag=flash-sale" className="group inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline">
              See all deals <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        <div className="relative">
          <ProductCarousel products={products} />
        </div>
      </Reveal>
    </section>
  )
}
