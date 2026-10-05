import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_65%)]" />
      <div className="relative flex flex-col items-center text-center">
        <Logo />
        <p className="mt-10 animate-float font-display text-[9rem] leading-none font-extrabold text-gradient sm:text-[12rem]">404</p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Looks like this page lost power</h1>
        <p className="mt-2 max-w-md text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full"><Link href="/"><Home /> Back home</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><Link href="/shop"><Search /> Browse products</Link></Button>
        </div>
      </div>
    </div>
  )
}
