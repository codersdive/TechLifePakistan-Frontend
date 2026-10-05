"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

/** A persisted list of product documentIds (wishlist, compare, recently viewed). */
function createIdList(name: string, max?: number) {
  return create<{
    ids: string[]
    toggle: (id: string) => boolean
    add: (id: string) => void
    remove: (id: string) => void
    clear: () => void
  }>()(
    persist(
      (set, get) => ({
        ids: [],
        toggle: (id) => {
          const has = get().ids.includes(id)
          if (has) set({ ids: get().ids.filter((x) => x !== id) })
          else get().add(id)
          return !has
        },
        add: (id) =>
          set((s) => {
            const next = [id, ...s.ids.filter((x) => x !== id)]
            return { ids: max ? next.slice(0, max) : next }
          }),
        remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
        clear: () => set({ ids: [] }),
      }),
      { name }
    )
  )
}

export const useWishlist = createIdList("store-wishlist")
export const useCompare = createIdList("store-compare", 4)
export const useRecentlyViewed = createIdList("store-recent", 12)
