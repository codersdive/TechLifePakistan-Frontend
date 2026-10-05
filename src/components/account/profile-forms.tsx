"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { KeyRound, Loader2, UserRound } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { changePassword, updateProfile, type CustomerProfile } from "@/app/actions/account"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PK_MOBILE } from "@/lib/regions"

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name"),
  phone: z.union([z.literal(""), z.string().trim().regex(PK_MOBILE, "Enter a valid mobile number, e.g. 03001234567")]),
})

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don’t match" })

export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName, phone: profile.phone },
  })

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    const res = await updateProfile(values.fullName, values.phone)
    if (!res.ok) return void toast.error(res.error)
    form.reset({ fullName: res.data.fullName, phone: res.data.phone })
    toast.success("Profile updated")
    router.refresh()
  }

  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold"><UserRound className="size-5 text-primary" /> Personal details</h2>
      <p className="mb-5 text-sm text-muted-foreground">Used to fill in checkout for you.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Full name</FormLabel><FormControl><Input autoComplete="name" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Mobile number</FormLabel><FormControl><Input type="tel" autoComplete="tel" placeholder="03XX XXXXXXX" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={profile.email} disabled className="h-11" />
          </FormItem>
          <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Save changes
          </Button>
        </form>
      </Form>
    </section>
  )
}

export function ChangePasswordForm() {
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", password: "", confirm: "" },
  })

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    const res = await changePassword(values.current, values.password)
    if (!res.ok) return void toast.error(res.error)
    form.reset()
    toast.success("Password changed")
  }

  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold"><KeyRound className="size-5 text-primary" /> Change password</h2>
      <p className="mb-5 text-sm text-muted-foreground">Use at least 6 characters.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <FormField control={form.control} name="current" render={({ field }) => (
            <FormItem><FormLabel>Current password</FormLabel><FormControl><Input type="password" autoComplete="current-password" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>New password</FormLabel><FormControl><Input type="password" autoComplete="new-password" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="confirm" render={({ field }) => (
            <FormItem><FormLabel>Confirm new password</FormLabel><FormControl><Input type="password" autoComplete="new-password" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" variant="outline" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Update password
          </Button>
        </form>
      </Form>
    </section>
  )
}
