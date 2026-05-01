import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect /dashboard routes — must be logged in
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin routes — must be ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Redirect logged-in users away from login/register
  if ((pathname === "/login" || pathname === "/register") && session?.user) {
    const dest = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
