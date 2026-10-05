import type { Metadata } from "next"
import { PageHero } from "@/components/shop/shop-view"
import { TrackOrderForm } from "./track-order-form"

export const metadata: Metadata = { title: "Track your order", description: "Check the status of your order with your order number and phone." }

export default function TrackOrderPage() {
  return (
    <>
      <PageHero
        title="Track your order"
        description="Enter the order number from your confirmation and the mobile number you used at checkout."
        crumbs={[{ href: "/", label: "Home" }, { label: "Track order" }]}
      />
      <div className="container-store max-w-3xl py-12">
        <TrackOrderForm />
      </div>
    </>
  )
}
