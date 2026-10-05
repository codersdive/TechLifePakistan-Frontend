import type { Product } from "@/types"
import { brands, categories } from "./categories"

/*
 * Client catalogue. Specs come from the Exotech MPPT user manual (docs/) and the
 * supplied product photos.
 *
 * TODO(client): prices and stock below are PLACEHOLDERS — no pricing was supplied.
 * Confirm prices, stock and warranty periods before going live.
 */

const MANUAL = { label: "User manual (PDF)", url: "/manuals/exotech-mppt-hybrid-user-manual.pdf", size: "6.6 MB" }

const img = (file: string, alt: string) => ({ url: `/products/${file}`, alternativeText: alt, width: 1200, height: 1200 })

const mpptImages = (model: string) => [
  img("exotech-mppt-hybrid.webp", `Exotech MPPT Plus Hybrid solar charge controller ${model}`),
  img("exotech-mppt-display.webp", "LCD and LED status panel of the Exotech hybrid solar charge controller"),
  img("exotech-mppt-wiring-diagram.webp", "Wiring diagram: solar panels, battery, grid and inverter/UPS connected to the Exotech MPPT"),
]

const mpptDescription = (model: string, pvMax: string, extra: string) => `## Overview

The **Exotech MPPT Plus Hybrid ${model}** is a solar charge controller with a built-in B.M.S (Battery Management System). It charges your battery from solar panels and automatically switches to grid power when the sun isn’t enough — so your inverter/UPS always has a charged battery behind it.

It auto-detects **12V or 24V** battery systems on every start-up and accepts PV input up to **${pvMax}**. ${extra}

## Smart solar + grid (hybrid) charging

- **Solar charging mode** — when solar energy is sufficient, the battery is charged from the panels only (yellow LED).
- **Hybrid charging mode** — when battery capacity falls below 50% or solar is insufficient, grid supply is switched on to assist charging until the battery reaches 100% (blue LED).
- **Stand-by mode** — if solar is interrupted, the grid charges the battery and the LCD shows “PV INTERRUPTED”.

## 3-stage charging for longer battery life

- **Constant current (CC)** bulk charging
- **Constant voltage (CV)** absorption charging
- **Float / trickle** charging — the green LED turns steady and the LCD shows “BATTERY CHARGED”

## Protections

- Battery over-charge protection (cuts off above 15V in 12V mode / 30V in 24V mode)
- High PV voltage warning and cut-off
- Solar reverse current protection
- Over-current and over-heat protection with automatic cooling fan
- Low battery alarm and indication

## Display & settings

The LCD shows PV voltage and current, battery voltage and charging current, and warning messages. Four LEDs show solar mode, charging/full, warning and hybrid mode. Battery full, float, solar/hybrid switch-over, DC load on/off and low-battery alarm voltages are all adjustable from the UP / DOWN / ENTER keys.

## Installation notes

- Mount vertically at eye level on a sturdy wall, in a shaded, airy place — not in direct sunlight.
- Use a DC breaker between the panels and the MPPT, and between the MPPT and the battery.
- Connect the battery first when installing; disconnect the solar first when removing.
- For best performance use at least 4 and up to 6 × 550W panels. Wiring should be done by a qualified installer.`

const mpptSpecs = (pv12: string, pv24: string) => [
  ["Type", "MPPT Plus Hybrid solar charge controller with B.M.S"],
  ["Battery system", "12V / 24V (auto-detect)"],
  ["PV input range (12V system)", pv12],
  ["PV input range (24V system)", pv24],
  ["Max. PV power", "1500W (12V) / 3000W (24V)"],
  ["Charging", "3-stage: CC, CV, float"],
  ["Hybrid switching", "Solar ↔ grid, automatic (grid assist below 50% battery)"],
  ["Display", "LCD + 4 status LEDs"],
  ["Connections", "Solar (+/−), Battery (+/−), Mains AC in (L/N), AC out for inverter/UPS"],
  ["Dry contact", "1 × NO/C/NC (DC load up to 5A or signal output)"],
  ["Over-charge cut-off", "15V (12V mode) / 30V (24V mode)"],
  ["Battery full voltage (default)", "14.6V / 29.2V"],
  ["Float voltage (default)", "13.8V / 27.6V"],
  ["Low battery warning (default)", "10.5V / 21.0V"],
  ["Cooling", "Automatic temperature-controlled fan"],
  ["Recommended array", "4–6 × 550W panels"],
] as [string, string][]

