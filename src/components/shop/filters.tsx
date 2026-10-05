"use client"

import Link from "next/link"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DynamicIcon } from "@/components/common/dynamic-icon"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Brand, Category } from "@/types"
import { useShopUrl } from "./use-shop-url"

export interface FilterProps {
  categories: Category[]
  brands: Brand[]
  bounds: { min: number; max: number }
  /** When set, category is fixed by the route (/category/[slug]). */
  fixedCategory?: string
}

function PriceFilter({ bounds }: { bounds: FilterProps["bounds"] }) {
  const { params, update } = useShopUrl()
  const urlMin = Number(params.get("min") ?? bounds.min)
  const urlMax = Number(params.get("max") ?? bounds.max)
  const [value, setValue] = useState<[number, number]>([urlMin, urlMax])
  // Keep the slider in sync when the URL changes elsewhere (e.g. "clear all").
  const [synced, setSynced] = useState(`${urlMin}-${urlMax}`)
  if (synced !== `${urlMin}-${urlMax}`) {
    setSynced(`${urlMin}-${urlMax}`)
    setValue([urlMin, urlMax])
  }

  return (
    <div className="space-y-4 px-1 pt-2">
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={500}
        value={value}
        onValueChange={(v) => setValue([v[0], v[1]])}
        onValueCommit={(v) =>
          update({ min: v[0] > bounds.min ? String(v[0]) : null, max: v[1] < bounds.max ? String(v[1]) : null })
        }
        aria-label="Price range"
      />
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="rounded-lg border bg-background px-2.5 py-1.5 font-medium tabular-nums">{formatPrice(value[0])}</span>
        <span className="text-muted-foreground">—</span>
        <span className="rounded-lg border bg-background px-2.5 py-1.5 font-medium tabular-nums">{formatPrice(value[1])}</span>
      </div>
    </div>
  )
}

export function Filters({ categories, brands, bounds, fixedCategory }: FilterProps) {
  const { params, update } = useShopUrl()
  const activeCat = fixedCategory ?? params.get("category")
  const activeBrands = params.get("brand")?.split(",").filter(Boolean) ?? []
  const inStock = params.get("stock") === "1"

  const toggleBrand = (slug: string) => {
    const next = activeBrands.includes(slug) ? activeBrands.filter((b) => b !== slug) : [...activeBrands, slug]
    update({ brand: next.join(",") || null })
  }

  return (
    <Accordion type="multiple" defaultValue={["category", "price", "brand", "availability"]} className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider hover:no-underline">Category</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-0.5">
            {!fixedCategory && (
              <li>
                <button type="button" onClick={() => update({ category: null })} className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent", !activeCat && "bg-accent font-semibold text-primary")}>
                  All products
                </button>
              </li>
            )}
            {categories.map((c) => {
              const active = activeCat === c.slug
              const cls = cn("flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent", active && "bg-accent font-semibold text-primary")
              const inner = (
                <>
                  <DynamicIcon name={c.icon} className="size-4 opacity-70" />
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.productCount}</span>
                </>
              )
              return (
                <li key={c.slug}>
                  {fixedCategory ? (
                    <Link href={`/category/${c.slug}`} className={cls}>{inner}</Link>
                  ) : (
                    <button type="button" onClick={() => update({ category: active ? null : c.slug })} className={cls}>{inner}</button>
                  )}
                </li>
              )
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {bounds.max > bounds.min && (
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-bold uppercase tracking-wider hover:no-underline">Price</AccordionTrigger>
          <AccordionContent>
            <PriceFilter bounds={bounds} />
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="brand">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider hover:no-underline">Brand</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-1">
            {brands.map((b) => (
              <li key={b.slug} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent">
                <Checkbox id={`brand-${b.slug}`} checked={activeBrands.includes(b.slug)} onCheckedChange={() => toggleBrand(b.slug)} />
                <Label htmlFor={`brand-${b.slug}`} className="flex-1 cursor-pointer font-normal">{b.name}</Label>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="availability" className="border-b-0">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider hover:no-underline">Availability</AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
            <Label htmlFor="in-stock" className="cursor-pointer font-normal">In stock only</Label>
            <Switch id="in-stock" checked={inStock} onCheckedChange={(v) => update({ stock: v ? "1" : null })} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
