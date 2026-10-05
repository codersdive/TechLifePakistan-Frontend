"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useShopUrl } from "./use-shop-url"

export function ShopPagination({ page, pageCount }: { page: number; pageCount: number }) {
  const { update } = useShopUrl()
  if (pageCount <= 1) return null
  const go = (p: number) => {
    update({ page: p > 1 ? String(p) : null }, { keepPage: true })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const btn = "grid size-10 place-items-center rounded-full border text-sm font-semibold transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></button>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(btn, p === page && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground")}
        >
          {p}
        </button>
      ))}
      <button type="button" className={btn} disabled={page >= pageCount} onClick={() => go(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></button>
    </nav>
  )
}
