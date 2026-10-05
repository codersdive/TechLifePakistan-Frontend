"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { useState } from "react"
import { GitCompareArrows, Heart, Phone, Search, ShoppingBag, User } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"
import { cartCount, useCart } from "@/stores/cart"
import { useCompare, useWishlist } from "@/stores/lists"
import { useUI } from "@/stores/ui"
import type { Category } from "@/types"
import { MegaMenu } from "./mega-menu"
import { MobileMenu } from "./mobile-menu"
import { useSite } from "@/components/site-provider"

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/category/solar-charge-controllers", label: "Solar Controllers" },
  { href: "/category/battery-chargers", label: "Battery Chargers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-none text-sale-foreground ring-2 ring-background"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function IconLink({ href, label, count, children, className }: { href: string; label: string; count?: number; children: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} aria-label={label} className={cn("relative grid size-10 place-items-center rounded-full transition-colors hover:bg-accent", className)}>
          {children}
          {count != null && <CountBadge count={count} />}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname()
  const mounted = useMounted()
  const site = useSite()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  // Hysteresis: collapsing the nav row shortens the page, which shifts scrollY.
  // Separate enter/exit thresholds keep that shift from toggling the state back (flicker).
  useMotionValueEvent(scrollY, "change", (y) => setScrolled((was) => (was ? y > 16 : y > 140)))

  const items = useCart((s) => s.items)
  const wish = useWishlist((s) => s.ids.length)
  const compare = useCompare((s) => s.ids.length)
  const setSearchOpen = useUI((s) => s.setSearchOpen)
  const setCartOpen = useUI((s) => s.setCartOpen)
  const count = mounted ? cartCount(items) : 0

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled ? "bg-background/80 shadow-lg shadow-black/[0.03] backdrop-blur-xl" : "bg-background"
      )}
    >
      <div className={cn("container-store flex items-center gap-3 transition-[height] duration-300 lg:gap-6", scrolled ? "h-16" : "h-18 lg:h-20")}>
        <MobileMenu categories={categories} />
        <Logo />

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="group ml-4 hidden h-11 flex-1 items-center gap-3 rounded-full border bg-muted/50 px-4 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-background hover:shadow-md md:flex lg:max-w-xl"
        >
          <Search className="size-4 transition-colors group-hover:text-primary" />
          <span className="flex-1 text-left">Search MPPT controllers, chargers, models…</span>
          <kbd className="hidden rounded-md border bg-background px-1.5 py-0.5 font-mono text-[11px] lg:inline">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="grid size-10 place-items-center rounded-full hover:bg-accent md:hidden">
            <Search className="size-5" />
          </button>
          <ThemeToggle />
          <IconLink href="/compare" label="Compare" count={mounted ? compare : 0} className="hidden lg:grid">
            <GitCompareArrows className="size-5" />
          </IconLink>
          <IconLink href="/wishlist" label="Wishlist" count={mounted ? wish : 0} className="hidden sm:grid">
            <Heart className="size-5" />
          </IconLink>
          <IconLink href="/account" label="Account" className="hidden sm:grid">
            <User className="size-5" />
          </IconLink>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            data-cart-target
            aria-label={`Open cart, ${count} items`}
            className="relative ml-1 flex h-10 items-center gap-2 rounded-full bg-foreground pl-3 pr-3 text-background transition-transform hover:scale-105 active:scale-95 sm:pr-4"
          >
            <ShoppingBag className="size-4.5" />
            <span className="hidden text-sm font-semibold sm:inline">Cart</span>
            <CountBadge count={count} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!scrolled && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="hidden overflow-hidden lg:block"
            aria-label="Main"
          >
            <div className="container-store flex items-center gap-6 pb-3">
              <MegaMenu categories={categories} />
              <ul className="flex items-center gap-1">
                {nav.map((n) => {
                  const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
                  return (
                    <li key={n.label}>
                      <Link href={n.href} className={cn("relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:text-primary", active && "text-primary")}>
                        {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-accent" />}
                        {n.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <a href={`tel:${site.contact.phones[0].replace(/\s/g, "")}`} className="ml-auto flex items-center gap-2.5 text-sm">
                <span className="grid size-9 place-items-center rounded-full bg-accent text-primary"><Phone className="size-4" /></span>
                <span className="leading-tight">
                  <span className="block text-xs text-muted-foreground">Call us — {site.contact.hours.split(",")[0]}</span>
                  <b>{site.contact.phones[0]}</b>
                </span>
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
