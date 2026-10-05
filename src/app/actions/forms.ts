"use server"

import { getSessionToken } from "@/lib/session"
import { gql, isStrapiEnabled, StrapiError } from "@/lib/strapi/client"
import { ORDER_FIELDS, withAbsoluteImages } from "@/lib/strapi/orders"
import type { ActionResult } from "./checkout"

const fail = (error: unknown): { ok: false; error: string } => ({
  ok: false,
  error: error instanceof StrapiError ? error.message : "Something went wrong. Please try again.",
})

const demo = async <T,>(data: T): Promise<ActionResult<T>> => {
  await new Promise((r) => setTimeout(r, 600))
  return { ok: true, data }
}

export async function sendContactMessage(input: { name: string; phone: string; subject: string; message: string }): Promise<ActionResult<null>> {
  if (!isStrapiEnabled()) return demo(null)
  try {
    await gql(`mutation Contact($data: ContactMessageInput!) { createContactMessage(data: $data) { documentId } }`, { data: input })
    return { ok: true, data: null }
  } catch (error) {
    return fail(error)
  }
}

export async function subscribeNewsletter(email: string): Promise<ActionResult<null>> {
  if (!isStrapiEnabled()) return demo(null)
  try {
    await gql(`mutation Subscribe($data: NewsletterSubscriberInput!) { createNewsletterSubscriber(data: $data) { documentId } }`, {
      data: { email: email.trim().toLowerCase() },
    })
    return { ok: true, data: null }
  } catch (error) {
    // Already subscribed → treat as success.
    if (error instanceof StrapiError && /unique/i.test(error.message)) return { ok: true, data: null }
    return fail(error)
  }
}

export async function submitReview(input: { productId: string; author: string; rating: number; title?: string; body: string }): Promise<ActionResult<{ message: string }>> {
  if (!isStrapiEnabled()) return demo({ message: "Thanks for your review!" })
  try {
    const { submitReview } = await gql<{ submitReview: { ok: boolean; message: string } }>(
      `mutation Review($input: SubmitReviewInput!) { submitReview(input: $input) { ok message } }`,
      { input }
    )
    return { ok: true, data: { message: submitReview.message } }
  } catch (error) {
    return fail(error)
  }
}

export interface TrackedOrder {
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  trackingNumber?: string | null
  courier?: string | null
  estimatedDelivery?: string | null
  cancelReason?: string | null
  canCancel: boolean
  amountDue: number
  paymentPending: boolean
  canSubmitPayment: boolean
  createdAt: string
  events: { type: string; message: string; createdAt: string }[]
  items: { productName: string; variantTitle?: string | null; sku?: string | null; imageUrl?: string | null; unitPrice: number; quantity: number; lineTotal: number }[]
}

export async function trackOrder(orderNumber: string, phone: string): Promise<ActionResult<TrackedOrder | null>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Order tracking needs the store backend." }
  try {
    const { trackOrder } = await gql<{ trackOrder: TrackedOrder | null }>(
      `query Track($orderNumber: String!, $phone: String!) { trackOrder(orderNumber: $orderNumber, phone: $phone) { ${ORDER_FIELDS} } }`,
      { orderNumber: orderNumber.trim().toUpperCase(), phone: phone.replace(/\s/g, "") }
    )
    return { ok: true, data: trackOrder ? withAbsoluteImages(trackOrder) : null }
  } catch (error) {
    return fail(error)
  }
}

/** Cancels a pending/confirmed order — uses the session for signed-in customers, the phone for guests. */
export async function cancelOrder(orderNumber: string, phone?: string, reason?: string): Promise<ActionResult<{ message: string }>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Order changes need the store backend." }
  try {
    const { cancelOrder } = await gql<{ cancelOrder: { ok: boolean; message: string } }>(
      `mutation Cancel($orderNumber: String!, $phone: String, $reason: String) {
        cancelOrder(orderNumber: $orderNumber, phone: $phone, reason: $reason) { ok message }
      }`,
      { orderNumber, phone: phone?.replace(/\s/g, "") || null, reason: reason || null },
      { jwt: await getSessionToken() }
    )
    return { ok: true, data: { message: cancelOrder.message } }
  } catch (error) {
    return fail(error)
  }
}
