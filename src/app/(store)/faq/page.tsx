import type { Metadata } from "next"
import { Reveal } from "@/components/motion/reveal"
import { PageHero } from "@/components/shop/shop-view"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getFaqs } from "@/lib/api"

export const metadata: Metadata = { title: "FAQs", description: "Answers about orders, delivery, payment, warranty and returns." }

export default async function FaqPage() {
  const faqs = await getFaqs()
  return (
    <>
      <PageHero title="Frequently asked questions" description="Everything you need to know about ordering, delivery and warranty." crumbs={[{ href: "/", label: "Home" }, { label: "FAQs" }]} />
      <div className="container-store grid max-w-4xl gap-10 py-12">
        {faqs.map((g, gi) => (
          <Reveal key={g.group} delay={gi * 0.05}>
            <h2 className="mb-4 text-xl font-bold">{g.group}</h2>
            <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
              {g.items.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        ))}
      </div>
    </>
  )
}
