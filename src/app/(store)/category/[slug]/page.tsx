import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero, ShopView } from "@/components/shop/shop-view"
import { getCategories, getCategoryBySlug } from "@/lib/api"

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug)
  if (!category) return {}
  return { title: category.name, description: category.description }
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  return (
    <>
      <PageHero
        title={category.name}
        description={category.description}
        crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: category.name }]}
      >
        {category.children && category.children.length > 0 && (
          <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4">
            {category.children.map((c) => (
              <Link key={c.slug} href={`/category/${category.slug}`} className="shrink-0 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:border-primary hover:text-primary">
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </PageHero>
      <ShopView searchParams={await searchParams} fixed={{ category: slug }} />
    </>
  )
}
