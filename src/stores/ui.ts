"use client"

import { create } from "zustand"
import type { Product } from "@/types"

interface UIState {
  cartOpen: boolean
  searchOpen: boolean
  quickView: Product | null
  setCartOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setQuickView: (product: Product | null) => void
}

export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  quickView: null,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setQuickView: (quickView) => set({ quickView }),
}))
