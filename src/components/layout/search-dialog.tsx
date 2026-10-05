"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, Loader2, Search, TrendingUp } from "lucide-react"
import { DynamicIcon } from "@/components/common/dynamic-icon"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { formatPrice } from "@/lib/format"
import { useUI } from "@/stores/ui"
import type { Category, Paginated, Product } from "@/types"

const trending = ["MPPT", "EXO-M-100", "Battery charger", "Sencor SH 30A", "Exotech"]

export function SearchDialog({ categories }: { categories: Category[] }) {
  const open = useUI((s) => s.searchOpen)
  const setOpen = useUI((s) => s.setSearchOpen)
  const router = useRouter()
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !(e.target as HTMLElement).closest("input,textarea"))) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setOpen])

  useEffect(() => {
    const term = q.trim()
    if (!term) return
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(term)}&limit=6`, { signal: ctrl.signal })
        const json = (await res.json()) as Paginated<Product>
        setResults(json.data)
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, 180)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const go = (href: string) => {
    setOpen(false)
    setQ("")
    router.push(href)
  }
  const term = q.trim()
  const shown = term ? results : []

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search products" description="Search the catalog" className="top-[12%] translate-y-0 sm:max-w-2xl" shouldFilter={false}>
      <CommandInput value={q} onValueChange={setQ} placeholder="Search MPPT controllers, chargers, model numbers…" />
      <CommandList className="max-h-[60vh]">
        {term && !loading && shown.length === 0 && <CommandEmpty>No products match “{term}”.</CommandEmpty>}
        {term && loading && shown.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Searching…
          </div>
        )}
        {shown.length > 0 && (
          <CommandGroup heading="Products">
            {shown.map((p) => (
              <CommandItem key={p.documentId} value={p.slug} onSelect={() => go(`/product/${p.slug}`)} className="gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-surface">
                  <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.brand?.name} · {p.category.name}</span>
                </span>
                <span className="font-semibold">{formatPrice(p.price)}</span>
              </CommandItem>
            ))}
            <CommandItem value="__all" onSelect={() => go(`/search?q=${encodeURIComponent(term)}`)} className="justify-center font-semibold text-primary">
              See all results for “{term}” <ArrowRight className="size-4" />
            </CommandItem>
          </CommandGroup>
        )}
        {!term && (
          <>
            <CommandGroup heading="Trending searches">
              {trending.map((t) => (
                <CommandItem key={t} value={t} onSelect={() => setQ(t)}>
                  <TrendingUp className="text-primary" /> {t}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Categories">
              {categories.map((c) => (
                <CommandItem key={c.slug} value={c.slug} onSelect={() => go(`/category/${c.slug}`)}>
                  <DynamicIcon name={c.icon} /> {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Search className="size-3.5" /> Instant search</span>
        <span>Press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> to close</span>
      </div>
    </CommandDialog>
  )
}
