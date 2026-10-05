"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { login, register, requestLoginCode, verifyLoginCode } from "@/app/actions/auth"
import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const makeSchema = (isLogin: boolean) =>
  z.object({
    name: isLogin ? z.string() : z.string().trim().min(3, "Enter your full name"),
    identifier: z.email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })

type Values = z.infer<ReturnType<typeof makeSchema>>

/** Passwordless sign-in: email → 6-digit code → signed in. */
function CodeLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!z.email().safeParse(email.trim()).success) return setError("Enter a valid email address")
    setBusy(true)
    setError(null)
    const res = await requestLoginCode(email)
    setBusy(false)
    if (!res.ok) return void toast.error(res.error)
    setSentTo(email.trim().toLowerCase())
    setCode("")
    toast.success("Check your inbox for the code")
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sentTo) return
    if (code.length !== 6) return setError("Enter the 6-digit code from the email")
    setBusy(true)
    setError(null)
    const res = await verifyLoginCode(sentTo, code)
    if (!res.ok) {
      setBusy(false)
      setError(res.error)
      return
    }
    toast.success("Signed in — welcome!")
    onDone()
  }

  if (!sentTo) {
    return (
      <form onSubmit={send} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="otp-email" className="text-sm font-medium">Email</label>
          <Input id="otp-email" type="email" autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/25">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Email me a sign-in code
        </Button>
        <p className="text-center text-xs text-muted-foreground">No password needed. New here? We’ll create your account.</p>
      </form>
    )
  }

  return (
    <form onSubmit={verify} className="space-y-4" noValidate>
      <p className="rounded-2xl bg-accent/60 p-3 text-center text-sm">
        We sent a 6-digit code to <b>{sentTo}</b>
      </p>
      <div className="space-y-2">
        <label htmlFor="otp-code" className="text-sm font-medium">Sign-in code</label>
        <Input
          id="otp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="••••••"
          className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={!!error}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/25">
        {busy && <Loader2 className="size-4 animate-spin" />} Verify & sign in
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={() => setSentTo(null)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Change email
        </button>
        <button type="button" disabled={busy} onClick={() => send()} className="font-medium text-primary hover:underline disabled:opacity-50">
          Resend code
        </button>
      </div>
    </form>
  )
}

export function AuthCard({ mode, next = "/account" }: { mode: "login" | "register"; next?: string }) {
  const isLogin = mode === "login"
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [withCode, setWithCode] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(makeSchema(isLogin)),
    defaultValues: { name: "", identifier: "", password: "" },
  })

  const onSubmit = async (values: Values) => {
    const res = isLogin ? await login(values.identifier, values.password) : await register(values.name, values.identifier, values.password)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(isLogin ? "Welcome back!" : "Account created — welcome aboard!")
    finish()
  }

  const finish = () => {
    router.push(next)
    router.refresh()
  }

  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden px-4 py-16">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_65%)] opacity-70" />
      <motion.div className="absolute left-1/2 top-1/3 size-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[2rem] border bg-card/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-extrabold">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? "Sign in to track orders and checkout faster." : "Save addresses, track orders and get member-only deals."}
          </p>
        </div>
        {withCode ? <CodeLogin onDone={finish} /> : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {!isLogin && (
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full name</FormLabel><FormControl><Input autoComplete="name" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            )}
            <FormField control={form.control} name="identifier" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  {isLogin && <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>}
                </div>
                <div className="relative">
                  <FormControl><Input type={show ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} className="h-11 pr-11" {...field} /></FormControl>
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/25">
              {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>
        </Form>
        )}
        {isLogin && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" size="lg" className="h-12 w-full rounded-full" onClick={() => setWithCode((v) => !v)}>
              {withCode ? <><KeyRound className="size-4" /> Sign in with password</> : <><Mail className="size-4" /> Email me a sign-in code</>}
            </Button>
          </>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-primary hover:underline">
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
