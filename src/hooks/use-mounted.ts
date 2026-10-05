"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** True only on the client after hydration — guards persisted-store UI from SSR mismatches. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
