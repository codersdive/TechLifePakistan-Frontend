import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, ChevronRight, FileDown } from "lucide-react"
import { SectionHeading } from "@/components/common/section-heading"
import { Reveal } from "@/components/motion/reveal"
import { PriceTag } from "@/components/product/price-tag"
import { ProductCarousel } from "@/components/product/product-carousel"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfoTabs } from "@/components/product/product-info-tabs"
import { ProductPurchase } from "@/components/product/product-purchase"
import { RatingStars } from "@/components/product/rating-stars"
import { StickyBuyBar } from "@/components/product/sticky-buy-bar"
import { siteConfig } from "@/config/site"
import { getAllProductSlugs, getProductBySlug, getRelatedProducts, getReviews } from "@/lib/api"

export async function generateStaticParams() {
  return (await getAllProductSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription, images: product.images.map((i) => i.url) },
  }
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const [related, reviews] = await Promise.all([getRelatedProducts(product), getReviews(product.documentId)])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    mpn: product.model,
    image: product.images.map((i) => new URL(i.url, siteConfig.url).toString()),
    description: product.shortDescription,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    aggregateRating: product.reviewCount
      ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.currency.code,
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-store pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href={`/category/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
          <ChevronRight className="size-3.5" />
          <span className="line-clamp-1 font-medium text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="container-store grid gap-8 py-6 lg:grid-cols-2 lg:gap-14 lg:py-10">
        <Reveal direction="right" className="lg:sticky lg:top-28 lg:self-start" id="pdp-gallery">
          <ProductGallery images={product.images} name={product.slug} />
        </Reveal>

        <Reveal direction="left" delay={0.1} className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <Link href={`/shop?brand=${product.brand.slug}`} className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                {product.brand.name}
              </Link>
            )}
            {product.model && <span className="rounded-full border px-3 py-1 font-mono text-xs">{product.model}</span>}
            {product.warranty && <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">{product.warranty} warranty</span>}
          </div>

          <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">{product.name}</h1>

          {product.reviewCount > 0 && (
            <a href="#details" className="flex w-fit items-center gap-3 text-sm">
              <RatingStars rating={product.rating} count={product.reviewCount} size="md" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground underline-offset-4 hover:underline">{product.reviewCount} reviews</span>
            </a>
          )}

          <div className="rounded-3xl border bg-gradient-to-br from-surface to-background p-5">
            {product.variants?.length && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</p>}
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" showSave={!product.variants?.length} />
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · Cash on Delivery available</p>
          </div>

          <p className="text-muted-foreground">{product.shortDescription}</p>

          {product.highlights && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-3" /></span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div id="pdp-purchase">
            <ProductPurchase product={product} imageSource="#pdp-gallery img" />
          </div>

          {product.downloads?.map((d) => (
            <a
              key={d.url}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <FileDown className="size-4" /> Download {d.label}
              {d.size && <span className="font-normal text-muted-foreground">({d.size})</span>}
            </a>
          ))}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {product.tags.map((t) => (
                <Link key={t.slug} href={`/shop?t=${t.slug}`} className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            SKU: <span className="font-mono">{product.sku}</span> · Category:{" "}
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
          </p>
        </Reveal>
      </section>

      <ProductInfoTabs product={product} reviews={reviews} />

      <section className="container-store py-8">
        <SectionHeading eyebrow="You may also like" title="Related products" href={`/category/${product.category.slug}`} />
        <ProductCarousel products={related} />
      </section>

      <StickyBuyBar product={product} watchId="pdp-purchase" />
    </>
  )
}
