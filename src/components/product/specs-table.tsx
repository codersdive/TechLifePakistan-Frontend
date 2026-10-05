import type { Spec } from "@/types"

export function SpecsTable({ specs }: { specs: Spec[] }) {
  return (
    <dl className="overflow-hidden rounded-2xl border">
      {specs.map((s, i) => (
        <div key={s.label} className={`grid grid-cols-[minmax(120px,40%)_1fr] text-sm ${i % 2 ? "bg-card" : "bg-muted/50"}`}>
          <dt className="px-4 py-3 font-medium text-muted-foreground">{s.label}</dt>
          <dd className="px-4 py-3 font-semibold">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
