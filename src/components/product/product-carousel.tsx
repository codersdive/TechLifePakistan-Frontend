"use client"

import Autoplay from "embla-carousel-autoplay"
import { useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Stagger, StaggerItem } from "@/components/motion/reveal"
import type { Product } from "@/types"
import { ProductCard } from "./product-card"

export function ProductCarousel({ products, autoplay = false }: { products: Product[]; autoplay?: boolean }) {
  const [plugin] = useState(() => Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true }))
  return (
    <Carousel opts={{ align: "start", dragFree: true }} plugins={autoplay ? [plugin] : []} className="group/carousel">
      <Stagger>
        <CarouselContent className="-ml-3 py-2 sm:-ml-5">
          {products.map((p) => (
            <CarouselItem key={p.documentId} className="basis-[70%] pl-3 sm:basis-1/2 sm:pl-5 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <StaggerItem className="h-full">
                <ProductCard product={p} />
              </StaggerItem>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Stagger>
      <CarouselPrevious className="-left-4 hidden size-11 bg-background/90 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover/carousel:opacity-100 disabled:opacity-0 lg:inline-flex" />
      <CarouselNext className="-right-4 hidden size-11 bg-background/90 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover/carousel:opacity-100 disabled:opacity-0 lg:inline-flex" />
    </Carousel>
  )
}
