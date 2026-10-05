import { SectionHeading } from "@/components/common/section-heading"
import { CategoryShowcase } from "@/components/home/category-showcase"
import { FlashSale } from "@/components/home/flash-sale"
import { Hero } from "@/components/home/hero"
import { AboutBlurb, BrandMarquee, PromoSplit, TrustBadges } from "@/components/home/misc-sections"
import { MpptSpotlight } from "@/components/home/mppt-spotlight"
import { ProductTabs } from "@/components/home/product-tabs"
import { ProductCarousel } from "@/components/product/product-carousel"
import { getBrands, getCategories, getHeroBanners, getProducts, getProductsByTag, getPromoBanners } from "@/lib/api"

export default async function HomePage() {
  const [slides, promos, categories, brands, flash, all, controllers, chargers] = await Promise.all([
    getHeroBanners(),
    getPromoBanners(),
    getCategories(),
    getBrands(),
    getProductsByTag("flash-sale"),
    getProducts({ pageSize: 24 }).then((r) => r.data),
    getProducts({ category: "solar-charge-controllers" }).then((r) => r.data),
    getProducts({ category: "battery-chargers" }).then((r) => r.data),
  ])

  return (
    <>
      <Hero slides={slides} side={promos} />
      <TrustBadges />
      <CategoryShowcase categories={categories} />
      {flash.length > 0 && <FlashSale products={flash} />}
      <ProductTabs
        tabs={[
          { key: "all", label: "All products", products: all },
          { key: "mppt", label: "Solar controllers", products: controllers },
          { key: "chargers", label: "Battery chargers", products: chargers },
        ]}
      />
      <MpptSpotlight products={controllers} />
      <PromoSplit banners={promos} />
      <section className="container-store py-12">
        <SectionHeading
          eyebrow="Load-shedding essentials"
          title="Battery chargers"
          description="Automatic chargers with LED status indicators and digital displays."
          href="/category/battery-chargers"
        />
        <ProductCarousel products={chargers} />
      </section>
      <BrandMarquee brands={brands} />
      <AboutBlurb />
    </>
  )
}
