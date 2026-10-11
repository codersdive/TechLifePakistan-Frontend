"use client"

import { Check, Copy, Gift, Share2, Ticket, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { ReferralSummary } from "@/lib/strapi/referrals"

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  qualified: { label: "Counted", variant: "default" },
  pending: { label: "Waiting for first delivery", variant: "secondary" },
  rejected: { label: "Not eligible", variant: "destructive" },
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })

/** Refer-a-friend: personal link, progress towards the next reward, invited friends and earned coupons. */
export function ReferralPanel({ summary, link, storeName }: { summary: ReferralSummary; link: string; storeName: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const s = summary

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      toast.success("Copied")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Couldn’t copy — please select and copy it manually.")
    }
  }

  const message = `I shop at ${storeName} — create your account with my link: ${link}`
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: storeName, text: message, url: link }).catch(() => {})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener")
    }
  }

  const goal = s.qualifyOn === "signup" ? "create an account" : "receive their first order"

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Gift className="size-5 text-primary" /> Refer friends, earn rewards</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Invite {s.referralsRequired} friend{s.referralsRequired === 1 ? "" : "s"} who {goal} and get <b className="text-foreground">{s.rewardText}</b>
            {s.repeatable ? " — again for every " + s.referralsRequired + " more." : "."}
          </p>

          <div className="mt-5 flex gap-2">
            <Input readOnly value={link} className="h-11 font-mono text-sm" aria-label="Your referral link" onFocus={(e) => e.target.select()} />
            <Button type="button" variant="secondary" className="h-11 rounded-xl" onClick={() => copy(link)} aria-label="Copy link">
              {copied === link ? <Check /> : <Copy />}
            </Button>
            <Button type="button" className="h-11 rounded-xl" onClick={share}><Share2 /> Share</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Your code: <b className="font-mono">{s.code}</b></p>

          {!s.enabled && <p className="mt-4 text-sm text-muted-foreground">The referral program is paused right now — your earned rewards below still work.</p>}

          {s.enabled && (
            <div className="mt-6">
              {s.remaining > 0 ? (
                <>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{s.progress} of {s.referralsRequired} friends</span>
                    <span className="text-muted-foreground">{s.remaining} more to your next reward</span>
                  </div>
                  <Progress value={(s.progress / s.referralsRequired) * 100} className="h-2.5" />
                </>
              ) : (
                <p className="text-sm font-medium text-success">You’ve earned the referral reward — thank you!</p>
              )}
            </div>
          )}
          {s.terms && <p className="mt-5 whitespace-pre-line text-xs text-muted-foreground">{s.terms}</p>}
        </section>

        <section className="rounded-3xl border bg-card p-6">
          <h3 className="flex items-center gap-2 font-bold"><Users className="size-4 text-primary" /> Friends you invited</h3>
          {s.referrals.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No one has joined with your link yet. Share it to get started.</p>
          ) : (
            <ul className="mt-3 divide-y">
              {s.referrals.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-medium">{r.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">joined {date(r.joinedAt)}</span>
                  </span>
                  <Badge variant={STATUS[r.status]?.variant ?? "secondary"}>{STATUS[r.status]?.label ?? r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="h-fit rounded-3xl border bg-card p-6">
        <h3 className="flex items-center gap-2 font-bold"><Ticket className="size-4 text-primary" /> Your rewards</h3>
        {s.rewards.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Rewards you earn appear here as coupon codes for your account.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {s.rewards.map((r) => {
              const usable = !r.used && !r.expired
              return (
                <li key={r.code} className={`rounded-2xl border border-dashed p-4 ${usable ? "border-primary/40 bg-primary/5" : "opacity-60"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <b className="font-mono text-lg tracking-wider">{r.code}</b>
                    {usable ? (
                      <Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={() => copy(r.code)}>
                        {copied === r.code ? <Check /> : <Copy />} Copy
                      </Button>
                    ) : (
                      <Badge variant="secondary">{r.used ? "Used" : "Expired"}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{r.description}</p>
                  {r.endsAt && usable && <p className="mt-1 text-xs text-muted-foreground">Valid until {date(r.endsAt)} · one use · signed in only</p>}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
