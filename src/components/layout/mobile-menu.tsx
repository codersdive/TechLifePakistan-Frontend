"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Phone } from "lucide-react"
import { DynamicIcon } from "@/components/common/dynamic-icon"
import { Logo } from "@/components/common/logo"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Category } from "@/types"
import { useSite } from "@/components/site-provider"

const links = [
  { href: "/shop", label: "Shop all" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/compare", label: "Compare" },
  { href: "/account", label: "My account" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQs" },
]

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const site = useSite()
  const close = () => setOpen(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Open menu" className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-accent lg:hidden">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[88%] flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b p-4">
          <SheetTitle asChild><div><Logo /></div></SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Categories</p>
          <Accordion type="single" collapsible className="mb-6">
            {categories.map((c) => (
              <AccordionItem key={c.slug} value={c.slug} className="border-b-0">
                <AccordionTrigger className="rounded-xl px-2 py-3 hover:bg-accent hover:no-underline">
                  <span className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-lg bg-accent text-primary"><DynamicIcon name={c.icon} className="size-4" /></span>
                    {c.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pl-13">
                  <Link href={`/category/${c.slug}`} onClick={close} className="block py-1.5 text-sm font-semibold text-primary">View all</Link>
                  {c.children?.map((s) => (
                    <Link key={s.slug} href={`/category/${c.slug}`} onClick={close} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                      {s.name}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Menu</p>
          <ul className="grid grid-cols-2 gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block rounded-xl border px-3 py-2.5 text-sm font-medium hover:bg-accent">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <a href={`tel:${site.contact.phones[0].replace(/\s/g, "")}`} className="flex items-center gap-3 border-t bg-surface p-4 text-sm">
          <Phone className="size-4 text-primary" /> {site.contact.phones[0]}
        </a>
      </SheetContent>
    </Sheet>
  )
}
