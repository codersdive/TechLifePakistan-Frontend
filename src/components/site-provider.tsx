"use client"

import { createContext, useContext } from "react"
import { siteConfig } from "@/config/site"
import type { SiteSettings } from "@/lib/site"

const SiteContext = createContext<SiteSettings | null>(null)

/** Makes the Strapi-managed store settings available to client components. */
export function SiteProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>
}

export function useSite() {
  const site = useContext(SiteContext)
  if (!site) throw new Error("useSite must be used inside <SiteProvider>")
  return site
}

/** Store name for components that may render outside the provider (e.g. the 404 page). */
export function useStoreName() {
  return useContext(SiteContext)?.name ?? siteConfig.name
}
