import { AccountSync } from "@/components/account/account-sync"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { BackToTop, MobileBottomNav, WhatsAppButton } from "@/components/layout/floating-widgets"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SearchDialog } from "@/components/layout/search-dialog"
import { QuickViewDialog } from "@/components/product/quick-view-dialog"
import { SiteProvider } from "@/components/site-provider"
import { getCategories } from "@/lib/api"
import { getSiteSettings } from "@/lib/site"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, site] = await Promise.all([getCategories(), getSiteSettings()])
  return (
    <SiteProvider settings={site}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header categories={categories} />
      <main id="main">{children}</main>
      <Footer categories={categories} site={site} />
      <CartDrawer />
      <SearchDialog categories={categories} />
      <QuickViewDialog />
      <WhatsAppButton />
      <BackToTop />
      <MobileBottomNav />
      <AccountSync />
    </SiteProvider>
  )
}
