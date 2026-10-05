import { cn } from "@/lib/utils"

/** Infinite horizontal marquee (pure CSS; pauses on hover, disabled for reduced motion). */
export function Marquee({ children, className, duration = 40 }: { children: React.ReactNode; className?: string; duration?: number }) {
  return (
    <div
      className={cn("group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]", className)}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]">
        <div className="flex items-center">{children}</div>
        <div aria-hidden className="flex items-center">{children}</div>
      </div>
    </div>
  )
}
