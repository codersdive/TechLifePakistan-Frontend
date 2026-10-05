"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Banknote, Building2, Loader2, Lock, MapPin, Plus, ShieldCheck, Smartphone } from "lucide-react"
import { z } from "zod"
import { CouponForm } from "@/components/cart/coupon-form"
import { OrderSummary } from "@/components/cart/order-summary"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useSite } from "@/components/site-provider"
import { saveAddress, type CustomerProfile } from "@/app/actions/account"
import { getCheckoutQuote, placeOrder, type CheckoutQuote } from "@/app/actions/checkout"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useMounted } from "@/hooks/use-mounted"
import { formatPrice } from "@/lib/format"
import { PK_MOBILE, PROVINCES } from "@/lib/regions"
import { cn } from "@/lib/utils"
import { useCart } from "@/stores/cart"


const makeSchema = (restrictedRegions: string[]) =>
  z.object({
    fullName: z.string().trim().min(3, "Please enter your full name"),
    phone: z.string().trim().regex(PK_MOBILE, "Enter a valid mobile number, e.g. 03001234567"),
    email: z.union([z.literal(""), z.email("Enter a valid email")]),
    province: z
      .string()
      .min(1, "Select your province")
      .refine((p) => !restrictedRegions.includes(p), "Sorry, we don’t deliver to this region yet"),
    city: z.string().trim().min(2, "Enter your city"),
    address: z.string().trim().min(10, "Please enter your complete address"),
    notes: z.string().optional(),
    payment: z.enum(["cod", "bank", "wallet"]),
  })

type FormValues = z.infer<ReturnType<typeof makeSchema>>

const paymentOptions = [
  { value: "cod", label: "Cash on Delivery", text: "Pay in cash when your order arrives", icon: Banknote },
  { value: "bank", label: "Bank transfer", text: "Account details sent on WhatsApp", icon: Building2 },
  { value: "wallet", label: "JazzCash / Easypaisa", text: "Pay via mobile wallet", icon: Smartphone },
] as const

