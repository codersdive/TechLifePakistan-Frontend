import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"
import { gql, isStrapiEnabled } from "@/lib/strapi/client"

export const SESSION_COOKIE = "store_session"
/** Readable by the browser (no secret inside) so client code knows a customer is signed in — see AccountSync. */
export const SIGNED_IN_COOKIE = "store_signed_in"
const MAX_AGE = 60 * 60 * 24 * 7 // matches the Strapi JWT lifetime (7 days)

export interface SessionUser {
  id: string
  username: string
  email: string
}

export async function setSessionToken(jwt: string) {
  const jar = await cookies()
  const options = { secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE }
  jar.set(SESSION_COOKIE, jwt, { ...options, httpOnly: true })
  // A fresh value per sign-in, so the browser merges its cart/wishlist into the account once per login.
  jar.set(SIGNED_IN_COOKIE, crypto.randomUUID(), options)
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(SIGNED_IN_COOKIE)
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value
}

/** The signed-in customer, or null. Verified against Strapi once per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isStrapiEnabled()) return null
  const jwt = await getSessionToken()
  if (!jwt) return null
  try {
    const { me } = await gql<{ me: { id: string; username: string; email: string } | null }>(`{ me { id username email } }`, {}, { jwt })
    return me
  } catch {
    return null // expired/invalid token — treated as signed out
  }
})
