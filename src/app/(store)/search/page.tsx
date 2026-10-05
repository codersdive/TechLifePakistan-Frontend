import type { Metadata } from "next"
import { PageHero, ShopView } from "@/components/shop/shop-view"

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } }
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  return (
    <>
      <PageHero
        title={q ? `Results for “${q}”` : "Search products"}
        description={q ? undefined : "Use the search bar above to find products by name, model or brand."}
        crumbs={[{ href: "/", label: "Home" }, { label: "Search" }]}
      />
      <ShopView searchParams={sp} />
    </>
  )
}
