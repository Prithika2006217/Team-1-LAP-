// ---------------------------------------------------------------------------
// Edge middleware — lightweight route protection (BASE).
// ---------------------------------------------------------------------------
// Runs on Vercel's Edge network before the page renders. It only checks for
// the presence of the JWT cookie (no crypto/verification here — keep edge logic
// cheap). Real token verification happens in the API and/or server components.
//
//   - Visiting /dashboard/* without a token  -> redirect to /login
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on dashboard routes.
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
