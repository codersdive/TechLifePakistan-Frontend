import { BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

/** "Authorized dealer of Exotech" trust pill — shown in the footer, about page and on Exotech product pages. */
export function AuthorizedDealerBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-logo-green/30 bg-logo-green/10 px-3 py-1 text-xs font-semibold text-logo-green",
        className
      )}
    >
      <BadgeCheck className="size-4 shrink-0" />
      Authorized dealer of Exotech
    </span>
  )
}
