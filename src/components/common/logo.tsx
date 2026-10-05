"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import { useStoreName } from "@/components/site-provider"
import { cn } from "@/lib/utils"

/** Placeholder wordmark — replace with the client's logo asset. */
export function Logo({ className }: { className?: string }) {
  const name = useStoreName()
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label={`${name} home`}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
        <Zap className="size-5 fill-brand-accent stroke-brand-accent" />
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        {name}
        <span className="text-brand-accent">.</span>
      </span>
    </Link>
  )
}
