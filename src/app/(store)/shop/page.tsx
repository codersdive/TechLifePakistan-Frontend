import type { Metadata } from "next"
import { PageHero, ShopView } from "@/components/shop/shop-view"

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse Exotech MPPT hybrid solar charge controllers and automatic battery chargers — genuine products with Cash on Delivery.",
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <>
      <PageHero
        title="Shop all products"
        description="Solar charge controllers and battery chargers — genuine products, delivered anywhere in Pakistan."
        crumbs={[{ href: "/", label: "Home" }, { label: "Shop" }]}
      />
      <ShopView searchParams={await searchParams} />
    </>
  )
}
