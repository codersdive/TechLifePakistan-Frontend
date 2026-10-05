"use client"

import { ProductCard } from "@/components/product/product-card"
import { useMounted } from "@/hooks/use-mounted"
import { useProductsByIds } from "@/hooks/use-products-by-ids"
import { useRecentlyViewed } from "@/stores/lists"

export function RecentlyViewed() {
  const mounted = useMounted()
  const ids = useRecentlyViewed((s) => s.ids)
  const { data } = useProductsByIds(ids.slice(0, 4), mounted)
  if (data.length === 0) return null
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-xl font-bold">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {data.map((p) => <ProductCard key={p.documentId} product={p} />)}
      </div>
    </section>
  )
}
