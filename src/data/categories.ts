import type { Brand, Category } from "@/types"

const sub = (name: string, slug: string) => ({ documentId: `sub-${slug}`, name, slug })

export const categories: Category[] = [
  {
    id: 1,
    documentId: "cat-mppt",
    name: "Solar Charge Controllers",
    slug: "solar-charge-controllers",
    icon: "sun",
    description: "Exotech MPPT Plus Hybrid solar charge controllers with built-in battery management and smart solar/grid switching.",
    image: { url: "/products/exotech-mppt-hybrid.webp", alternativeText: "Exotech MPPT Plus Hybrid solar charge controller" },
    children: [sub("MPPT Hybrid Controllers", "mppt-hybrid")],
  },
  {
    id: 2,
    documentId: "cat-chargers",
    name: "Battery Chargers",
    slug: "battery-chargers",
    icon: "battery-charging",
    description: "Automatic 12V battery chargers with LED status indicators and digital displays for UPS, solar and automotive batteries.",
    image: { url: "/products/exotech-3-stage-charger-blue.webp", alternativeText: "Exotech 3-stage automatic battery charger" },
    children: [sub("3-Stage Automatic", "3-stage-automatic"), sub("Digital Display", "digital-display")],
  },
]

export const brands: Brand[] = [
  { id: 1, documentId: "br-exotech", name: "Exotech", slug: "exotech" },
  { id: 2, documentId: "br-sencor", name: "Sencor", slug: "sencor" },
]
