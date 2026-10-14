import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { AuthorizedDealerBadge } from "@/components/common/authorized-dealer"
import { Logo } from "@/components/common/logo"
import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/social"
import type { SiteSettings } from "@/lib/site"
import type { Category } from "@/types"
import { NewsletterForm } from "./newsletter-form"

const columns = [
  {
    title: "Information",
    links: [
      { href: "/about", label: "About us" },
      { href: "/policies/privacy", label: "Privacy policy" },
      { href: "/policies/delivery", label: "Delivery policy" },
      { href: "/policies/returns", label: "Refund & returns" },
      { href: "/policies/terms", label: "Terms & conditions" },
    ],
  },
  {
    title: "Customer care",
    links: [
      { href: "/account", label: "My account" },
      { href: "/track-order", label: "Track order" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Contact us" },
    ],
  },
]


const payments = ["Cash on Delivery", "Bank Transfer", "JazzCash", "Easypaisa", "Visa / Mastercard"]

export function Footer({ categories, site }: { categories: Category[]; site: SiteSettings }) {
  const socials = [
    { href: site.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: site.socials.tiktok, label: "TikTok", Icon: TiktokIcon },
  ].filter((s) => s.href)
  return (
    <footer className="relative mt-24 overflow-hidden bg-announcement pb-20 text-announcement-foreground lg:pb-0">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.07] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />

      <div className="container-store relative">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Get exclusive deals first</h2>
            <p className="mt-1 text-sm opacity-70">Flash sales, new arrivals and power-saving tips — no spam.</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
          <div className="space-y-5">
            <Logo className="text-announcement-foreground [&_.text-logo-green]:text-[#10c995]" />
            <AuthorizedDealerBadge className="flex w-fit border-[#10c995]/40 bg-[#10c995]/10 text-[#10c995]" />
            <p className="max-w-xs text-sm leading-relaxed opacity-70">{site.description}</p>
            <div className="flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/8 transition-all hover:-translate-y-1 hover:bg-primary">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em]">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="opacity-70 transition-all hover:pl-1 hover:opacity-100">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em]">{col.title}</h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="opacity-70 transition-all hover:pl-1 hover:opacity-100">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em]">Get in touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 opacity-80"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-accent" />{site.contact.address}</li>
              {site.contact.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/[\s()]/g, "")}`} className="flex gap-3 opacity-80 hover:opacity-100"><Phone className="size-4 shrink-0 text-brand-accent" />{p}</a>
                </li>
              ))}
              <li><a href={`mailto:${site.contact.email}`} className="flex gap-3 opacity-80 hover:opacity-100"><Mail className="size-4 shrink-0 text-brand-accent" />{site.contact.email}</a></li>
              <li className="flex gap-3 opacity-80"><Clock className="size-4 shrink-0 text-brand-accent" />{site.contact.hours}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs opacity-70 lg:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {payments.map((p) => (
              <li key={p} className="rounded-md border border-white/15 px-2 py-1">{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
