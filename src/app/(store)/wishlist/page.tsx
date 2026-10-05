"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { Heart } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { ProductGridSkeleton } from "@/components/shop/skeletons"
import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"
import { useProductsByIds } from "@/hooks/use-products-by-ids"
import { useWishlist } from "@/stores/lists"

export default function WishlistPage() {
  const mounted = useMounted()
  const ids = useWishlist((s) => s.ids)
  const clear = useWishlist((s) => s.clear)
  const { data, loading } = useProductsByIds(ids, mounted)

  return (
    <div className="container-store py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">My wishlist</h1>
          <p className="mt-1 text-muted-foreground">{mounted ? ids.length : 0} saved items</p>
        </div>
        {mounted && ids.length > 0 && <Button variant="ghost" className="rounded-full" onClick={clear}>Clear wishlist</Button>}
      </div>
      {!mounted || loading ? (
        <ProductGridSkeleton count={4} />
      ) : ids.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="grid size-20 place-items-center rounded-full bg-sale/10">
            <Heart className="size-9 fill-sale text-sale" />
          </motion.span>
          <p className="font-display text-xl font-bold">Your wishlist is empty</p>
          <p className="text-muted-foreground">Tap the heart on any product to save it for later.</p>
          <Button asChild className="rounded-full"><Link href="/shop">Explore products</Link></Button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {data.map((p) => (
              <motion.div key={p.documentId} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
