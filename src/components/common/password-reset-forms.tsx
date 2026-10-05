"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useState, useTransition } from "react"
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"
import { requestPasswordReset, resetPassword } from "@/app/actions/auth"
import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden px-4 py-16">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_65%)] opacity-70" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[2rem] border bg-card/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  if (sent) {
    return (
      <Shell title="Check your email" subtitle="If an account exists for that address, we’ve sent a link to reset your password.">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success/12 text-success"><MailCheck className="size-7" /></span>
          <p className="text-sm text-muted-foreground">The link expires after it’s used. Don’t see it? Check your spam folder.</p>
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline">Back to sign in</Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell title="Forgot your password?" subtitle="Enter your account email and we’ll send you a reset link.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const email = String(new FormData(e.currentTarget).get("email") ?? "")
          startTransition(async () => {
            const res = await requestPasswordReset(email)
            if (!res.ok) {
              toast.error(res.error)
              return
            }
            setSent(true)
          })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" className="h-11" />
        </div>
        <Button type="submit" size="lg" disabled={pending} className="h-12 w-full rounded-full text-base">
          {pending && <Loader2 className="animate-spin" />} Send reset link
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remembered it? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </Shell>
  )
}

export function ResetPasswordForm({ code }: { code: string }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!code) {
    return (
      <Shell title="Invalid reset link" subtitle="This link is missing its reset code.">
        <Button asChild className="h-12 w-full rounded-full"><Link href="/forgot-password">Request a new link</Link></Button>
      </Shell>
    )
  }

  return (
    <Shell title="Choose a new password" subtitle="Use at least 6 characters.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          const password = String(form.get("password") ?? "")
          if (password !== String(form.get("confirm") ?? "")) {
            toast.error("The passwords don’t match.")
            return
          }
          startTransition(async () => {
            const res = await resetPassword(code, password)
            if (!res.ok) {
              toast.error(res.error)
              return
            }
            toast.success("Password updated — you’re signed in.")
            router.push("/account")
            router.refresh()
          })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input id="password" name="password" type={show ? "text" : "password"} required minLength={6} autoComplete="new-password" className="h-11 pr-11" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type={show ? "text" : "password"} required minLength={6} autoComplete="new-password" className="h-11" />
        </div>
        <Button type="submit" size="lg" disabled={pending} className="h-12 w-full rounded-full text-base">
          {pending && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </Shell>
  )
}
