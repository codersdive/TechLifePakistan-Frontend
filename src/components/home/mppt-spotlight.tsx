import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BatteryCharging, Gauge, ShieldCheck, SunMedium, Zap } from "lucide-react"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { PriceTag } from "@/components/product/price-tag"
import type { Product } from "@/types"

const features = [
  { icon: SunMedium, title: "Solar first, grid assist", text: "Charges from solar and switches to grid automatically below 50% battery." },
  { icon: Gauge, title: "Auto 12V / 24V", text: "Detects your battery system on every start-up — up to 1500W / 3000W of PV." },
  { icon: BatteryCharging, title: "3-stage charging + B.M.S", text: "Constant current, constant voltage and float charging for longer battery life." },
  { icon: ShieldCheck, title: "Fully protected", text: "Over-charge, high PV voltage, reverse current, over-current and over-heat protection." },
]

/** Feature spotlight for the Exotech MPPT Plus Hybrid range (data from the user manual). */
export function MpptSpotlight({ products }: { products: Product[] }) {
  if (products.length === 0) return null
  return (
    <section className="container-store py-12">
      <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-surface via-background to-accent/50 p-6 sm:p-10 lg:p-14">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_60%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Zap className="size-3.5 fill-brand-accent text-brand-accent" /> Exotech MPPT Plus Hybrid
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">One controller for solar, battery and grid</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Connect your panels, battery and mains supply to a single unit. It keeps your inverter/UPS battery charged from the sun — and quietly brings in the grid only when it has to.
              </p>
            </Reveal>

            <Stagger className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <StaggerItem key={f.title} className="group rounded-2xl border bg-card/80 p-4 backdrop-blur transition-shadow hover:shadow-lg">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <p className="mt-3 font-semibold">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <Link
                  key={p.documentId}
                  href={`/product/${p.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <span>
                    <span className="block font-mono text-sm font-bold">{p.model}</span>
                    <span className="block text-xs text-muted-foreground">PV input up to {p.specs.find((s) => s.label.startsWith("PV input range (12V"))?.value.split("–")[1]?.trim()}</span>
                    <PriceTag price={p.price} size="sm" className="mt-1" />
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Reveal direction="left" className="relative">
            <div className="relative overflow-hidden rounded-3xl border bg-white p-3 shadow-xl">
              <Image
                src="/products/exotech-mppt-wiring-diagram.webp"
                alt="Wiring diagram: solar panels, battery, grid supply and inverter/UPS connected to the Exotech MPPT controller"
                width={1334}
                height={1182}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="h-auto w-full"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Typical installation — from the Exotech user manual</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
