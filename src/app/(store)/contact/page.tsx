import type { Metadata } from "next"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { WhatsappIcon } from "@/components/icons/social"
import { Reveal } from "@/components/motion/reveal"
import { PageHero } from "@/components/shop/shop-view"
import { getSiteSettings } from "@/lib/site"
import { whatsappLink } from "@/lib/format"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = { title: "Contact us", description: "Get in touch by phone, WhatsApp or email." }

export default async function ContactPage() {
  const site = await getSiteSettings()
  const cards = [
    { icon: Phone, title: "Call us", lines: site.contact.phones, href: `tel:${site.contact.phones[0].replace(/\s/g, "")}` },
    { icon: WhatsappIcon, title: "WhatsApp", lines: ["Fastest replies", "Chat with an expert"], href: whatsappLink(site.contact.whatsapp, "Hi! I need some help.") },
    { icon: Mail, title: "Email", lines: [site.contact.email], href: `mailto:${site.contact.email}` },
    { icon: MapPin, title: "Visit", lines: [site.contact.address] },
  ]
  return (
    <>
      <PageHero title="We’d love to help" description="Questions about a product, order or warranty? Reach us any way you like." crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} />
      <div className="container-store grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr]">
        <Reveal direction="right" className="grid content-start gap-4 sm:grid-cols-2">
          {cards.map((c) => {
            const inner = (
              <>
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><c.icon className="size-5" /></span>
                <p className="mt-4 font-bold">{c.title}</p>
                {c.lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
              </>
            )
            return c.href ? (
              <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group rounded-3xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">{inner}</a>
            ) : (
              <div key={c.title} className="group rounded-3xl border bg-card p-6">{inner}</div>
            )
          })}
          <div className="flex items-center gap-3 rounded-3xl border bg-surface p-5 text-sm sm:col-span-2">
            <Clock className="size-5 text-primary" /> {site.contact.hours}
          </div>
        </Reveal>
        <Reveal direction="left">
          <ContactForm />
        </Reveal>
      </div>
    </>
  )
}
