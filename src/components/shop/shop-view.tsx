import Link from "next/link"
import { Suspense } from "react"
import { ChevronRight } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"
import { getBrands, getCategories, getPriceBounds, getProducts } from "@/lib/api"
import { parseShopParams, type SearchParams } from "@/lib/shop-params"
import type { ProductQuery } from "@/types"
import { Filters } from "./filters"
import { ProductResults } from "./product-results"
import { ShopPagination } from "./shop-pagination"
import { ShopToolbar } from "./shop-toolbar"

export function PageHero({ title, description, crumbs, children }: { title: string; description?: string; crumbs: { href?: string; label: string }[]; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60" />
      <div className="container-store relative py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5" />}
              {c.href ? <Link href={c.href} className="hover:text-foreground">{c.label}</Link> : <span className="font-medium text-foreground">{c.label}</span>}
            </span>
          ))}
        </nav>
        <Reveal>
          <h1 className="text-3xl font-extrabold sm:text-5xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">{description}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  )
}

export async function ShopView({ searchParams, fixed = {} }: { searchParams: SearchParams; fixed?: Partial<ProductQuery> }) {
  const query = parseShopParams(searchParams, fixed)
  const [result, categories, brands, bounds] = await Promise.all([getProducts(query), getCategories(), getBrands(), getPriceBounds()])
  const filterProps = { categories, brands, bounds, fixedCategory: fixed.category }

  return (
    <div className="container-store grid gap-8 py-8 lg:grid-cols-[260px_1fr] lg:py-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border bg-card p-4">
          <Suspense><Filters {...filterProps} /></Suspense>
        </div>
      </aside>
      <div>
        <Suspense>
          <ShopToolbar total={result.meta.pagination.total} filterProps={filterProps} />
          <ProductResults products={result.data} view={query.view} />
          <ShopPagination page={result.meta.pagination.page} pageCount={result.meta.pagination.pageCount} />
        </Suspense>
      </div>
    </div>
  )
}
