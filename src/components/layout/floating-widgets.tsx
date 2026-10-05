"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { useState } from "react"
import { ArrowUp, Heart, House, LayoutGrid, Search, ShoppingBag } from "lucide-react"
import { WhatsappIcon } from "@/components/icons/social"
import { useMounted } from "@/hooks/use-mounted"
import { whatsappLink } from "@/lib/format"
import { cn } from "@/lib/utils"
import { cartCount, useCart } from "@/stores/cart"
import { useUI } from "@/stores/ui"
import { useSite } from "@/components/site-provider"

export function WhatsAppButton() {
  const site = useSite()
  return (
    <a
      href={whatsappLink(site.contact.whatsapp, "Hi! I have a question about a product.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-20 right-4 z-40 flex items-center lg:bottom-6 lg:right-6"
    >
      <span className="mr-2 hidden translate-x-2 rounded-full bg-background px-3 py-1.5 text-sm font-medium opacity-0 shadow-lg ring-1 ring-border transition-all group-hover:translate-x-0 group-hover:opacity-100 lg:block">
        Chat with us
      </span>
      <span className="relative grid size-13 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform group-hover:scale-110">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <WhatsappIcon className="relative size-6.5" />
      </span>
    </a>
  )
}

export function BackToTop() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 800))
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-24 z-40 hidden size-11 place-items-center rounded-full border bg-background/90 shadow-lg backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground lg:grid"
        >
          <ArrowUp className="size-4.5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const mounted = useMounted()
  const count = useCart((s) => cartCount(s.items))
  const setSearchOpen = useUI((s) => s.setSearchOpen)
  const setCartOpen = useUI((s) => s.setCartOpen)

  const item = "relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p))

  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="flex">
        {[
          { href: "/", label: "Home", icon: House },
          { href: "/shop", label: "Shop", icon: LayoutGrid },
        ].map((l) => (
          <Link key={l.href} href={l.href} className={cn(item, isActive(l.href) && "text-primary")}>
            {isActive(l.href) && <motion.span layoutId="bottom-nav" className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
            <l.icon className="size-5" />
            {l.label}
          </Link>
        ))}
        <button type="button" className={item} onClick={() => setSearchOpen(true)}>
          <Search className="size-5" /> Search
        </button>
        <Link href="/wishlist" className={cn(item, isActive("/wishlist") && "text-primary")}>
          {isActive("/wishlist") && <motion.span layoutId="bottom-nav" className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
          <Heart className="size-5" /> Wishlist
        </Link>
        <button type="button" className={item} onClick={() => setCartOpen(true)} data-cart-target>
          <span className="relative">
            <ShoppingBag className="size-5" />
            {mounted && count > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-sale px-1 text-[9px] font-bold text-sale-foreground">{count}</span>
            )}
          </span>
          Cart
        </button>
      </div>
    </nav>
  )
}
