"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

/** Updates shop filters in the URL (resetting pagination) without scrolling. */
export function useShopUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const update = useCallback(
    (patch: Record<string, string | null | undefined>, { keepPage = false } = {}) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k)
        else next.set(k, v)
      }
      if (!keepPage && !("page" in patch)) next.delete("page")
      const qs = next.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [params, pathname, router]
  )

  return { params, update, pending, pathname }
}
