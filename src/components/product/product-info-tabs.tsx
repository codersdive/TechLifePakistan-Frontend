"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { BadgeCheck, Download, FileText, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product, Review } from "@/types"
import { RatingStars } from "./rating-stars"
import { ReviewDialog } from "./review-dialog"
import { SpecsTable } from "./specs-table"

/** Minimal markdown renderer for Strapi rich-text (headings, bold, lists, paragraphs). */
function Markdown({ source }: { source: string }) {
  const bold = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p))
  return (
    <div className="space-y-4 leading-relaxed text-muted-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
      {source.split(/\n\n+/).map((block, i) => {
        if (block.startsWith("## ")) return <h3 key={i} className="pt-2 font-display text-xl font-bold">{block.slice(3)}</h3>
        if (block.startsWith("- "))
          return (
            <ul key={i} className="space-y-2">
              {block.split("\n").map((l, j) => (
                <li key={j} className="flex gap-2.5"><BadgeCheck className="mt-0.5 size-4.5 shrink-0 text-primary" /><span>{bold(l.slice(2))}</span></li>
              ))}
            </ul>
          )
        return <p key={i}>{bold(block)}</p>
      })}
    </div>
  )
}

export function Downloads({ product }: { product: Product }) {
  if (!product.downloads?.length) return null
  return (
    <div className="rounded-3xl border bg-card p-6">
      <p className="mb-3 font-display text-lg font-bold">Downloads</p>
      <ul className="space-y-2">
        {product.downloads.map((d) => (
          <li key={d.url}>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sale/10 text-sale"><FileText className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{d.label}</span>
                {d.size && <span className="text-xs text-muted-foreground">PDF · {d.size}</span>}
              </span>
              <Download className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Reviews({ product, reviews }: { product: Product; reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="flex max-w-xl flex-col items-center gap-3 rounded-3xl border border-dashed p-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-accent"><Star className="size-7 text-primary" /></span>
        <p className="font-display text-lg font-bold">No reviews yet</p>
        <p className="text-sm text-muted-foreground">Bought the {product.name}? Be the first to share your experience.</p>
        <ReviewDialog product={product} className="mt-2" />
      </div>
    )
  }
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }))
  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <div className="h-fit rounded-3xl border bg-surface p-6 text-center lg:sticky lg:top-28">
        <p className="font-display text-6xl font-extrabold">{product.rating.toFixed(1)}</p>
        <RatingStars rating={product.rating} size="md" className="mt-2 justify-center" />
        <p className="mt-1 text-sm text-muted-foreground">Based on {product.reviewCount} reviews</p>
        <div className="mt-6 space-y-2">
          {dist.map(({ s, n }) => (
            <div key={s} className="flex items-center gap-2 text-sm">
              <span className="flex w-8 items-center gap-0.5">{s}<Star className="size-3 fill-rating text-rating" /></span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full rounded-full bg-rating" initial={{ width: 0 }} whileInView={{ width: `${(n / reviews.length) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              </div>
              <span className="w-6 text-right text-muted-foreground">{n}</span>
            </div>
          ))}
        </div>
        <ReviewDialog product={product} className="mt-6 w-full" />
      </div>
      <ul className="divide-y">
        {reviews.map((r) => (
          <li key={r.documentId} className="py-6 first:pt-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-accent font-bold text-primary">{r.author[0]}</span>
                <div>
                  <p className="flex items-center gap-1.5 font-semibold">
                    {r.author}
                    {r.verified && <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><BadgeCheck className="size-3.5" />Verified buyer</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
                </div>
              </div>
              <RatingStars rating={r.rating} />
            </div>
            {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
            <p className="mt-1 text-muted-foreground">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProductInfoTabs({ product, reviews }: { product: Product; reviews: Review[] }) {
  const tabs = [
    { key: "description", label: "Description" },
    { key: "specs", label: "Specifications" },
    { key: "reviews", label: product.reviewCount ? `Reviews (${product.reviewCount})` : "Reviews" },
    { key: "shipping", label: "Shipping & Warranty" },
  ]
  const [active, setActive] = useState(tabs[0].key)

  return (
    <section className="container-store py-16" id="details">
      <div role="tablist" className="no-scrollbar mb-8 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn("relative shrink-0 px-4 pb-3 pt-2 text-sm font-semibold transition-colors sm:px-6 sm:text-base", active === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t.label}
            {active === t.key && <motion.span layoutId="pdp-tab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
      <motion.div key={active} role="tabpanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {active === "description" && (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <Markdown source={product.description} />
            <div className="h-fit space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl border bg-surface p-6">
                <p className="mb-4 font-display text-lg font-bold">Key specifications</p>
                <SpecsTable specs={product.specs.slice(0, 5)} />
              </div>
              <Downloads product={product} />
            </div>
          </div>
        )}
        {active === "specs" && (
          <div className="max-w-3xl space-y-6">
            <SpecsTable
              specs={[
                { label: "Brand", value: product.brand?.name ?? "—" },
                ...(product.model ? [{ label: "Model", value: product.model }] : []),
                { label: "SKU", value: product.sku },
                ...product.specs,
                ...(product.warranty ? [{ label: "Warranty", value: product.warranty }] : []),
              ]}
            />
            <Downloads product={product} />
          </div>
        )}
        {active === "reviews" && <Reviews product={product} reviews={reviews} />}
        {active === "shipping" && (
          <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              ["Delivery time", "2–3 working days in Karachi, Lahore & Islamabad; 3–5 days elsewhere."],
              ["Shipping charges", "Free over Rs. 5,000. Flat Rs. 250 below that."],
              ["Cash on Delivery", "Pay in cash when your parcel arrives. Open-parcel check allowed."],
              ["Warranty", `${product.warranty ? `${product.warranty} warranty` : "Warranty"} against manufacturing defects, as per the brand’s warranty card. Keep your invoice & warranty card.`],
              ["Returns", "3-day return / exchange if the product is unused and in original packaging."],
              ["Service areas", "We currently don’t deliver to Balochistan and Azad Kashmir."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border p-5">
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
