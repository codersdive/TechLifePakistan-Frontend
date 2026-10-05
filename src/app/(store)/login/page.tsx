import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/common/auth-card"
import { getSessionUser } from "@/lib/session"

export const metadata: Metadata = { title: "Sign in", robots: { index: false } }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams
  // Only allow same-site redirects.
  const target = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account"
  if (await getSessionUser()) redirect(target)
  return <AuthCard mode="login" next={target} />
}
