import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/common/password-reset-forms"

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } }

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
