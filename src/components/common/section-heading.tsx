import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Reveal className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-6 bg-primary" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">{title}</h2>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            {linkLabel}
            <span className="grid size-7 place-items-center rounded-full border transition-all group-hover:translate-x-1 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        )}
      </div>
    </Reveal>
  )
}
