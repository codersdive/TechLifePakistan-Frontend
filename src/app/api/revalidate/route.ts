import { revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

/** Strapi content type (webhook `model`) → storefront cache tags. */
const TAGS: Record<string, string[]> = {
  product: ["products", "categories"],
  category: ["categories", "products"],
  brand: ["brands", "products"],
  banner: ["banners"],
  review: ["reviews", "products"],
  faq: ["faqs"],
  policy: ["policies"],
  global: ["global"],
  file: ["strapi"],
}

/**
 * Called by Strapi's "Storefront revalidation" webhook whenever content changes, so edits made in
 * the dashboard show up on the store without waiting for the cache to expire.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }
  const body = (await req.json().catch(() => ({}))) as { model?: string; event?: string }
  const tags = TAGS[body.model ?? ""] ?? []
  // Orders, coupons and inbox entries don't affect cached pages.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  return NextResponse.json({ ok: true, revalidated: tags })
}
