"use client"

import { AnimatePresence, motion } from "motion/react"
import { LayoutGrid, List, Loader2, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Filters, type FilterProps } from "./filters"
import { useShopUrl } from "./use-shop-url"

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
]

const tagLabels: Record<string, string> = { "flash-sale": "Flash sale", bestseller: "Best sellers", new: "New", featured: "Featured" }

export function ShopToolbar({ total, filterProps }: { total: number; filterProps: FilterProps }) {
  const { params, update, pending } = useShopUrl()
  const view = params.get("view") === "list" ? "list" : "grid"

  const chips: { key: string; label: string; clear: Record<string, null | string> }[] = []
  const cat = params.get("category")
  if (cat && !filterProps.fixedCategory)
    chips.push({ key: "cat", label: filterProps.categories.find((c) => c.slug === cat)?.name ?? cat, clear: { category: null } })
  const brands = params.get("brand")?.split(",").filter(Boolean) ?? []
  for (const b of brands)
    chips.push({ key: `b-${b}`, label: filterProps.brands.find((x) => x.slug === b)?.name ?? b, clear: { brand: brands.filter((x) => x !== b).join(",") || null } })
  if (params.get("min") || params.get("max"))
    chips.push({
      key: "price",
      label: `${formatPrice(Number(params.get("min") ?? filterProps.bounds.min))} – ${formatPrice(Number(params.get("max") ?? filterProps.bounds.max))}`,
      clear: { min: null, max: null },
    })
  if (params.get("stock") === "1") chips.push({ key: "stock", label: "In stock", clear: { stock: null } })
  const tag = params.get("tag")
  if (tag) chips.push({ key: "tag", label: tagLabels[tag] ?? tag, clear: { tag: null } })
  const tagSlug = params.get("t")
  if (tagSlug) chips.push({ key: "t", label: `#${tagSlug.replace(/-/g, " ")}`, clear: { t: null } })

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-2.5 pl-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full lg:hidden">
              <SlidersHorizontal /> Filters {chips.length > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{chips.length}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88%] overflow-y-auto sm:max-w-sm">
            <SheetHeader>
              <SheetTitle className="font-display text-lg">Filters</SheetTitle>
              <SheetDescription>Narrow down {total} products</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8"><Filters {...filterProps} /></div>
          </SheetContent>
        </Sheet>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {pending && <Loader2 className="size-4 animate-spin text-primary" />}
          <span><b className="text-foreground">{total}</b> products</span>
        </p>

        <div className="ml-auto flex items-center gap-2">
          <Select value={params.get("sort") ?? "featured"} onValueChange={(v) => update({ sort: v === "featured" ? null : v })}>
            <SelectTrigger className="w-44 rounded-full" aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sorts.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="hidden rounded-full border p-0.5 sm:flex">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => update({ view: v === "grid" ? null : v }, { keepPage: true })}
                aria-label={`${v} view`}
                aria-pressed={view === v}
                className={cn("relative grid size-8 place-items-center rounded-full transition-colors", view === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {view === v && <motion.span layoutId="view-toggle" className="absolute inset-0 rounded-full bg-primary" />}
                {v === "grid" ? <LayoutGrid className="relative size-4" /> : <List className="relative size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-wrap items-center gap-2 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {chips.map((c) => (
                <motion.button
                  layout
                  key={c.key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  type="button"
                  onClick={() => update(c.clear)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  {c.label} <X className="size-3.5" />
                </motion.button>
              ))}
            </AnimatePresence>
            <motion.button
              layout
              type="button"
              onClick={() => update({ category: filterProps.fixedCategory ? undefined : null, brand: null, min: null, max: null, stock: null, tag: null, t: null })}
              className="px-2 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear all
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
