"use server"

import { getSessionToken } from "@/lib/session"
import { gql, isStrapiEnabled, StrapiError } from "@/lib/strapi/client"

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

const fail = (error: unknown): { ok: false; error: string } => ({
  ok: false,
  error: error instanceof StrapiError ? error.message : "Something went wrong. Please try again.",
})

export interface CheckoutInput {
  items: { productId: string; variantSku?: string; quantity: number }[]
  customer: { fullName: string; phone: string; email?: string }
  shippingAddress: { province: string; city: string; address: string }
  paymentMethod: "cod" | "bank" | "wallet"
  notes?: string
  couponCode?: string
  shippingMethodId?: string
}

export interface PlacedOrder {
  orderNumber: string
  subtotal: number
  discount: number
  shippingFee: number
  total: number
}

/** Places the order in Strapi. Prices/stock/shipping are recomputed there — the cart only sends ids + quantities. */
export async function placeOrder(input: CheckoutInput): Promise<ActionResult<PlacedOrder>> {
  if (!isStrapiEnabled()) {
    // Demo mode (no backend configured).
    await new Promise((r) => setTimeout(r, 800))
    return { ok: true, data: { orderNumber: `VT-DEMO-${Date.now().toString().slice(-4)}`, subtotal: 0, discount: 0, shippingFee: 0, total: 0 } }
  }
  try {
    const { placeOrder } = await gql<{ placeOrder: PlacedOrder }>(
      `mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) { orderNumber subtotal discount shippingFee total }
      }`,
      {
        input: {
          ...input,
          customer: { ...input.customer, email: input.customer.email || null },
          notes: input.notes || null,
          couponCode: input.couponCode || null,
        },
      },
      { jwt: await getSessionToken() }
    )
    return { ok: true, data: placeOrder }
  } catch (error) {
    return fail(error)
  }
}

export interface CouponCheck {
  valid: boolean
  code: string
  discount: number
  message: string
}

export async function validateCoupon(code: string, subtotal: number): Promise<ActionResult<CouponCheck>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Coupons need the store backend." }
  try {
    const { validateCoupon } = await gql<{ validateCoupon: CouponCheck }>(
      `query ValidateCoupon($code: String!, $subtotal: Float!) {
        validateCoupon(code: $code, subtotal: $subtotal) { valid code discount message }
      }`,
      { code, subtotal }
    )
    return { ok: true, data: validateCoupon }
  } catch (error) {
    return fail(error)
  }
}

export interface CheckoutQuote {
  subtotal: number
  discount: number
  couponMessage?: string | null
  shippingOptions: { id: string; name: string; description?: string | null; estimate?: string | null; fee: number; codFee: number }[]
  shippingMethodId?: string | null
  shippingFee: number
  codFee: number
  tax: number
  taxLabel?: string | null
  taxInclusive: boolean
  total: number
  deliverable: boolean
}

/** Server-computed totals for the checkout page (shipping options for the address, COD fee, tax). */
export async function getCheckoutQuote(input: {
  items: CheckoutInput["items"]
  province: string
  city?: string
  couponCode?: string
  shippingMethodId?: string
  paymentMethod?: string
}): Promise<ActionResult<CheckoutQuote>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Quotes need the store backend." }
  try {
    const { checkoutQuote } = await gql<{ checkoutQuote: CheckoutQuote }>(
      `query Quote($input: CheckoutQuoteInput!) {
        checkoutQuote(input: $input) {
          subtotal discount couponMessage shippingMethodId shippingFee codFee tax taxLabel taxInclusive total deliverable
          shippingOptions { id name description estimate fee codFee }
        }
      }`,
      { input: { ...input, couponCode: input.couponCode || null, shippingMethodId: input.shippingMethodId || null } }
    )
    return { ok: true, data: checkoutQuote }
  } catch (error) {
    return fail(error)
  }
}
