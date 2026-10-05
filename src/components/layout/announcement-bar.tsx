"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { Mail, Phone, Sparkles } from "lucide-react"
import { useSite } from "@/components/site-provider"

export function AnnouncementBar() {
  const [i, setI] = useState(0)
  const site = useSite()
  const messages = site.announcements

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4000)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div className="bg-announcement text-announcement-foreground">
      <div className="container-store flex h-9 items-center justify-between gap-4 text-xs">
        <a href={`tel:${site.contact.phones[0].replace(/\s/g, "")}`} className="hidden items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100 md:flex">
          <Phone className="size-3.5" /> {site.contact.phones[0]}
        </a>
        <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 truncate font-medium"
            >
              <Sparkles className="size-3.5 shrink-0 text-brand-accent" />
              {messages[i]}
            </motion.p>
          </AnimatePresence>
        </div>
        <a href={`mailto:${site.contact.email}`} className="hidden items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100 md:flex">
          <Mail className="size-3.5" /> {site.contact.email}
        </a>
      </div>
    </div>
  )
}
