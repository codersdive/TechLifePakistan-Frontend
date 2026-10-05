import type { Banner } from "@/types"

export const heroBanners: Banner[] = [
  {
    id: 1,
    documentId: "hero-1",
    eyebrow: "Exotech MPPT Plus Hybrid",
    title: "Solar first. Grid when you need it.",
    subtitle: "Hybrid MPPT charge controllers with built-in B.M.S that switch between solar and grid automatically.",
    cta: { label: "Shop MPPT Controllers", href: "/category/solar-charge-controllers" },
    image: { url: "/products/exotech-mppt-hybrid.webp", alternativeText: "Exotech MPPT Plus Hybrid solar charge controller" },
    theme: "dark",
  },
  {
    id: 2,
    documentId: "hero-2",
    eyebrow: "Load-shedding? Sorted.",
    title: "Chargers that know when to stop",
    subtitle: "Fully automatic 3-stage battery chargers with clear LED status — charging, trickle and fully charged.",
    cta: { label: "Shop Battery Chargers", href: "/category/battery-chargers" },
    image: { url: "/products/exotech-3-stage-charger-blue.webp", alternativeText: "Exotech 3-stage automatic battery charger" },
    theme: "primary",
  },
  {
    id: 3,
    documentId: "hero-3",
    eyebrow: "Sencor SH 30A",
    title: "30 amps of 12V charging power",
    subtitle: "Dual digital displays show mains and charging current at a glance.",
    cta: { label: "View SH 30A", href: "/product/sencor-sh-30a-12-volt-battery-charger" },
    image: { url: "/products/sencor-sh-30a-charger.webp", alternativeText: "Sencor SH 30A 12 volt battery charger" },
    theme: "accent",
  },
]

export const promoBanners: Banner[] = [
  {
    id: 11,
    documentId: "promo-1",
    eyebrow: "Solar + grid",
    title: "MPPT Plus Hybrid controllers",
    cta: { label: "Shop now", href: "/category/solar-charge-controllers" },
    image: { url: "/products/exotech-mppt-hybrid.webp", alternativeText: "Exotech MPPT controller" },
    theme: "dark",
  },
  {
    id: 12,
    documentId: "promo-2",
    eyebrow: "Digital & automatic",
    title: "Battery chargers for every setup",
    cta: { label: "Shop now", href: "/category/battery-chargers" },
    image: { url: "/products/sencor-sh-30a-charger.webp", alternativeText: "Sencor SH 30A battery charger" },
    theme: "accent",
  },
]
