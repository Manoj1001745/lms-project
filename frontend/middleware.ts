import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get("learninghun_admin_token")?.value;
  const userToken = request.cookies.get("learninghun_user_token")?.value;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isStudentRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-courses") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/certificates") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/my-list") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/checkout");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAdminRoute && !adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isStudentRoute && !userToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Do not redirect login pages based on cookie presence alone.
  // Stale/invalid tokens can otherwise cause redirect loops.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/my-courses",
    "/my-courses/:path*",
    "/payments",
    "/payments/:path*",
    "/certificates",
    "/certificates/:path*",
    "/profile",
    "/profile/:path*",
    "/my-list",
    "/my-list/:path*",
    "/courses",
    "/courses/:path*",
    "/learn/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};

