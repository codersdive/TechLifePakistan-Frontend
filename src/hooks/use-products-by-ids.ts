"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/types"

/** Loads full product records for persisted id lists (wishlist / compare). */
export function useProductsByIds(ids: string[], enabled = true) {
  const key = ids.join(",")
  const [state, setState] = useState<{ key: string | null; data: Product[] }>({ key: null, data: [] })

  useEffect(() => {
    if (!enabled) return
    const ctrl = new AbortController()
    fetch(`/api/products?ids=${encodeURIComponent(key)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j: { data: Product[] }) => setState({ key, data: j.data }))
      .catch(() => {})
    return () => ctrl.abort()
  }, [key, enabled])

  // Keep previously loaded items visible while a changed list refetches (avoids flashing skeletons on remove).
  const data = state.data.filter((p) => ids.includes(p.documentId))
  return { data, loading: state.key === null && ids.length > 0 }
}
