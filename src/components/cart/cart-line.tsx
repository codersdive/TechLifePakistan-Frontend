"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Trash2 } from "lucide-react"
import { QtyStepper } from "@/components/product/qty-stepper"
import { formatPrice } from "@/lib/format"
import { useCart } from "@/stores/cart"
import type { CartItem } from "@/types"

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 overflow-hidden py-4"
    >
      <Link href={`/product/${item.slug}`} onClick={onNavigate} className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-surface">
        <Image src={item.image.url} alt={item.name} fill sizes="80px" className="object-contain p-2" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${item.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
            {item.name}
            {item.variantTitle && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{item.variantTitle}</span>}
          </Link>
          <button type="button" onClick={() => remove(item.key)} className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${item.name}`}>
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <QtyStepper size="sm" value={item.quantity} max={item.stock} onChange={(q) => setQuantity(item.key, q)} />
          <div className="text-right">
            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            {item.quantity > 1 && <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>}
          </div>
        </div>
      </div>
    </motion.li>
  )
}
