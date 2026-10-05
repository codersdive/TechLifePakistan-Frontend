import { brands, categories } from "@/data/categories"
import { heroBanners, promoBanners } from "@/data/banners"
import { products } from "@/data/products"
import { faqs, policies } from "@/data/content"
import { reviewsFor } from "@/data/reviews"
import type { Category, Paginated, Product, ProductQuery } from "@/types"

// Simulates network latency so loading states are exercised in dev.
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

function sortProducts(list: Product[], sort: ProductQuery["sort"]) {
  const out = [...list]
  switch (sort) {
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case "price-asc":
      return out.sort((a, b) => a.price - b.price)
    case "price-desc":
      return out.sort((a, b) => b.price - a.price)
    case "rating":
      return out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    default:
      return out.sort((a, b) => Number(b.badges?.includes("featured")) - Number(a.badges?.includes("featured")))
  }
}

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  await delay()
  const { category, brands: brandSlugs, minPrice, maxPrice, inStock, q, sort, tag, tagSlug, page = 1, pageSize = 12 } = query
  const needle = q?.trim().toLowerCase()
  let list = products.filter((p) => {
    if (category && p.category.slug !== category) return false
    if (brandSlugs?.length && !brandSlugs.includes(p.brand?.slug ?? "")) return false
    if (minPrice != null && p.price < minPrice) return false
    if (maxPrice != null && p.price > maxPrice) return false
    if (inStock && p.stock <= 0) return false
    if (tag && !p.badges?.includes(tag)) return false
    if (tagSlug && !p.tags?.some((t) => t.slug === tagSlug)) return false
    if (needle && ![p.name, p.model, p.category.name, p.brand?.name].join(" ").toLowerCase().includes(needle)) return false
    return true
  })
  list = sortProducts(list, sort)
  const total = list.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  return {
    data: list.slice((page - 1) * pageSize, page * pageSize),
    meta: { pagination: { page, pageSize, pageCount, total } },
  }
}

export async function getProductBySlug(slug: string) {
  await delay()
  return products.find((p) => p.slug === slug) ?? null
}

export async function getProductsByIds(ids: string[]) {
  await delay()
  return ids.map((id) => products.find((p) => p.documentId === id)).filter((p): p is Product => !!p)
}

export async function getAllProductSlugs() {
  return products.map((p) => p.slug)
}

export async function getRelatedProducts(product: Product, limit = 8) {
  await delay()
  return products.filter((p) => p.category.slug === product.category.slug && p.slug !== product.slug)
    .concat(products.filter((p) => p.category.slug !== product.category.slug))
    .slice(0, limit)
}

export async function getProductsByTag(tag: NonNullable<Product["badges"]>[number], limit = 10) {
  return (await getProducts({ tag, pageSize: limit })).data
}

export async function getCategories(): Promise<Category[]> {
  await delay(40)
  return categories.map((c) => ({ ...c, productCount: products.filter((p) => p.category.slug === c.slug).length }))
}

export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null
}

export async function getBrands() {
  return brands
}

export async function getHeroBanners() {
  return heroBanners
}

export async function getPromoBanners() {
  return promoBanners
}

export async function getReviews(productDocumentId: string) {
  return reviewsFor(products.findIndex((p) => p.documentId === productDocumentId) + 1)
}

export async function getFaqs(): Promise<{ group: string; items: [string, string][] }[]> {
  return faqs.map((g) => ({ group: g.group, items: g.items.map(([q, a]) => [q, a] as [string, string]) }))
}

export async function getPolicy(slug: string): Promise<{ title: string; body: string[] } | null> {
  return policies[slug] ?? null
}

export async function getPolicySlugs() {
  return Object.keys(policies)
}

export async function getPriceBounds() {
  const prices = products.map((p) => p.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
