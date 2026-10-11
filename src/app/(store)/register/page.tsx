import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/common/auth-card"
import { REFERRAL_COOKIE } from "@/lib/referral-cookie"
import { getSessionUser } from "@/lib/session"

export const metadata: Metadata = { title: "Create account", robots: { index: false } }

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next, ref } = await searchParams
  // Only allow same-site redirects.
  const target = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account"
  if (await getSessionUser()) redirect(target)
  // The proxy stores the code on this same request's response, so also check the query string.
  const invited = !!ref || (await cookies()).has(REFERRAL_COOKIE)
  return <AuthCard mode="register" next={target} invited={invited} />
}
