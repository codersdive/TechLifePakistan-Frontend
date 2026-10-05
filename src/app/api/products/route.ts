import { NextResponse, type NextRequest } from "next/server"
import { getProducts, getProductsByIds } from "@/lib/api"

/** Client-side catalog access (instant search, wishlist, compare). */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const ids = sp.get("ids")
  if (ids != null) {
    return NextResponse.json({ data: await getProductsByIds(ids.split(",").filter(Boolean)) })
  }
  const res = await getProducts({ q: sp.get("q") ?? undefined, pageSize: Number(sp.get("limit") ?? 8) })
  return NextResponse.json(res)
}
