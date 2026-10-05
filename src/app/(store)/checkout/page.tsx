import type { Metadata } from "next"
import { getMyProfile } from "@/app/actions/account"
import { CheckoutForm } from "./checkout-form"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function CheckoutPage() {
  const profile = await getMyProfile()
  return (
    <div className="container-store py-10">
      <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">Checkout</h1>
      <CheckoutForm profile={profile} />
    </div>
  )
}