type Seed = Omit<Product, "id" | "documentId" | "slug" | "category" | "brand" | "specs" | "sku" | "createdAt" | "rating" | "reviewCount"> & {
  cat: string
  brandSlug: string
  specList: [string, string][]
}

const seeds: Seed[] = [
  {
    name: "MPPT Plus Hybrid Solar Charge Controller EXO-M-100",
    model: "EXO-M-100",
    cat: "solar-charge-controllers",
    brandSlug: "exotech",
    price: 0, // TODO(client): price
    stock: 10,
    images: mpptImages("EXO-M-100"),
    badges: ["featured"],
    shortDescription:
      "Hybrid MPPT solar charge controller with B.M.S — auto 12V/24V, PV input up to 170V, smart solar/grid switching and 3-stage charging.",
    description: mpptDescription(
      "EXO-M-100",
      "170V",
      "It includes **solar reverse polarity protection** and stops charging with a “HIGH PV VOLTAGE” warning if the array exceeds 150V."
    ),
    specList: [...mpptSpecs("30V – 170V", "60V – 170V"), ["High PV voltage cut-off", "150V"], ["Solar reverse polarity protection", "Yes"]],
    highlights: [
      "Auto 12V / 24V battery detection",
      "PV input up to 170V",
      "Automatic solar ↔ grid hybrid switching",
      "3-stage charging with built-in B.M.S",
    ],
    downloads: [MANUAL],
  },
  {
    name: "MPPT Plus Hybrid Solar Charge Controller EXO-M-70",
    model: "EXO-M-70",
    cat: "solar-charge-controllers",
    brandSlug: "exotech",
    price: 0, // TODO(client): price
    stock: 10,
    images: mpptImages("EXO-M-70"),
    badges: ["featured"],
    shortDescription:
      "Hybrid MPPT solar charge controller with B.M.S — auto 12V/24V, PV input up to 120V, smart solar/grid switching and 3-stage charging.",
    description: mpptDescription("EXO-M-70", "120V", "It suits smaller arrays and shorter panel strings than the EXO-M-100."),
    specList: mpptSpecs("30V – 120V", "60V – 120V"),
    highlights: [
      "Auto 12V / 24V battery detection",
      "PV input up to 120V",
      "Automatic solar ↔ grid hybrid switching",
      "3-stage charging with built-in B.M.S",
    ],
    downloads: [MANUAL],
  },
  {
    name: "3-Stage Automatic Battery Charger",
    cat: "battery-chargers",
    brandSlug: "exotech",
    price: 0, // TODO(client): price
    stock: 10,
    images: [img("exotech-3-stage-charger-blue.webp", "Exotech 3-stage automatic battery charger, blue metal enclosure")],
    badges: ["featured"],
    shortDescription:
      "Fully automatic 3-stage battery charger with LED status indicators for charging, trickle charging, battery charged and over-heat.",
    description: `## Overview

The **Exotech 3-Stage Automatic Battery Charger** takes care of your battery on its own: it charges, tops up with a trickle charge and tells you when the battery is full — no manual switching required.

## LED status panel

- **Batt. Charging** (red) — battery at or below 11.2V and charging
- **Trickle Charging** (yellow) — battery at or above 13.8V, topping up
- **Battery Charged** (green) — battery at or above 14.2V, fully charged
- **Over Heated** (red) — temperature warning

## Build

- Rugged wall-mount metal enclosure with silver end caps
- Sealed cable glands for input and output wiring
- 100% original Exotech product`,
    specList: [
      ["Type", "3-stage automatic battery charger"],
      ["Battery voltage", "12V"],
      ["Charging stages", "Charging → trickle charging → charged"],
      ["Status LEDs", "Over heated, battery charged (≥14.2V), trickle charging (≥13.8V), charging (≤11.2V)"],
      ["Enclosure", "Wall-mount metal case, blue"],
    ],
    highlights: ["Fully automatic 3-stage charging", "Clear 4-LED status panel", "Over-heat indication", "Wall-mount metal enclosure"],
  },
  {
    name: "Digital Battery Charger with LED Display",
    cat: "battery-chargers",
    brandSlug: "exotech",
    price: 0, // TODO(client): price
    stock: 10,
    images: [img("exotech-digital-charger.webp", "Exotech digital battery charger with red LED display")],
    badges: [],
    shortDescription: "Battery charger with a bright 3-digit digital display plus charging, AC/DC power and battery-full indicator lights.",
    description: `## Overview

The **Exotech Digital Battery Charger** shows what your battery is doing at a glance on a bright 3-digit LED display, backed by three indicator lights.

## Indicators

- **Digital display** — live charging reading
- **Charging** (yellow)
- **AC/DC Power** (red)
- **Battery Full** (green)
- Temperature indicator on the front panel

## Build

- Wall-mount metal enclosure in silver-grey
- Sealed cable glands for input and output wiring
- 100% original Exotech product`,
    specList: [
      ["Type", "Digital battery charger"],
      ["Display", "3-digit red LED display"],
      ["Indicators", "Charging, AC/DC power, battery full"],
      ["Enclosure", "Wall-mount metal case, silver-grey"],
    ],
    highlights: ["Bright 3-digit LED display", "Charging / power / full indicators", "Temperature indicator", "Wall-mount metal enclosure"],
  },
  {
    name: "Battery Charger with Status & Indicator Panel",
    cat: "battery-chargers",
    brandSlug: "exotech",
    price: 0, // TODO(client): price
    stock: 10,
    images: [img("exotech-status-indicator-charger.webp", "Exotech battery charger with status and indicator panel")],
    badges: [],
    shortDescription: "Automatic battery charger with a 4-LED status panel showing charging, trickle charging, battery charged and over-heat.",
    description: `## Overview

The **Exotech Battery Charger with Status & Indicator Panel** gives you a clear view of every charging stage through a dedicated four-light status panel.

## Status panel

- **Batt. Charging** — battery is charging
- **Trickle Charging** — topping up near full
- **Battery Charged** — charging complete
- **Over Heated** — temperature warning

## Build

- Brushed silver wall-mount metal enclosure
- Sealed cable glands for input and output wiring
- 100% original Exotech product`,
    specList: [
      ["Type", "Automatic battery charger"],
      ["Status LEDs", "Over heated, battery charged, trickle charging, charging"],
      ["Enclosure", "Wall-mount metal case, brushed silver"],
    ],
    highlights: ["Automatic multi-stage charging", "4-LED status & indicator panel", "Over-heat indication", "Wall-mount metal enclosure"],
  },
  {
    name: "SH 30A 12 Volt Battery Charger",
    model: "SH 30A",
    cat: "battery-chargers",
    brandSlug: "sencor",
    price: 0, // TODO(client): price
    stock: 10,
    images: [img("sencor-sh-30a-charger.webp", "Sencor SH 30A 12 volt battery charger with dual digital display")],
    badges: ["featured"],
    shortDescription: "30A, 12V battery charger with dual digital displays showing mains and charging current, plus charging/full indication.",
    description: `## Overview

The **Sencor SH 30A** is a 12 volt battery charger rated at 30 amps, with two digital displays so you can see both the mains and the charging current at the same time.

## Dual digital display

- **Main** — mains current reading (amps)
- **CHG / FUL** — charging current and battery-full indication (amps)

## Build

- Heavy-duty yellow metal enclosure with black end caps
- Screw-fixed front panel`,
    specList: [
      ["Model", "SH 30A"],
      ["Battery voltage", "12V"],
      ["Charging current", "30A"],
      ["Display", "Dual digital display (main amps / charging amps)"],
      ["Indicators", "Main, charging / full"],
      ["Enclosure", "Metal case, yellow"],
    ],
    highlights: ["30A charging current", "For 12V batteries", "Dual digital amp displays", "Heavy-duty metal enclosure"],
  },
]

// TODO(client): replace with real prices. Until then every item uses this placeholder.
const PLACEHOLDER_PRICE = 9999

const slugify = (s: string) => s.toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

export const products: Product[] = seeds.map(({ cat, brandSlug, specList, ...s }, i) => {
  const category = categories.find((c) => c.slug === cat)!
  const brand = brands.find((b) => b.slug === brandSlug)!
  return {
    ...s,
    id: i + 1,
    documentId: `prd-${i + 1}`,
    slug: slugify(`${brand.name} ${s.name}`),
    sku: `${brand.slug.slice(0, 3).toUpperCase()}-${slugify(s.model ?? s.name).toUpperCase().slice(0, 16)}`,
    price: s.price || PLACEHOLDER_PRICE,
    compareAtPrice: null,
    category: { documentId: category.documentId, name: category.name, slug: category.slug },
    brand: { documentId: brand.documentId, name: brand.name, slug: brand.slug },
    specs: specList.map(([label, value]) => ({ label, value })),
    rating: 0,
    reviewCount: 0,
    createdAt: new Date(Date.UTC(2026, 8, 30 - i)).toISOString(),
  }
})
