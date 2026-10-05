import type { CartItem, Product, ProductVariant } from "@/types"

/** Shared by the client cart store and server actions. */
export const lineKey = (documentId: string, variantSku?: string | null) => `${documentId}::${variantSku ?? ""}`

export const toCartItem = (p: Product, quantity: number, variant?: ProductVariant | null): CartItem => ({
  key: lineKey(p.documentId, variant?.sku),
  documentId: p.documentId,
  variantSku: variant?.sku,
  variantTitle: variant?.title,
  slug: p.slug,
  name: p.name,
  image: variant?.image ?? p.images[0],
  price: variant ? variant.price : p.price,
  compareAtPrice: variant ? variant.compareAtPrice : p.compareAtPrice,
  quantity,
  stock: variant ? variant.stock : p.stock,
})
