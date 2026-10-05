"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { sendContactMessage } from "@/app/actions/forms"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().min(10, "Enter a valid phone number"),
  subject: z.string().trim().min(3, "What is this about?"),
  message: z.string().trim().min(10, "Tell us a little more"),
})

export function ContactForm() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "", phone: "", subject: "", message: "" } })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const res = await sendContactMessage(values)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Message sent! We’ll get back to you within a few hours.")
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 rounded-[2rem] border bg-card p-6 sm:grid-cols-2 sm:p-8" noValidate>
        <h2 className="text-2xl font-extrabold sm:col-span-2">Send us a message</h2>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="subject" render={({ field }) => (
          <FormItem className="sm:col-span-2"><FormLabel>Subject</FormLabel><FormControl><Input className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem className="sm:col-span-2"><FormLabel>Message</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-12 rounded-full sm:col-span-2">
          {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send message
        </Button>
      </form>
    </Form>
  )
}
