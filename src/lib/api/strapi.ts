import "server-only"

import { gql, mediaUrl } from "@/lib/strapi/client"
import type { Banner, Brand, Category, Media, Paginated, Product, ProductQuery, Review, SortOption } from "@/types"

/** Catalogue reads are cached; Strapi's webhook revalidates them on publish (see /api/revalidate). */
const CACHE = { revalidate: 300 }

/* ───────────── GraphQL documents ───────────── */

const MEDIA = `url alternativeText width height`

const PRODUCT_FIELDS = /* GraphQL */ `
  documentId
  name
  slug
  sku
  model
  shortDescription
  description
  price
  compareAtPrice
  stock
  warranty
  rating
  reviewCount
  isFeatured
  isNew
  isBestseller
  isFlashSale
  createdAt
  images { ${MEDIA} }
  category { documentId name slug }
  brand { documentId name slug }
  specs { label value }
  highlights { text }
  downloads { label file { url size ext } }
  options { name }
  variants { title option1 option2 option3 sku price compareAtPrice stock image { ${MEDIA} } }
  tags { name slug }
`

/* ───────────── Mappers (Strapi → storefront domain types) ───────────── */

type SMedia = { url: string; alternativeText?: string | null; width?: number | null; height?: number | null }
type SProduct = {
  documentId: string
  name: string
  slug: string
  sku: string
  model?: string | null
  shortDescription: string
  description?: string | null
  price: number
  compareAtPrice?: number | null
  stock: number
  warranty?: string | null
  rating?: number | null
  reviewCount?: number | null
  isFeatured?: boolean | null
  isNew?: boolean | null
  isBestseller?: boolean | null
  isFlashSale?: boolean | null
  createdAt: string
  images: SMedia[]
  category?: { documentId: string; name: string; slug: string } | null
  brand?: { documentId: string; name: string; slug: string } | null
  specs?: { label: string; value: string }[] | null
  highlights?: { text: string }[] | null
  downloads?: { label: string; file?: { url: string; size?: number | null; ext?: string | null } | null }[] | null
  options?: { name: string }[] | null
  variants?: {
    title: string
    option1?: string | null
    option2?: string | null
    option3?: string | null
    sku: string
    price: number
    compareAtPrice?: number | null
    stock: number
    image?: SMedia | null
  }[] | null
  tags?: { name: string; slug: string }[] | null
}

const toMedia = (m: SMedia | null | undefined, fallbackAlt = ""): Media => ({
  url: mediaUrl(m?.url),
  alternativeText: m?.alternativeText ?? fallbackAlt,
  width: m?.width ?? undefined,
  height: m?.height ?? undefined,
})