function Steps({ current }: { current: number }) {
  const steps = ["Cart", "Details", "Confirmation"]
  return (
    <ol className="mb-10 flex items-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2 sm:gap-4 last:flex-none">
          <span className={cn("flex items-center gap-2 text-sm font-semibold", i <= current ? "text-foreground" : "text-muted-foreground")}>
            <span className={cn("grid size-8 place-items-center rounded-full border-2 text-xs", i < current && "border-primary bg-primary text-primary-foreground", i === current && "border-primary text-primary")}>{i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </span>
          {i < steps.length - 1 && (
            <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.span className="absolute inset-y-0 left-0 bg-primary" initial={{ width: 0 }} animate={{ width: i < current ? "100%" : "0%" }} transition={{ duration: 0.6, delay: 0.2 }} />
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

export function CheckoutForm({ profile }: { profile?: CustomerProfile | null }) {
  const mounted = useMounted()
  const router = useRouter()
  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)
  const coupon = useCart((s) => s.coupon)
  const site = useSite()
  const [submitting, setSubmitting] = useState(false)
  const restricted = site.shipping.restrictedRegions
  const schema = useMemo(() => makeSchema(restricted), [restricted])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      const a = profile?.addresses.find((x) => x.isDefault) ?? profile?.addresses[0]
      return {
        fullName: a?.fullName ?? profile?.fullName ?? "",
        phone: a?.phone ?? profile?.phone ?? "",
        email: profile?.email ?? "",
        province: a?.province ?? "",
        city: a?.city ?? "",
        address: a?.address ?? "",
        notes: "",
        payment: "cod" as const,
      }
    })(),
  })

  // Signed-in customers can pick a saved address or enter a new one (and save it).
  const saved = profile?.addresses ?? []
  const [addressId, setAddressId] = useState<string>(() => (saved.find((x) => x.isDefault) ?? saved[0])?.id ?? "new")
  const [saveNew, setSaveNew] = useState(true)
  const pickAddress = (id: string) => {
    setAddressId(id)
    const a = saved.find((x) => x.id === id)
    const opts = { shouldValidate: form.formState.isSubmitted, shouldDirty: true }
    if (a) {
      form.setValue("fullName", a.fullName, opts)
      form.setValue("phone", a.phone, opts)
      form.setValue("province", a.province, opts)
      form.setValue("city", a.city, opts)
      form.setValue("address", a.address, opts)
    } else {
      form.setValue("city", "", opts)
      form.setValue("address", "", opts)
    }
  }

  // Live server quote: delivery options for the address, COD fee and tax.
  const [province, city, payment] = useWatch({ control: form.control, name: ["province", "city", "payment"] })
  const [methodId, setMethodId] = useState<string | undefined>()
  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const cartKey = items.map((i) => `${i.key}x${i.quantity}`).join(",")
  useEffect(() => {
    if (!province || !items.length) return
    let cancelled = false
    const t = setTimeout(async () => {
      setQuoting(true)
      const res = await getCheckoutQuote({
        items: items.map((i) => ({ productId: i.documentId, variantSku: i.variantSku, quantity: i.quantity })),
        province,
        city: city?.trim() || undefined,
        couponCode: coupon?.code,
        shippingMethodId: methodId,
        paymentMethod: payment,
      })
      if (cancelled) return
      setQuoting(false)
      if (res.ok) {
        setQuote(res.data)
        if (res.data.shippingMethodId && res.data.shippingMethodId !== methodId) setMethodId(res.data.shippingMethodId)
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-quote when address, payment, method, coupon or cart change
  }, [province, city, payment, methodId, coupon?.code, cartKey])

  const selectedOption = quote?.shippingOptions.find((o) => o.id === quote.shippingMethodId)
  const summaryQuote = quote?.deliverable
    ? {
        shippingFee: quote.shippingFee,
        shippingLabel: selectedOption?.name,
        codFee: quote.codFee,
        tax: quote.tax,
        taxLabel: quote.taxLabel,
        taxInclusive: quote.taxInclusive,
        total: quote.total,
      }
    : null

  const onSubmit = async (values: FormValues) => {
    if (quote && !quote.deliverable) {
      toast.error("We don’t deliver to this address yet — please check the province and city.")
      return
    }
    setSubmitting(true)
    const res = await placeOrder({
      items: items.map((i) => ({ productId: i.documentId, variantSku: i.variantSku, quantity: i.quantity })),
      customer: { fullName: values.fullName, phone: values.phone, email: values.email || undefined },
      shippingAddress: { province: values.province, city: values.city, address: values.address },
      paymentMethod: values.payment,
      notes: values.notes,
      couponCode: coupon?.code,
      shippingMethodId: methodId,
    })
    if (!res.ok) {
      setSubmitting(false)
      toast.error("We couldn’t place your order", { description: res.error })
      return
    }
    if (profile && addressId === "new" && saveNew) {
      await saveAddress({
        label: saved.length ? "Address" : "Home",
        fullName: values.fullName,
        phone: values.phone,
        province: values.province,
        city: values.city,
        address: values.address,
      }).catch(() => null)
    }
    try {
      // Lets the success page accept the bank/wallet transaction ID without asking for the phone again.
      sessionStorage.setItem("last-order", JSON.stringify({ order: res.data.orderNumber, phone: values.phone }))
    } catch {}
    const params = new URLSearchParams({ order: res.data.orderNumber, total: String(res.data.total), method: values.payment })
    clear()
    router.push(`/checkout/success?${params}`)
  }

  if (!mounted) return <div className="grid gap-8 lg:grid-cols-[1fr_420px]"><Skeleton className="h-[600px] rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></div>

  if (items.length === 0 && !submitting) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
        <p className="font-display text-xl font-bold">Your cart is empty</p>
        <Button asChild className="rounded-full"><Link href="/shop">Go shopping</Link></Button>
      </div>
    )
  }

  return (
    <>
      <Steps current={1} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_420px]" noValidate>
          <div className="space-y-6">
            <fieldset className="rounded-3xl border bg-card p-6">
              <legend className="sr-only">Contact information</legend>
              <h2 className="mb-5 font-display text-xl font-bold">Contact information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Full name</FormLabel><FormControl><Input autoComplete="name" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Mobile number</FormLabel><FormControl><Input type="tel" autoComplete="tel" placeholder="03XX XXXXXXX" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Input type="email" autoComplete="email" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </fieldset>

            <fieldset className="rounded-3xl border bg-card p-6">
              <legend className="sr-only">Shipping address</legend>
              <h2 className="mb-5 font-display text-xl font-bold">Shipping address</h2>
              {saved.length > 0 && (
                <RadioGroup value={addressId} onValueChange={pickAddress} className="mb-5 grid gap-3 sm:grid-cols-2">
                  {saved.map((a) => (
                    <label
                      key={a.id}
                      className={cn("flex cursor-pointer gap-3 rounded-2xl border-2 p-4 text-sm transition-colors hover:border-primary/40", addressId === a.id && "border-primary bg-accent/50")}
                    >
                      <RadioGroupItem value={a.id} className="mt-0.5" />
                      <span className="min-w-0">
                        <b className="flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" /> {a.label || "Address"}</b>
                        <span className="mt-0.5 block truncate text-muted-foreground">{a.address}, {a.city}</span>
                      </span>
                    </label>
                  ))}
                  <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-4 text-sm font-semibold transition-colors hover:border-primary/40", addressId === "new" && "border-primary bg-accent/50")}>
                    <RadioGroupItem value="new" />
                    <Plus className="size-4 text-primary" /> Deliver to a new address
                  </label>
                </RadioGroup>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="province" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11 w-full"><SelectValue placeholder="Select province" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}{restricted.includes(p) && " — not available"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input autoComplete="address-level2" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Complete address</FormLabel><FormControl><Input autoComplete="street-address" placeholder="House #, street, area, landmark" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                {profile && addressId === "new" && saved.length < 10 && (
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <Checkbox checked={saveNew} onCheckedChange={(v) => setSaveNew(v === true)} /> Save this address to my account
                  </label>
                )}
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Order notes <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Textarea rows={3} placeholder="Delivery instructions, preferred time…" {...field} /></FormControl></FormItem>
                )} />
              </div>
            </fieldset>

            {province && (
              <fieldset className="rounded-3xl border bg-card p-6">
                <legend className="sr-only">Delivery</legend>
                <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold">
                  Delivery {quoting && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                </h2>
                {quote && !quote.deliverable ? (
                  <p className="rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
                    Sorry, we don’t deliver to {city ? `${city}, ` : ""}{province} yet.
                  </p>
                ) : quote ? (
                  <RadioGroup value={quote.shippingMethodId ?? undefined} onValueChange={setMethodId} className="grid gap-3">
                    {quote.shippingOptions.map((o) => (
                      <label
                        key={o.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-colors hover:border-primary/40",
                          quote.shippingMethodId === o.id && "border-primary bg-accent/50"
                        )}
                      >
                        <RadioGroupItem value={o.id} />
                        <span className="flex-1">
                          <b className="block text-sm">{o.name}</b>
                          <span className="text-xs text-muted-foreground">
                            {[o.estimate, o.description, o.codFee > 0 ? `+${formatPrice(o.codFee)} for Cash on Delivery` : null].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <b className="text-sm">{o.fee === 0 ? <span className="text-success">Free</span> : formatPrice(o.fee)}</b>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-muted-foreground">Checking delivery options…</p>
                )}
              </fieldset>
            )}

            <fieldset className="rounded-3xl border bg-card p-6">
              <legend className="sr-only">Payment method</legend>
              <h2 className="mb-5 font-display text-xl font-bold">Payment method</h2>
              <FormField control={form.control} name="payment" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-3">
                      {paymentOptions.map((o) => (
                        <label
                          key={o.value}
                          className={cn(
                            "relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-colors hover:border-primary/40",
                            field.value === o.value && "border-primary bg-accent/50"
                          )}
                        >
                          <span className="flex items-center justify-between">
                            <o.icon className="size-6 text-primary" />
                            <RadioGroupItem value={o.value} />
                          </span>
                          <b className="text-sm">{o.label}</b>
                          <span className="text-xs text-muted-foreground">{o.text}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )} />
            </fieldset>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <CouponForm />
            <OrderSummary items={items} showItems quote={summaryQuote}>
              <Button type="submit" size="lg" disabled={submitting || (!!quote && !quote.deliverable)} className="mt-6 h-12 w-full rounded-full text-base shadow-lg shadow-primary/25">
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Placing order…</> : <><Lock className="size-4" /> Place order</>}
              </Button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-success" /> Your information is safe and never shared.
              </p>
            </OrderSummary>
          </div>
        </form>
      </Form>
    </>
  )
}
