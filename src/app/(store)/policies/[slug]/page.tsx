import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/shop/shop-view"
import { getPolicy, getPolicySlugs } from "@/lib/api"

export async function generateStaticParams() {
  return (await getPolicySlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const policy = await getPolicy((await params).slug)
  return policy ? { title: policy.title } : {}
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const policy = await getPolicy((await params).slug)
  if (!policy) notFound()
  return (
    <>
      <PageHero title={policy.title} crumbs={[{ href: "/", label: "Home" }, { label: policy.title }]} />
      <article className="container-store max-w-3xl py-12">
        <ul className="space-y-4">
          {policy.body.map((p) => (
            <li key={p} className="flex gap-3 rounded-2xl border bg-card p-5 leading-relaxed">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
              {p}
            </li>
          ))}
        </ul>
      </article>
    </>
  )
}
