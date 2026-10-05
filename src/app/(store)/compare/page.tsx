"use client"

import Image from "next/image"
import Link from "next/link"
import { GitCompareArrows, X } from "lucide-react"
import { PriceTag } from "@/components/product/price-tag"
import { RatingStars } from "@/components/product/rating-stars"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddToCart } from "@/hooks/use-add-to-cart"
import { useMounted } from "@/hooks/use-mounted"
import { useProductsByIds } from "@/hooks/use-products-by-ids"
import { useCompare } from "@/stores/lists"

export default function ComparePage() {
  const mounted = useMounted()
  const ids = useCompare((s) => s.ids)
  const remove = useCompare((s) => s.remove)
  const { data, loading } = useProductsByIds(ids, mounted)
  const add = useAddToCart()
  const specLabels = [...new Set(data.flatMap((p) => p.specs.map((s) => s.label)))]

  return (
    <div className="container-store py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Compare products</h1>
      <p className="mt-1 text-muted-foreground">Compare up to 4 products side by side.</p>

      {!mounted || loading ? (
        <Skeleton className="mt-8 h-96 rounded-3xl" />
      ) : data.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-accent"><GitCompareArrows className="size-9 text-primary" /></span>
          <p className="font-display text-xl font-bold">Nothing to compare yet</p>
          <p className="text-muted-foreground">Use the compare button on product cards to add items.</p>
          <Button asChild className="rounded-full"><Link href="/shop">Browse products</Link></Button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <th className="w-44 p-4" />
                {data.map((p) => (
                  <th key={p.documentId} className="p-4 text-left align-top font-normal">
                    <div className="relative">
                      <button type="button" onClick={() => remove(p.documentId)} aria-label={`Remove ${p.name}`} className="absolute right-0 top-0 z-10 grid size-7 place-items-center rounded-full border bg-background hover:bg-destructive hover:text-white">
                        <X className="size-3.5" />
                      </button>
                      <Link href={`/product/${p.slug}`} className="relative mb-3 block aspect-square overflow-hidden rounded-2xl bg-surface">
                        <Image src={p.images[0].url} alt={p.name} fill sizes="240px" className="object-contain p-4" />
                      </Link>
                      <Link href={`/product/${p.slug}`} className="line-clamp-2 font-semibold hover:text-primary">{p.name}</Link>
                      <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} size="sm" className="mt-2" />
                      <Button size="sm" className="mt-3 w-full rounded-full" disabled={p.stock <= 0} onClick={(e) => add(p, 1, e.currentTarget)}>Add to cart</Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:nth-child(odd)]:bg-muted/40">
              <tr><th className="p-4 text-left font-medium text-muted-foreground">Rating</th>{data.map((p) => <td key={p.documentId} className="p-4"><RatingStars rating={p.rating} count={p.reviewCount} /></td>)}</tr>
              <tr><th className="p-4 text-left font-medium text-muted-foreground">Brand</th>{data.map((p) => <td key={p.documentId} className="p-4 font-medium">{p.brand?.name}</td>)}</tr>
              <tr><th className="p-4 text-left font-medium text-muted-foreground">Warranty</th>{data.map((p) => <td key={p.documentId} className="p-4 font-medium">{p.warranty ?? "—"}</td>)}</tr>
              <tr><th className="p-4 text-left font-medium text-muted-foreground">Availability</th>{data.map((p) => <td key={p.documentId} className={p.stock > 0 ? "p-4 font-medium text-success" : "p-4 font-medium text-destructive"}>{p.stock > 0 ? "In stock" : "Out of stock"}</td>)}</tr>
              {specLabels.map((label) => (
                <tr key={label}>
                  <th className="p-4 text-left font-medium text-muted-foreground">{label}</th>
                  {data.map((p) => <td key={p.documentId} className="p-4">{p.specs.find((s) => s.label === label)?.value ?? "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