const formatSize = (kb?: number | null) => (kb ? (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`) : undefined)

// Stable numeric id derived from the documentId (the UI only needs it as a React/seed key).
const numericId = (documentId: string) => [...documentId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

function toProduct(p: SProduct): Product {
  const badges: NonNullable<Product["badges"]> = []
  if (p.isFeatured) badges.push("featured")
  if (p.isNew) badges.push("new")
  if (p.isBestseller) badges.push("bestseller")
  if (p.isFlashSale) badges.push("flash-sale")
  const options = (p.options ?? []).map((o) => o.name).slice(0, 3)
  const variants = (p.variants ?? []).map((v) => ({
    sku: v.sku,
    title: v.title,
    values: [v.option1, v.option2, v.option3].slice(0, Math.max(options.length, 1)).map((x) => x ?? ""),
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
    stock: v.stock,
    image: v.image ? toMedia(v.image, `${p.name} — ${v.title}`) : null,
  }))
  // For variant products the card shows the cheapest variant ("From …") and total stock.
  const cheapest = variants.length ? variants.reduce((a, b) => (b.price < a.price ? b : a)) : null
  return {
    id: numericId(p.documentId),
    documentId: p.documentId,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    model: p.model ?? undefined,
    shortDescription: p.shortDescription,
    description: p.description ?? "",
    price: cheapest ? cheapest.price : Number(p.price),
    compareAtPrice: cheapest ? cheapest.compareAtPrice : p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    stock: variants.length ? variants.reduce((n, v) => n + Math.max(0, v.stock), 0) : p.stock,
    options: variants.length ? options : undefined,
    variants: variants.length ? variants : undefined,
    tags: p.tags ?? [],
    images: p.images.length ? p.images.map((m) => toMedia(m, p.name)) : [{ url: "", alternativeText: p.name }],
    category: p.category ?? { documentId: "", name: "Uncategorised", slug: "" },
    brand: p.brand ?? null,
    specs: p.specs ?? [],
    highlights: (p.highlights ?? []).map((h) => h.text),
    downloads: (p.downloads ?? [])
      .filter((d) => d.file?.url)
      .map((d) => ({ label: d.label, url: mediaUrl(d.file!.url), size: formatSize(d.file!.size) })),
    warranty: p.warranty ?? undefined,
    rating: Number(p.rating ?? 0),
    reviewCount: p.reviewCount ?? 0,
    badges,
    createdAt: p.createdAt,
  }
}

const SORTS: Record<SortOption, string[]> = {
  featured: ["isFeatured:desc", "name:asc"],
  newest: ["createdAt:desc"],
  "price-asc": ["price:asc"],
  "price-desc": ["price:desc"],
  rating: ["rating:desc", "reviewCount:desc"],
}

const TAG_FIELD = { featured: "isFeatured", new: "isNew", bestseller: "isBestseller", "flash-sale": "isFlashSale" } as const

/* ───────────── Catalogue ───────────── */

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  const { category, brands, minPrice, maxPrice, inStock, q, sort = "featured", tag, tagSlug, page = 1, pageSize = 12 } = query
  const and: Record<string, unknown>[] = []
  if (category) and.push({ category: { slug: { eq: category } } })
  if (brands?.length) and.push({ brand: { slug: { in: brands } } })
  if (minPrice != null) and.push({ price: { gte: minPrice } })
  if (maxPrice != null) and.push({ price: { lte: maxPrice } })
  if (inStock) and.push({ stock: { gt: 0 } })
  if (tag) and.push({ [TAG_FIELD[tag]]: { eq: true } })
  if (tagSlug) and.push({ tags: { slug: { eq: tagSlug } } })
  const needle = q?.trim()
  if (needle) {
    and.push({
      or: [
        { name: { containsi: needle } },
        { model: { containsi: needle } },
        { sku: { containsi: needle } },
        { category: { name: { containsi: needle } } },
        { brand: { name: { containsi: needle } } },
      ],
    })
  }

  const data = await gql<{
    products_connection: { nodes: SProduct[]; pageInfo: { page: number; pageSize: number; pageCount: number; total: number } }
  }>(
    `query Products($filters: ProductFiltersInput, $sort: [String], $page: Int, $pageSize: Int) {
      products_connection(filters: $filters, sort: $sort, pagination: { page: $page, pageSize: $pageSize }) {
        nodes { ${PRODUCT_FIELDS} }
        pageInfo { page pageSize pageCount total }
      }
    }`,
    { filters: and.length ? { and } : {}, sort: SORTS[sort] ?? SORTS.featured, page, pageSize },
    { ...CACHE, tags: ["products"] }
  )
  const { nodes, pageInfo } = data.products_connection
  return {
    data: nodes.map(toProduct),
    meta: { pagination: { page: pageInfo.page, pageSize: pageInfo.pageSize, pageCount: Math.max(1, pageInfo.pageCount), total: pageInfo.total } },
  }
}

export async function getProductBySlug(slug: string) {
  const data = await gql<{ products: SProduct[] }>(
    `query ProductBySlug($slug: String!) { products(filters: { slug: { eq: $slug } }, pagination: { pageSize: 1 }) { ${PRODUCT_FIELDS} } }`,
    { slug },
    { ...CACHE, tags: ["products", `product:${slug}`] }
  )
  return data.products[0] ? toProduct(data.products[0]) : null
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return []
  const data = await gql<{ products: SProduct[] }>(
    `query ProductsByIds($ids: [ID]) { products(filters: { documentId: { in: $ids } }, pagination: { pageSize: 100 }) { ${PRODUCT_FIELDS} } }`,
    { ids },
    { ...CACHE, tags: ["products"] }
  )
  const byId = new Map(data.products.map((p) => [p.documentId, toProduct(p)]))
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p)
}

export async function getAllProductSlugs() {
  const data = await gql<{ products: { slug: string }[] }>(`{ products(pagination: { pageSize: 1000 }) { slug } }`, {}, { ...CACHE, tags: ["products"] })
  return data.products.map((p) => p.slug)
}

export async function getRelatedProducts(product: Product, limit = 8) {
  // Hand-picked related products (Product → Related products in the dashboard) come first.
  const picked = await gql<{ products: { relatedProducts: SProduct[] }[] }>(
    `query Related($id: ID!) { products(filters: { documentId: { eq: $id } }) { relatedProducts { ${PRODUCT_FIELDS} } } }`,
    { id: product.documentId },
    { ...CACHE, tags: ["products"] }
  )
  const manual = (picked.products[0]?.relatedProducts ?? []).map(toProduct)
  if (manual.length >= limit) return manual.slice(0, limit)
  const [same, others] = await Promise.all([
    getProducts({ category: product.category.slug, pageSize: limit + 1 }),
    getProducts({ pageSize: limit + 1 }),
  ])
  const seen = new Set([product.documentId])
  return [...manual, ...same.data, ...others.data].filter((p) => !seen.has(p.documentId) && seen.add(p.documentId)).slice(0, limit)
}

export async function getProductsByTag(tag: NonNullable<Product["badges"]>[number], limit = 10) {
  return (await getProducts({ tag, pageSize: limit })).data
}

export async function getPriceBounds() {
  const data = await gql<{ low: { price: number }[]; high: { price: number }[] }>(
    `{ low: products(sort: "price:asc", pagination: { pageSize: 1 }) { price } high: products(sort: "price:desc", pagination: { pageSize: 1 }) { price } }`,
    {},
    { ...CACHE, tags: ["products"] }
  )
  return { min: Number(data.low[0]?.price ?? 0), max: Number(data.high[0]?.price ?? 0) }
}

/* ───────────── Taxonomy ───────────── */

type SCategory = {
  documentId: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  image?: SMedia | null
  children?: { documentId: string; name: string; slug: string }[]
}

export async function getCategories(): Promise<Category[]> {
  const data = await gql<{ categories: SCategory[]; products: { category?: { slug: string } | null }[] }>(
    `{
      categories(sort: ["sortOrder:asc", "name:asc"], filters: { parent: { documentId: { null: true } } }) {
        documentId name slug description icon image { ${MEDIA} }
        children { documentId name slug }
      }
      products(pagination: { pageSize: 1000 }) { category { slug } }
    }`,
    {},
    { ...CACHE, tags: ["categories", "products"] }
  )
  const counts = new Map<string, number>()
  for (const p of data.products) if (p.category) counts.set(p.category.slug, (counts.get(p.category.slug) ?? 0) + 1)
  return data.categories.map((c, i) => ({
    id: i + 1,
    documentId: c.documentId,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    icon: (c.icon ?? "package").replace(/_/g, "-"),
    image: c.image ? toMedia(c.image, c.name) : undefined,
    children: c.children ?? [],
    productCount: counts.get(c.slug) ?? 0,
  }))
}

export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null
}

export async function getBrands(): Promise<Brand[]> {
  const data = await gql<{ brands: { documentId: string; name: string; slug: string; logo?: SMedia | null }[] }>(
    `{ brands(sort: "name:asc") { documentId name slug logo { ${MEDIA} } } }`,
    {},
    { ...CACHE, tags: ["brands"] }
  )
  return data.brands.map((b, i) => ({ id: i + 1, documentId: b.documentId, name: b.name, slug: b.slug, logo: b.logo ? toMedia(b.logo, b.name) : undefined }))
}

/* ───────────── Marketing content ───────────── */

type SBanner = {
  documentId: string
  eyebrow?: string | null
  title: string
  subtitle?: string | null
  ctaLabel: string
  ctaHref: string
  image?: SMedia | null
  theme?: Banner["theme"] | null
}

async function getBanners(placement: "hero" | "promo"): Promise<Banner[]> {
  const data = await gql<{ banners: SBanner[] }>(
    `query Banners($placement: String) {
      banners(filters: { placement: { eq: $placement } }, sort: ["sortOrder:asc"]) {
        documentId eyebrow title subtitle ctaLabel ctaHref theme image { ${MEDIA} }
      }
    }`,
    { placement },
    { ...CACHE, tags: ["banners"] }
  )
  return data.banners.map((b, i) => ({
    id: i + 1,
    documentId: b.documentId,
    eyebrow: b.eyebrow ?? undefined,
    title: b.title,
    subtitle: b.subtitle ?? undefined,
    cta: { label: b.ctaLabel, href: b.ctaHref },
    image: toMedia(b.image, b.title),
    theme: b.theme ?? "primary",
  }))
}

export const getHeroBanners = () => getBanners("hero")
export const getPromoBanners = () => getBanners("promo")

/* ───────────── Reviews ───────────── */

export async function getReviews(productDocumentId: string): Promise<Review[]> {
  const data = await gql<{ reviews: { documentId: string; author: string; rating: number; title?: string | null; body: string; verified?: boolean | null; createdAt: string }[] }>(
    `query Reviews($id: ID!) {
      reviews(filters: { product: { documentId: { eq: $id } } }, sort: "createdAt:desc", pagination: { pageSize: 50 }) {
        documentId author rating title body verified createdAt
      }
    }`,
    { id: productDocumentId },
    { ...CACHE, tags: ["reviews"] }
  )
  return data.reviews.map((r, i) => ({ ...r, id: i + 1, title: r.title ?? undefined, verified: r.verified ?? false }))
}

/* ───────────── Pages ───────────── */

export async function getFaqs() {
  const data = await gql<{ faqs: { question: string; answer: string; group: string }[] }>(
    `{ faqs(sort: ["sortOrder:asc"], pagination: { pageSize: 200 }) { question answer group } }`,
    {},
    { ...CACHE, tags: ["faqs"] }
  )
  const groups = new Map<string, [string, string][]>()
  for (const f of data.faqs) groups.set(f.group, [...(groups.get(f.group) ?? []), [f.question, f.answer]])
  return [...groups].map(([group, items]) => ({ group, items }))
}

export async function getPolicy(slug: string) {
  const data = await gql<{ policies: { title: string; slug: string; body: string }[] }>(
    `query Policy($slug: String!) { policies(filters: { slug: { eq: $slug } }) { title slug body } }`,
    { slug },
    { ...CACHE, tags: ["policies"] }
  )
  const p = data.policies[0]
  if (!p) return null
  // Body is markdown; the policy page renders it as a list of paragraphs/bullets.
  const body = p.body
    .split("\n")
    .map((l) => l.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean)
  return { title: p.title, body }
}

export async function getPolicySlugs() {
  const data = await gql<{ policies: { slug: string }[] }>(`{ policies { slug } }`, {}, { ...CACHE, tags: ["policies"] })
  return data.policies.map((p) => p.slug)
}
