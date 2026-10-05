import "server-only"

import { headers as requestHeaders } from "next/headers"

/**
 * Minimal GraphQL client for the Strapi backend (server-side only — the browser never talks
 * to Strapi directly, so tokens and the backend URL stay private).
 */

export const STRAPI_URL = (process.env.STRAPI_URL ?? "").replace(/\/$/, "")
export const isStrapiEnabled = () => STRAPI_URL.length > 0

export class StrapiError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = "StrapiError"
  }
}

interface GqlOptions {
  /** Customer JWT (from the session cookie) for authenticated operations. */
  jwt?: string
  /** Cache tags for on-demand revalidation via /api/revalidate. */
  tags?: string[]
  /** Seconds to cache (catalogue reads). Omit / 0 for no caching (mutations, customer data). */
  revalidate?: number
}

export async function gql<T>(query: string, variables: Record<string, unknown> = {}, opts: GqlOptions = {}): Promise<T> {
  if (!isStrapiEnabled()) throw new StrapiError("STRAPI_URL is not configured")

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = opts.jwt ?? process.env.STRAPI_API_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  const cacheable = !opts.jwt && (opts.revalidate ?? 0) > 0
  // Customer actions (uncached) carry the shopper's IP so Strapi's rate limiter (CF-Connecting-IP mode)
  // limits each visitor separately. Cached catalogue reads come from this server and are allowlisted.
  if (!cacheable) {
    const ip = await clientIp()
    if (ip) headers["CF-Connecting-IP"] = ip
  }
  const res = await fetch(`${STRAPI_URL}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...(cacheable
      ? { next: { revalidate: opts.revalidate, tags: ["strapi", ...(opts.tags ?? [])] } }
      : { cache: "no-store" as const }),
  })

  if (res.status === 429) throw new StrapiError("Too many requests — please wait a minute and try again.", "RATE_LIMITED")

  let json: { data?: T; errors?: { message: string; extensions?: { code?: string } }[] }
  try {
    json = await res.json()
  } catch {
    throw new StrapiError(`Strapi responded with HTTP ${res.status}`)
  }
  if (json.errors?.length) {
    const [first] = json.errors
    throw new StrapiError(first.message, first.extensions?.code)
  }
  if (!json.data) throw new StrapiError("Empty response from Strapi")
  return json.data
}

/** Strapi serves uploads with relative URLs ("/uploads/x.webp") — make them absolute. */
export function mediaUrl(url?: string | null) {
  if (!url) return ""
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`
}

/** Shopper IP from the proxy headers (Nginx / Vercel set x-forwarded-for / x-real-ip). */
async function clientIp() {
  try {
    const h = await requestHeaders()
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined
  } catch {
    return undefined // outside a request (build time)
  }
}
