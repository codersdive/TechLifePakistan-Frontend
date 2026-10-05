import "server-only"

import { cache } from "react"
import { siteConfig } from "@/config/site"
import { gql, isStrapiEnabled } from "@/lib/strapi/client"

/** Store-wide settings: Strapi "Store settings" single type, falling back to src/config/site.ts. */
export interface SiteSettings {
  name: string
  tagline: string
  description: string
  url: string
  currency: { code: string; symbol: string }
  contact: { phones: string[]; email: string; whatsapp: string; address: string; hours: string }
  announcements: string[]
  shipping: { freeThreshold: number; flatRate: number; restrictedRegions: string[] }
  socials: { facebook?: string; instagram?: string; youtube?: string; tiktok?: string }
  trustBadges: { icon: string; title: string; text: string }[]
}

const defaults: SiteSettings = {
  name: siteConfig.name,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  url: siteConfig.url,
  currency: siteConfig.currency,
  contact: { ...siteConfig.contact, phones: [...siteConfig.contact.phones] },
  announcements: [...siteConfig.announcements],
  shipping: { ...siteConfig.shipping, restrictedRegions: [...siteConfig.shipping.restrictedRegions] },
  socials: siteConfig.socials,
  trustBadges: siteConfig.trustBadges.map((b) => ({ ...b })),
}

type SGlobal = {
  storeName?: string | null
  tagline?: string | null
  description?: string | null
  announcements?: { text: string }[]
  contact?: { phones?: { text: string }[]; email?: string | null; whatsapp?: string | null; address?: string | null; hours?: string | null } | null
  shipping?: { freeThreshold?: number | null; flatRate?: number | null; restrictedRegions?: { text: string }[] } | null
  socials?: SiteSettings["socials"] | null
  trustBadges?: { icon: string; title: string; text?: string | null }[]
}

const or = <T,>(v: T | null | undefined, fallback: T) => (v === null || v === undefined || v === "" ? fallback : v)
const orList = <T,>(v: T[] | null | undefined, fallback: T[]) => (v && v.length ? v : fallback)

/** Cached per request (React `cache`) and across requests (fetch cache, tag "global"). */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isStrapiEnabled()) return defaults
  try {
    const { global: g } = await gql<{ global: SGlobal | null }>(
      `{
        global {
          storeName tagline description
          announcements { text }
          contact { phones { text } email whatsapp address hours }
          shipping { freeThreshold flatRate restrictedRegions { text } }
          socials { facebook instagram youtube tiktok }
          trustBadges { icon title text }
        }
      }`,
      {},
      { revalidate: 300, tags: ["global"] }
    )
    if (!g) return defaults
    return {
      ...defaults,
      name: or(g.storeName, defaults.name),
      tagline: or(g.tagline, defaults.tagline),
      description: or(g.description, defaults.description),
      announcements: orList(g.announcements?.map((a) => a.text), defaults.announcements),
      contact: {
        phones: orList(g.contact?.phones?.map((p) => p.text), defaults.contact.phones),
        email: or(g.contact?.email, defaults.contact.email),
        whatsapp: or(g.contact?.whatsapp, defaults.contact.whatsapp),
        address: or(g.contact?.address, defaults.contact.address),
        hours: or(g.contact?.hours, defaults.contact.hours),
      },
      shipping: {
        freeThreshold: Number(or(g.shipping?.freeThreshold, defaults.shipping.freeThreshold)),
        flatRate: Number(or(g.shipping?.flatRate, defaults.shipping.flatRate)),
        restrictedRegions: g.shipping?.restrictedRegions ? g.shipping.restrictedRegions.map((r) => r.text) : defaults.shipping.restrictedRegions,
      },
      socials: { ...defaults.socials, ...(g.socials ?? {}) },
      trustBadges: orList(
        g.trustBadges?.map((b) => ({ icon: b.icon.replace(/_/g, "-"), title: b.title, text: b.text ?? "" })),
        defaults.trustBadges
      ),
    }
  } catch (error) {
    console.error("[site] falling back to static settings:", (error as Error).message)
    return defaults
  }
})
