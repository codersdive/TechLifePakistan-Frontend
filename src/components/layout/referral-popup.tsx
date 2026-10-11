"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Gift, Share2, Ticket, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { ReferralProgramInfo } from "@/lib/referral-program"

const SEEN_KEY = "referral-popup-seen"
/** Pages where a marketing popup would get in the way. */
const HIDDEN_ON = ["/cart", "/checkout", "/account", "/login", "/register", "/forgot-password", "/reset-password", "/track-order"]

const signedIn = () => document.cookie.split("; ").some((c) => c.startsWith("store_signed_in="))

/**
 * "Refer & earn" popup for store visitors. Settings (on/off, copy, delay, frequency) come from the
 * Referral program page in Strapi; it shows once per page load, or at most once per `frequencyDays` per browser.
 * Visitors arriving through a friend's `?ref=` link get an "you've been invited" version instead.
 */
export function ReferralPopup({ program }: { program: ReferralProgramInfo }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [member, setMember] = useState(false)
  const [invited, setInvited] = useState(false)
  const shown = useRef(false)
  const { popup } = program

  useEffect(() => {
    if (shown.current || HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return
    const isMember = signedIn()
    const isInvited = !!searchParams.get("ref") && !isMember

    let lastSeen = 0
    try {
      lastSeen = Number(localStorage.getItem(SEEN_KEY)) || 0
    } catch {}
    // An invite link always gets its welcome; otherwise respect the frequency set in Strapi (0 = every page load).
    if (!isInvited && popup.frequencyDays > 0 && Date.now() - lastSeen < popup.frequencyDays * 86_400_000) return

    const timer = setTimeout(() => {
      shown.current = true
      setMember(isMember)
      setInvited(isInvited)
      setOpen(true)
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()))
      } catch {}
    }, (isInvited ? 1 : popup.delaySeconds) * 1000)
    return () => clearTimeout(timer)
  }, [pathname, searchParams, popup.delaySeconds, popup.frequencyDays])

  const n = program.referralsRequired
  const friends = `${n} friend${n === 1 ? "" : "s"}`
  const counts = program.qualifyOn === "signup" ? "create an account" : "get their first order delivered"

  const title = invited ? "A friend invited you!" : popup.title || `Invite friends, get ${program.rewardText}`
  const text = invited
    ? "Create your free account to accept the invite — then share your own link and start earning rewards too."
    : popup.text || `Share your personal link. When ${friends} ${counts}, you get ${program.rewardText}.`

  const cta = invited
    ? { href: "/register", label: "Create my account", icon: UserPlus }
    : member
      ? { href: "/account?tab=referrals", label: "Get my invite link", icon: Share2 }
      : { href: `/register?next=${encodeURIComponent("/account?tab=referrals")}`, label: "Sign up & get my link", icon: UserPlus }

  const steps = [
    { icon: Share2, label: "Share your link" },
    { icon: UserPlus, label: program.qualifyOn === "signup" ? `${friends} sign up` : `${friends} order` },
    { icon: Ticket, label: "You get a discount" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden rounded-[2rem] p-0 sm:max-w-md"
        // Focus the dialog itself (not "Maybe later") so it opens without a focus ring; Tab still moves inside.
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).focus()
        }}
      >
        <div className="relative bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,black)] px-6 pb-8 pt-10 text-center text-primary-foreground">
          <div className="bg-grid absolute inset-0 opacity-15" />
          <span className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Gift className="size-8" />
          </span>
          <DialogTitle className="relative mt-4 text-2xl font-extrabold leading-tight">{title}</DialogTitle>
        </div>

        <div className="space-y-5 px-6 pb-6">
          <DialogDescription className="text-center text-sm text-muted-foreground">{text}</DialogDescription>

          {!invited && (
            <ol className="grid grid-cols-3 gap-2 text-center">
              {steps.map((s, i) => (
                <li key={i} className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 px-2 py-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><s.icon className="size-4" /></span>
                  <span className="text-xs font-medium leading-tight">{s.label}</span>
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild size="lg" className="h-12 rounded-full text-base shadow-lg shadow-primary/25" onClick={() => setOpen(false)}>
              <Link href={cta.href}><cta.icon /> {cta.label}</Link>
            </Button>
            <Button type="button" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => setOpen(false)}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
