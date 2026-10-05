/**
 * Domain types, shaped like Strapi v5 flattened REST responses
 * (documentId + attributes at top level, media as { url, alternativeText }).
 */

export interface Media {
  url: string
  alternativeText?: string | null
  width?: number
  height?: number
}

export interface Spec {
  label: string
  value: string
}

export interface Category {
  id: number
  documentId: string
  name: string
  slug: string
  description?: string
  icon: string // lucide icon name, see components/common/dynamic-icon
  image?: Media
  parent?: Pick<Category, "documentId" | "name" | "slug"> | null
  children?: Pick<Category, "documentId" | "name" | "slug">[]
  productCount?: number
}

export interface Brand {
  id: number
  documentId: string
  name: string
  slug: string
  logo?: Media
}

export interface Review {
  id: number
  documentId: string
  author: string
  rating: number
  title?: string
  body: string
  createdAt: string
  verified?: boolean
}

export interface Product {
  id: number
  documentId: string
  name: string
  slug: string
  sku: string
  model?: string
  shortDescription: string
  description: string // rich text / markdown from Strapi
  price: number
  compareAtPrice?: number | null
  stock: number
  images: Media[]
  category: Pick<Category, "documentId" | "name" | "slug">
  brand?: Pick<Brand, "documentId" | "name" | "slug"> | null
  specs: Spec[]
  highlights?: string[]
  warranty?: string
  /** Option names customers choose from, e.g. ["Voltage", "Current"] (max 3). */
  options?: string[]
  /** Buyable versions with their own price / SKU / stock. When present a variant must be chosen. */
  variants?: ProductVariant[]
  tags?: { name: string; slug: string }[]
  /** Downloadable files such as user manuals (Strapi media). */
  downloads?: { label: string; url: string; size?: string }[]
  rating: number
  reviewCount: number
  badges?: ("new" | "bestseller" | "featured" | "flash-sale")[]
  createdAt: string
}

export interface ProductVariant {
  sku: string
  title: string
  /** Values matching Product.options by position */
  values: string[]
  price: number
  compareAtPrice?: number | null
  stock: number
  image?: Media | null
}

export interface Banner {
  id: number
  documentId: string
  eyebrow?: string
  title: string
  subtitle?: string
  cta: { label: string; href: string }
  image: Media
  theme?: "primary" | "dark" | "accent"
}

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "rating"

export interface ProductQuery {
  category?: string
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  q?: string
  sort?: SortOption
  page?: number
  pageSize?: number
  tag?: "new" | "bestseller" | "featured" | "flash-sale"
  /** Product tag slug (Strapi Tag collection) */
  tagSlug?: string
}

export interface Paginated<T> {
  data: T[]
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } }
}

export interface CartItem {
  /** Unique cart line: documentId + variant SKU */
  key: string
  documentId: string
  variantSku?: string
  variantTitle?: string
  slug: string
  name: string
  image: Media
  price: number
  compareAtPrice?: number | null
  quantity: number
  stock: number
}
