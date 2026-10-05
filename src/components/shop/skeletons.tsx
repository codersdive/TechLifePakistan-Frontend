import { Skeleton } from "@/components/ui/skeleton"

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ShopLoading() {
  return (
    <>
      <div className="border-b bg-accent/40">
        <div className="container-store space-y-3 py-14">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
      </div>
      <div className="container-store grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-[520px] rounded-2xl lg:block" />
        <div className="space-y-6">
          <Skeleton className="h-14 rounded-2xl" />
          <ProductGridSkeleton />
        </div>
      </div>
    </>
  )
}
