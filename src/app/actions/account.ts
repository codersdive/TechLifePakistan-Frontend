"use server"

import { revalidatePath } from "next/cache"
import { getProductsByIds } from "@/lib/api"
import { getSessionToken } from "@/lib/session"
import { gql, isStrapiEnabled, StrapiError } from "@/lib/strapi/client"
import { toCartItem } from "@/stores/cart-utils"
import type { CartItem } from "@/types"
import type { ActionResult } from "./checkout"

export interface CustomerAddress {
  id: string
  label?: string | null
  fullName: string
  phone: string
  province: string
  city: string
  address: string
  isDefault: boolean
}

export interface CustomerProfile {
  email: string
  fullName: string
  phone: string
  addresses: CustomerAddress[]
}

export type AddressInput = Omit<CustomerAddress, "id" | "isDefault"> & { id?: string; isDefault?: boolean }

const ADDRESS_FIELDS = "id label fullName phone province city address isDefault"

const fail = (error: unknown): { ok: false; error: string } => ({
  ok: false,
  error: error instanceof StrapiError ? (/forbidden/i.test(error.message) ? "Please sign in again." : error.message) : "Something went wrong. Please try again.",
})

/** Runs a query as the signed-in customer (throws when signed out). */
async function asCustomer<T>(query: string, variables: Record<string, unknown> = {}) {
  if (!isStrapiEnabled()) throw new StrapiError("Accounts need the store backend.")
  const jwt = await getSessionToken()
  if (!jwt) throw new StrapiError("Please sign in again.")
  return gql<T>(query, variables, { jwt })
}

/** Profile + address book, or null when signed out / no backend. */
export async function getMyProfile(): Promise<CustomerProfile | null> {
  if (!isStrapiEnabled() || !(await getSessionToken())) return null
  try {
    const { myProfile } = await asCustomer<{ myProfile: CustomerProfile }>(`{ myProfile { email fullName phone addresses { ${ADDRESS_FIELDS} } } }`)
    return myProfile
  } catch {
    return null
  }
}

export async function updateProfile(fullName: string, phone: string): Promise<ActionResult<CustomerProfile>> {
  try {
    const { updateMyProfile } = await asCustomer<{ updateMyProfile: CustomerProfile }>(
      `mutation($fullName: String!, $phone: String) { updateMyProfile(fullName: $fullName, phone: $phone) { email fullName phone addresses { ${ADDRESS_FIELDS} } } }`,
      { fullName, phone: phone || null }
    )
    revalidatePath("/account")
    return { ok: true, data: updateMyProfile }
  } catch (error) {
    return fail(error)
  }
}

export async function saveAddress(input: AddressInput): Promise<ActionResult<CustomerAddress[]>> {
  try {
    const { saveAddress } = await asCustomer<{ saveAddress: CustomerAddress[] }>(
      `mutation($input: AddressInput!) { saveAddress(input: $input) { ${ADDRESS_FIELDS} } }`,
      { input: { ...input, id: input.id || null, label: input.label || null } }
    )
    return { ok: true, data: saveAddress }
  } catch (error) {
    return fail(error)
  }
}

export async function deleteAddress(id: string): Promise<ActionResult<CustomerAddress[]>> {
  try {
    const { deleteAddress } = await asCustomer<{ deleteAddress: CustomerAddress[] }>(
      `mutation($id: ID!) { deleteAddress(id: $id) { ${ADDRESS_FIELDS} } }`,
      { id }
    )
    return { ok: true, data: deleteAddress }
  } catch (error) {
    return fail(error)
  }
}

export async function changePassword(currentPassword: string, password: string): Promise<ActionResult<null>> {
  try {
    await asCustomer(
      `mutation($current: String!, $password: String!) {
        changePassword(currentPassword: $current, password: $password, passwordConfirmation: $password) { jwt }
      }`,
      { current: currentPassword, password }
    )
    return { ok: true, data: null }
  } catch (error) {
    const message = error instanceof StrapiError ? error.message : ""
    if (/current password is invalid|invalid/i.test(message)) return { ok: false, error: "Your current password is incorrect." }
    if (/different/i.test(message)) return { ok: false, error: "Choose a password different from your current one." }
    return fail(error)
  }
}

type Line = { productId: string; variantSku?: string | null; quantity: number }

/**
 * Keeps the cart and wishlist on the customer's account.
 * `merge: true` (at sign-in) combines the browser's lists with the saved ones and returns the result as
 * ready-to-use cart lines; otherwise the browser's lists replace the saved ones.
 */
export async function syncAccountLists(input: { cart: Line[]; wishlist: string[]; merge: boolean }): Promise<ActionResult<{ cart: CartItem[]; wishlist: string[] } | null>> {
  if (!isStrapiEnabled() || !(await getSessionToken())) return { ok: true, data: null }
  try {
    const res = await asCustomer<{ saveCart: Line[]; saveWishlist: string[] }>(
      `mutation($cart: [CartLineInput!]!, $wishlist: [ID!]!, $merge: Boolean) {
        saveCart(items: $cart, merge: $merge) { productId variantSku quantity }
        saveWishlist(productIds: $wishlist, merge: $merge)
      }`,
      { cart: input.cart.map((l) => ({ productId: l.productId, variantSku: l.variantSku || null, quantity: l.quantity })), wishlist: input.wishlist, merge: input.merge }
    )
    if (!input.merge) return { ok: true, data: null }

    // Rebuild full cart lines from current catalogue data (drops removed products / variants and caps to stock).
    const products = new Map((await getProductsByIds([...new Set(res.saveCart.map((l) => l.productId))])).map((p) => [p.documentId, p]))
    const cart: CartItem[] = []
    for (const l of res.saveCart) {
      const p = products.get(l.productId)
      if (!p) continue
      const variant = l.variantSku ? p.variants?.find((v) => v.sku === l.variantSku) : null
      if (l.variantSku && !variant) continue
      if (!l.variantSku && p.variants?.length) continue
      const stock = variant ? variant.stock : p.stock
      if (stock <= 0) continue
      cart.push(toCartItem(p, Math.min(l.quantity, stock), variant))
    }
    return { ok: true, data: { cart, wishlist: res.saveWishlist } }
  } catch (error) {
    return fail(error)
  }
}
