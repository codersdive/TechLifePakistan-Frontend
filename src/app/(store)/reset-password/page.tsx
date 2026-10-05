import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/common/password-reset-forms"

export const metadata: Metadata = { title: "Reset password", robots: { index: false } }

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { code } = await searchParams
  return <ResetPasswordForm code={typeof code === "string" ? code : ""} />
}
