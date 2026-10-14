import { siteConfig } from "@/config/site"

const nf = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 })

export function formatPrice(amount: number) {
  return `${siteConfig.currency.symbol} ${nf.format(amount)}`
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

/** "923290631461" → "+92 329 0631461" */
export function formatWhatsapp(number: string) {
  const d = number.replace(/\D/g, "")
  return d.startsWith("92") && d.length === 12 ? `+92 ${d.slice(2, 5)} ${d.slice(5)}` : `+${d}`
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
}
