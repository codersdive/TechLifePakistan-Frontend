"use client"

import { useState, useTransition } from "react"
import { Loader2, Star } from "lucide-react"
import { toast } from "sonner"
import { submitReview } from "@/app/actions/forms"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

/** Review form — submissions are saved as drafts in Strapi and published after moderation. */
export function ReviewDialog({ product, className }: { product: Product; className?: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!rating) {
      toast.error("Please choose a star rating")
      return
    }
    const form = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await submitReview({
        productId: product.documentId,
        rating,
        author: String(form.get("author") ?? ""),
        title: String(form.get("title") ?? "") || undefined,
        body: String(form.get("body") ?? ""),
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(res.data.message)
      setOpen(false)
      setRating(0)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("rounded-full", className)}>Write a review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Review this product</DialogTitle>
          <DialogDescription className="line-clamp-1">{product.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Your rating</Label>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <Star className={cn("size-7", n <= (hover || rating) ? "fill-rating text-rating" : "text-muted-foreground/40")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Your name</Label>
            <Input id="author" name="author" required minLength={2} maxLength={80} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="title" name="title" maxLength={120} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Your review</Label>
            <Textarea id="body" name="body" required minLength={10} maxLength={2000} rows={4} placeholder="What did you like? How is it working for you?" />
          </div>
          <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Submit review
          </Button>
          <p className="text-center text-xs text-muted-foreground">Reviews appear after a quick check by our team.</p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
