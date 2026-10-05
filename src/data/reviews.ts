import type { Review } from "@/types"

/** No customer reviews yet — these will come from Strapi once customers can submit them. */
export function reviewsFor(productId: number): Review[] {
  void productId
  return []
}
