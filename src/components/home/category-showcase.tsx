import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { DynamicIcon } from "@/components/common/dynamic-icon"
import { SectionHeading } from "@/components/common/section-heading"
import { Stagger, StaggerItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="container-store py-16">
      <SectionHeading eyebrow="Shop by category" title="Power products you can rely on" href="/shop" linkLabel="All products" />
      <Stagger className={cn("grid gap-4 sm:gap-6", categories.length > 1 && "md:grid-cols-2")} stagger={0.12}>
        {categories.map((c, i) => (
          <StaggerItem key={c.slug} className="h-full">
            <Link
              href={`/category/${c.slug}`}
              className={cn(
                "group relative flex h-full min-h-72 overflow-hidden rounded-[2rem] border p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl sm:p-9",
                i % 2 === 0
                  ? "bg-gradient-to-br from-[oklch(0.24_0.04_262)] to-[oklch(0.16_0.03_262)] text-white hover:shadow-primary/20"
                  : "bg-gradient-to-br from-accent via-surface to-background hover:shadow-primary/10"
              )}
            >
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_80%_50%,black,transparent_70%)]" />
              <div className="relative z-10 flex max-w-[58%] flex-col">
                <span className={cn("grid size-12 place-items-center rounded-2xl", i % 2 === 0 ? "bg-white/12 ring-1 ring-white/20" : "bg-primary/10 text-primary")}>
                  <DynamicIcon name={c.icon} className="size-6" />
                </span>
                <h3 className="mt-5 text-2xl leading-tight font-extrabold sm:text-3xl">{c.name}</h3>
                <p className={cn("mt-2 text-sm leading-relaxed", i % 2 === 0 ? "text-white/70" : "text-muted-foreground")}>{c.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold">
                  Explore {c.productCount} products
                  <span className={cn("grid size-8 place-items-center rounded-full transition-transform group-hover:translate-x-1", i % 2 === 0 ? "bg-white text-[oklch(0.2_0.03_260)]" : "bg-primary text-primary-foreground")}>
                    <ArrowRight className="size-4" />
                  </span>
                </span>
              </div>
              {c.image && (
                <Image
                  src={c.image.url}
                  alt={c.image.alternativeText ?? ""}
                  width={420}
                  height={420}
                  sizes="(min-width: 768px) 22vw, 45vw"
                  className="absolute -right-6 bottom-0 top-0 my-auto h-[88%] w-auto object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-105 sm:right-0"
                />
              )}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
