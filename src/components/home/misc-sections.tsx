import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { DynamicIcon } from "@/components/common/dynamic-icon"
import { Marquee } from "@/components/motion/marquee"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { getSiteSettings } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { Banner, Brand } from "@/types"

export async function TrustBadges() {
  const site = await getSiteSettings()
  return (
    <section className="container-store py-8">
      <Stagger className="grid grid-cols-2 gap-3 rounded-3xl border bg-surface p-3 sm:gap-4 lg:grid-cols-4">
        {site.trustBadges.map((b) => (
          <StaggerItem key={b.title} className="group flex flex-col items-start gap-3 rounded-2xl bg-card p-4 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
              <DynamicIcon name={b.icon} className="size-6" />
            </span>
            <span>
              <b className="block text-sm sm:text-base">{b.title}</b>
              <span className="text-xs text-muted-foreground sm:text-sm">{b.text}</span>
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export function PromoSplit({ banners }: { banners: Banner[] }) {
  return (
    <section className="container-store grid gap-4 py-8 md:grid-cols-2">
      {banners.map((b, i) => (
        <Reveal key={b.documentId} direction={i ? "left" : "right"}>
          <Link
            href={b.cta.href}
            className={cn(
              "group relative flex min-h-64 overflow-hidden rounded-3xl p-8 sm:p-10",
              b.theme === "accent" ? "bg-brand-accent text-brand-accent-foreground" : "bg-[oklch(0.2_0.035_262)] text-white"
            )}
          >
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-125" />
            <div className="relative z-10 flex max-w-[55%] flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-75">{b.eyebrow}</p>
              <p className="mt-2 font-display text-3xl leading-tight font-extrabold">{b.title}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 border-b-2 border-current pb-0.5 font-semibold">
                {b.cta.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
              </span>
            </div>
            <Image src={b.image.url} alt={b.image.alternativeText ?? ""} width={320} height={320} className="absolute -bottom-4 right-0 size-56 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105 sm:size-64" />
          </Link>
        </Reveal>
      ))}
    </section>
  )
}


export function BrandMarquee({ brands }: { brands: Brand[] }) {
  return (
    <section className="py-12">
      <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Brands we carry</p>
      <Marquee duration={30}>
        {Array.from({ length: Math.max(1, Math.ceil(8 / brands.length)) }, () => brands).flat().map((b, i) => (
          <Link
            key={`${b.slug}-${i}`}
            href={`/shop?brand=${b.slug}`}
            className="mx-3 flex h-20 min-w-48 items-center justify-center rounded-2xl border bg-card px-8 font-display text-2xl font-extrabold tracking-tight text-muted-foreground/70 grayscale transition-all hover:border-primary/40 hover:text-primary hover:grayscale-0"
          >
            {b.name}
          </Link>
        ))}
      </Marquee>
    </section>
  )
}


export async function AboutBlurb() {
  const site = await getSiteSettings()
  return (
    <section className="container-store py-8">
      <Reveal className="rounded-3xl border bg-surface p-8 sm:p-12">
        <h2 className="text-2xl font-extrabold">{site.name} — solar charge controllers & battery chargers</h2>
        <div className="mt-4 grid gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
          <p>
            {site.name} brings you Exotech MPPT Plus Hybrid solar charge controllers and automatic battery chargers from Exotech
            and Sencor. Every product is genuine, checked before dispatch and delivered with Cash on Delivery.
          </p>
          <p>
            Not sure which controller or charger suits your battery, panels or UPS? Message us on WhatsApp and we’ll help you pick
            the right product for your setup.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
