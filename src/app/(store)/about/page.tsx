import type { Metadata } from "next"
import Image from "next/image"
import { HeartHandshake, ShieldCheck, Wrench, Zap } from "lucide-react"
import { TrustBadges } from "@/components/home/misc-sections"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { PageHero } from "@/components/shop/shop-view"
import { siteConfig } from "@/config/site"
import { getSiteSettings } from "@/lib/site"

export const metadata: Metadata = { title: "About us", description: `About ${siteConfig.name} — solar charge controllers and battery chargers.` }

// TODO(client): replace with the company's own story, history and figures.
const values = [
  { icon: ShieldCheck, title: "Only genuine", text: "100% original Exotech and Sencor products, checked before dispatch." },
  { icon: Zap, title: "Built for Pakistan", text: "Controllers and chargers made for load-shedding, voltage swings and solar." },
  { icon: HeartHandshake, title: "Honest advice", text: "We help you match the right controller or charger to your battery and panels." },
  { icon: Wrench, title: "After-sales care", text: "Support with installation questions and warranty claims." },
]

export default async function AboutPage() {
  const site = await getSiteSettings()
  return (
    <>
      <PageHero title={`About ${site.name}`} description={site.tagline} crumbs={[{ href: "/", label: "Home" }, { label: "About" }]} />
      <section className="container-store grid items-center gap-12 py-16 lg:grid-cols-2">
        <Reveal direction="right" className="space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Who we are</p>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Keeping batteries charged — from the sun and the grid</h2>
          <p>
            {site.name} supplies Exotech MPPT Plus Hybrid solar charge controllers and automatic battery chargers from Exotech
            and Sencor to homes and businesses across Pakistan.
          </p>
          <p>Our promise is simple: genuine products, fair prices, and real people who answer when you call or message.</p>
        </Reveal>
        <Reveal direction="left" className="relative aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent to-surface">
          <div className="bg-grid absolute inset-0 opacity-60" />
          <Image src="/products/exotech-mppt-hybrid.webp" alt="Exotech MPPT Plus Hybrid solar charge controller" fill sizes="(min-width: 1024px) 45vw, 90vw" className="animate-float object-contain p-12" />
        </Reveal>
      </section>
      <section className="container-store py-8">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title} className="rounded-3xl border bg-card p-6 transition-shadow hover:shadow-lg">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><v.icon className="size-6" /></span>
              <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <TrustBadges />
    </>
  )
}
