"use client"

import { cn } from "@/lib/utils"
import type { Product, ProductVariant } from "@/types"

/** First in-stock variant (or the first one) — used as the default selection. */
export const defaultVariant = (product: Product) => product.variants?.find((v) => v.stock > 0) ?? product.variants?.[0] ?? null

/** Finds the variant matching the chosen option values. */
export const matchVariant = (product: Product, values: string[]) =>
  product.variants?.find((v) => v.values.every((val, i) => val === values[i])) ?? null

/** One row of option buttons per option (e.g. Voltage: 12V | 24V). */
export function VariantPicker({ product, values, onChange }: { product: Product; values: string[]; onChange: (values: string[]) => void }) {
  const options = product.options ?? []
  const variants = product.variants ?? []

  return (
    <div className="space-y-4">
      {options.map((name, index) => {
        const choices = [...new Set(variants.map((v) => v.values[index]).filter(Boolean))]
        return (
          <fieldset key={name}>
            <legend className="mb-2 text-sm">
              <span className="font-semibold">{name}:</span> <span className="text-muted-foreground">{values[index] || "Choose"}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {choices.map((choice) => {
                const next = values.map((v, i) => (i === index ? choice : v))
                const candidate: ProductVariant | null = matchVariant(product, next)
                const available = !!candidate && candidate.stock > 0
                const active = values[index] === choice
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => onChange(next)}
                    aria-pressed={active}
                    className={cn(
                      "min-w-12 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                      active ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25" : "hover:border-primary/50 hover:bg-accent",
                      !available && !active && "text-muted-foreground line-through decoration-1 opacity-60"
                    )}
                    title={!candidate ? "Not available in this combination" : candidate.stock <= 0 ? "Out of stock" : undefined}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
