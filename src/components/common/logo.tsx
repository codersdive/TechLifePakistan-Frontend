"use client"

import Image from "next/image"
import Link from "next/link"
import { useStoreName } from "@/components/site-provider"
import { cn } from "@/lib/utils"

/**
 * Brand mark (public/brand/logo-mark.png, cropped from LOGO/) + live-text wordmark.
 * The wordmark stays as text so it follows the theme (the source PNG's dark text
 * would vanish in dark mode / the footer). A trailing "Pakistan" gets the logo green.
 */
export function Logo({ className }: { className?: string }) {
  const name = useStoreName()
  const [, lead = name, tail = ""] = name.match(/^(.*?)(\s*Pakistan)$/i) ?? []
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label={`${name} home`}>
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={36}
        height={36}
        priority
        className="size-8 shrink-0 min-[400px]:size-9 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105"
      />
      {/* Below 400px the name stacks onto two lines so the header fits small phones */}
      <span className="flex flex-col font-display text-[15px] leading-[1.05] font-extrabold tracking-tight whitespace-nowrap min-[400px]:block min-[400px]:text-lg min-[400px]:leading-normal sm:text-xl">
        <span>{lead}</span>
        {tail && <span className="text-logo-green">{tail}</span>}
      </span>
    </Link>
  )
}
