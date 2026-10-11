import { NextResponse, type NextRequest } from "next/server"
import { REFERRAL_COOKIE } from "@/lib/referral-cookie"

/**
 * Remembers refer-a-friend links (`?ref=CODE` on any page) for 30 days (the latest link wins), so the invite is applied
 * when the visitor later creates an account — see claimPendingReferral in app/actions/auth.ts.
 */
export function proxy(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("ref")?.trim().toUpperCase()
  const response = NextResponse.next()
  if (code && /^[A-Z0-9]{4,16}$/.test(code)) {
    response.cookies.set(REFERRAL_COOKIE, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  return response
}

export const config = {
  matcher: [{ source: "/((?!api|_next/static|_next/image|favicon.ico).*)", has: [{ type: "query", key: "ref" }] }],
}
