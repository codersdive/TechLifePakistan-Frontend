import type { ProductQuery, SortOption } from "@/types"

export type SearchParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const num = (v: string | undefined) => (v && !Number.isNaN(+v) ? +v : undefined)

const SORTS: SortOption[] = ["featured", "newest", "price-asc", "price-desc", "rating"]
const TAGS = ["new", "bestseller", "featured", "flash-sale"] as const

/** URL search params → typed catalog query. The URL is the single source of truth for filters. */
export function parseShopParams(sp: SearchParams, fixed: Partial<ProductQuery> = {}): ProductQuery & { view: "grid" | "list" } {
  const sort = first(sp.sort) as SortOption | undefined
  const tag = first(sp.tag) as ProductQuery["tag"]
  return {
    category: first(sp.category),
    brands: first(sp.brand)?.split(",").filter(Boolean),
    minPrice: num(first(sp.min)),
    maxPrice: num(first(sp.max)),
    inStock: first(sp.stock) === "1",
    q: first(sp.q),
    sort: sort && SORTS.includes(sort) ? sort : "featured",
    tag: tag && TAGS.includes(tag) ? tag : undefined,
    tagSlug: first(sp.t),
    page: Math.max(1, num(first(sp.page)) ?? 1),
    pageSize: 12,
    view: first(sp.view) === "list" ? "list" : "grid",
    ...fixed,
  }
}
