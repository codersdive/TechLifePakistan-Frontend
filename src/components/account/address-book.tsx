"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { deleteAddress, saveAddress, type CustomerAddress } from "@/app/actions/account"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PK_MOBILE, PROVINCES } from "@/lib/regions"

const schema = z.object({
  label: z.string().trim().max(40),
  fullName: z.string().trim().min(2, "Enter the recipient’s name"),
  phone: z.string().trim().regex(PK_MOBILE, "Enter a valid mobile number, e.g. 03001234567"),
  province: z.string().min(1, "Select the province"),
  city: z.string().trim().min(2, "Enter the city"),
  address: z.string().trim().min(10, "Please enter the complete address"),
  isDefault: z.boolean(),
})

type Values = z.infer<typeof schema>

export const formatAddress = (a: Pick<CustomerAddress, "address" | "city" | "province">) => `${a.address}, ${a.city}, ${a.province}`

function AddressDialog({
  open,
  onOpenChange,
  address,
  defaults,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: CustomerAddress | null
  defaults: { fullName: string; phone: string }
  onSaved: (list: CustomerAddress[]) => void
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: address
      ? { label: address.label ?? "", fullName: address.fullName, phone: address.phone, province: address.province, city: address.city, address: address.address, isDefault: address.isDefault }
      : { label: "Home", fullName: defaults.fullName, phone: defaults.phone, province: "", city: "", address: "", isDefault: false },
  })

  const onSubmit = async (values: Values) => {
    const res = await saveAddress({ ...values, id: address?.id })
    if (!res.ok) return void toast.error(res.error)
    onSaved(res.data)
    onOpenChange(false)
    toast.success(address ? "Address updated" : "Address saved")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "Add a new address"}</DialogTitle>
          <DialogDescription>Saved addresses can be picked at checkout.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <FormField control={form.control} name="label" render={({ field }) => (
              <FormItem><FormLabel>Label</FormLabel><FormControl><Input placeholder="Home, Office, Shop…" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem><FormLabel>Recipient</FormLabel><FormControl><Input autoComplete="name" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem className="sm:col-span-2"><FormLabel>Mobile number</FormLabel><FormControl><Input type="tel" autoComplete="tel" placeholder="03XX XXXXXXX" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="province" render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-11 w-full"><SelectValue placeholder="Select province" /></SelectTrigger></FormControl>
                  <SelectContent>{PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
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
            <FormField control={form.control} name="isDefault" render={({ field }) => (
              <FormItem className="flex items-center gap-2 sm:col-span-2">
                <FormControl><Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} /></FormControl>
                <FormLabel className="!mt-0 font-normal">Use as my default address</FormLabel>
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="rounded-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Save address
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function AddressBook({ initial, defaults }: { initial: CustomerAddress[]; defaults: { fullName: string; phone: string } }) {
  const [list, setList] = useState(initial)
  const [editing, setEditing] = useState<CustomerAddress | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const edit = (a: CustomerAddress | null) => {
    setEditing(a)
    setOpen(true)
  }

  const remove = async (a: CustomerAddress) => {
    setBusy(a.id)
    const res = await deleteAddress(a.id)
    setBusy(null)
    if (!res.ok) return void toast.error(res.error)
    setList(res.data)
    toast.success("Address removed")
  }

  const makeDefault = async (a: CustomerAddress) => {
    setBusy(a.id)
    const res = await saveAddress({ ...a, isDefault: true })
    setBusy(null)
    if (!res.ok) return void toast.error(res.error)
    setList(res.data)
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold"><MapPin className="size-5 text-primary" /> Saved addresses</h2>
        {list.length < 10 && (
          <Button className="rounded-full" onClick={() => edit(null)}><Plus /> Add address</Button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
          <p className="font-display text-lg font-bold">No saved addresses</p>
          <p className="text-sm text-muted-foreground">Save an address to check out in seconds.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.map((a) => (
              <motion.article
                key={a.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col gap-3 rounded-3xl border bg-card p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <b className="font-display">{a.label || "Address"}</b>
                  {a.isDefault && <Badge className="rounded-full">Default</Badge>}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{a.fullName} · {a.phone}</p>
                  <p className="text-muted-foreground">{formatAddress(a)}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => edit(a)}><Pencil /> Edit</Button>
                  {!a.isDefault && (
                    <Button size="sm" variant="ghost" className="rounded-full" disabled={busy === a.id} onClick={() => makeDefault(a)}><Star /> Make default</Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" disabled={busy === a.id} onClick={() => remove(a)}>
                    {busy === a.id ? <Loader2 className="animate-spin" /> : <Trash2 />} Remove
                  </Button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddressDialog open={open} onOpenChange={setOpen} address={editing} defaults={defaults} onSaved={setList} />
    </section>
  )
}
