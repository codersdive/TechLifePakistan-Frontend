import type { TrackedOrder } from "@/app/actions/forms"
import { mediaUrl } from "./client"

/** GraphQL selection for TrackedOrder (shared by order tracking and the account page). */
export const ORDER_FIELDS = `orderNumber orderStatus paymentStatus paymentMethod subtotal discount shippingFee total
  trackingNumber courier estimatedDelivery cancelReason canCancel amountDue paymentPending canSubmitPayment createdAt
  items { productName variantTitle sku imageUrl unitPrice quantity lineTotal }
  events { type message createdAt }`

/** Absolute image URLs so orders can be rendered in client components too. */
export const withAbsoluteImages = (o: TrackedOrder): TrackedOrder => ({
  ...o,
  items: o.items.map((i) => ({ ...i, imageUrl: i.imageUrl ? mediaUrl(i.imageUrl) : null })),
})
