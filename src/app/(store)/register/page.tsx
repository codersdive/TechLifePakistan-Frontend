import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/common/auth-card"
import { getSessionUser } from "@/lib/session"

export const metadata: Metadata = { title: "Create account", robots: { index: false } }

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams
  // Only allow same-site redirects.
  const target = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account"
  if (await getSessionUser()) redirect(target)
  return <AuthCard mode="register" next={target} />
}
