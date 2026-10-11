import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Gift, LogOut, MapPin, Package, Search, User, UserRound } from "lucide-react"
import { getMyProfile } from "@/app/actions/account"
import { logout } from "@/app/actions/auth"
import type { TrackedOrder } from "@/app/actions/forms"
import { AddressBook } from "@/components/account/address-book"
import { OrderCard } from "@/components/account/order-card"
import { ChangePasswordForm, ProfileForm } from "@/components/account/profile-forms"
import { RecentlyViewed } from "@/components/account/recently-viewed"
import { ReferralPanel } from "@/components/account/referral-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { siteConfig } from "@/config/site"
import { formatPrice } from "@/lib/format"
import { getSiteSettings } from "@/lib/site"
import { getSessionToken, getSessionUser } from "@/lib/session"
import { gql, isStrapiEnabled } from "@/lib/strapi/client"
import { ORDER_FIELDS, withAbsoluteImages } from "@/lib/strapi/orders"
import { REFERRAL_FIELDS, type ReferralSummary } from "@/lib/strapi/referrals"

export const metadata: Metadata = { title: "My account", robots: { index: false } }

const TABS = ["orders", "profile", "addresses", "referrals"] as const

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  if (!isStrapiEnabled()) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="text-3xl font-extrabold">My account</h1>
        <p className="mt-2 text-muted-foreground">Customer accounts are available once the store backend is connected.</p>
      </div>
    )
  }

  const user = await getSessionUser()
  if (!user) redirect("/login?next=/account")

  const jwt = await getSessionToken()
  const [{ myOrders }, profile, referrals, site, sp] = await Promise.all([
    gql<{ myOrders: TrackedOrder[] }>(`{ myOrders { ${ORDER_FIELDS} } }`, {}, { jwt }),
    getMyProfile(),
    gql<{ myReferrals: ReferralSummary }>(`{ myReferrals { ${REFERRAL_FIELDS} } }`, {}, { jwt })
      .then((r) => r.myReferrals)
      .catch(() => null),
    getSiteSettings(),
    searchParams,
  ])
  // Shown while the program runs, and afterwards to anyone who still has rewards.
  const showReferrals = !!referrals && (referrals.enabled || referrals.rewards.length > 0)
  const tab = TABS.find((t) => t === sp.tab && (t !== "referrals" || showReferrals)) ?? "orders"
  const orders = myOrders.map(withAbsoluteImages)
  const spent = orders.filter((o) => !["cancelled", "returned"].includes(o.orderStatus)).reduce((n, o) => n + o.total, 0)

  return (
    <div className="container-store py-10">
      <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,black)] p-8 text-primary-foreground">
        <div className="bg-grid absolute inset-0 opacity-15" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25"><User className="size-8" /></span>
            <div>
              <p className="text-sm opacity-80">Assalam-o-Alaikum,</p>
              <h1 className="text-2xl font-extrabold sm:text-3xl">{profile?.fullName || user.email}</h1>
              {profile?.fullName && <p className="text-sm opacity-80">{user.email}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Orders", value: String(orders.length) },
              { label: "Total spent", value: formatPrice(spent) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/12 px-5 py-3 text-center ring-1 ring-white/20">
                <p className="font-display text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs opacity-80">{s.label}</p>
              </div>
            ))}
            <form action={logout}>
              <Button type="submit" variant="secondary" className="h-full rounded-2xl px-5">
                <LogOut /> Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Tabs defaultValue={tab} className="gap-6">
        <TabsList className="h-11 max-w-full justify-start overflow-x-auto rounded-full p-1">
          <TabsTrigger value="orders" className="rounded-full px-4"><Package /> Orders</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-full px-4"><UserRound /> Profile</TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-full px-4"><MapPin /> Addresses</TabsTrigger>
          {showReferrals && <TabsTrigger value="referrals" className="rounded-full px-4"><Gift /> Refer &amp; earn</TabsTrigger>}
        </TabsList>

        <TabsContent value="orders">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold"><Package className="size-5 text-primary" /> My orders</h2>
            <Link href="/track-order" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <Search className="size-4" /> Track a guest order
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
              <p className="font-display text-lg font-bold">No orders yet</p>
              <p className="text-sm text-muted-foreground">Orders you place while signed in will appear here.</p>
              <Button asChild className="rounded-full"><Link href="/shop">Start shopping</Link></Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {orders.map((o) => <OrderCard key={o.orderNumber} order={o} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          {profile ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ProfileForm profile={profile} />
              <ChangePasswordForm />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">We couldn’t load your profile. Please refresh the page.</p>
          )}
        </TabsContent>

        <TabsContent value="addresses">
          <AddressBook initial={profile?.addresses ?? []} defaults={{ fullName: profile?.fullName ?? "", phone: profile?.phone ?? "" }} />
        </TabsContent>

        {showReferrals && referrals && (
          <TabsContent value="referrals">
            <ReferralPanel summary={referrals} link={`${siteConfig.url.replace(/\/$/, "")}/register?ref=${referrals.code}`} storeName={site.name} />
          </TabsContent>
        )}
      </Tabs>

      <RecentlyViewed />
    </div>
  )
}
