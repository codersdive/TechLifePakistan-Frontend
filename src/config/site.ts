/**
 * Store-wide settings. Swap these (plus the CSS tokens in globals.css)
 * to rebrand. Later most of this can come from a Strapi "global" single type.
 */
export const siteConfig = {
  name: "Tech Life Pakistan",
  tagline: "Solar controllers & battery chargers.",
  description:
    "Authorized dealer of Exotech — genuine Exotech MPPT Plus Hybrid solar charge controllers and automatic battery chargers — with cash on delivery and nationwide shipping across Pakistan.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: { code: "PKR", symbol: "Rs." },
  contact: {
    phones: ["+92 300 1234567", "(021) 3456 7890"],
    email: "sales@techlifepakistan.pk", // TODO: confirm the store's real email
    whatsapp: "923290631461",
    address: "Shop 12, Electronics Market, Saddar, Karachi, Pakistan",
    hours: "Mon – Sat, 10:00am – 8:00pm",
  },
  announcements: [
    "Authorized dealer of Exotech in Pakistan",
    "Free delivery on orders above Rs. 5,000 — nationwide",
    "Cash on Delivery available across Pakistan",
    "100% original Exotech & Sencor products",
  ],
  shipping: {
    freeThreshold: 5000,
    flatRate: 250,
    restrictedRegions: ["Balochistan", "Azad Kashmir"],
  },
  socials: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    tiktok: "https://tiktok.com",
  },
  trustBadges: [
    { icon: "shield-check", title: "Authorized Exotech Dealer", text: "100% original, sourced direct" },
    { icon: "truck", title: "Fast Delivery", text: "2–5 working days nationwide" },
    { icon: "rotate-ccw", title: "Easy Returns", text: "3-day money-back / exchange" },
    { icon: "headset", title: "Expert Support", text: "Dedicated help, 7 days a week" },
  ],
} as const

export type SiteConfig = typeof siteConfig
