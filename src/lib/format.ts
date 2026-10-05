import { siteConfig } from "@/config/site"

const nf = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 })

export function formatPrice(amount: number) {
  return `${siteConfig.currency.symbol} ${nf.format(amount)}`
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
}
