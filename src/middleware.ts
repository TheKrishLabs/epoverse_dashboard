
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/auth"];
const adminRoutes = ["/settings", "/theme", "/web-setup", "/role-and-permission"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing: ${pathname} | Token: ${!!token} | Role: ${userRole || 'none'}`);

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // 1. If trying to access a protected route without a token -> Redirect to Login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    // Optional: Add ?from=... to redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to access login/auth route WITH a token -> Redirect to Dashboard
  if (isPublicRoute && token && (pathname === "/login" || pathname === "/" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. RBAC: Restrict admin routes to admin role
  if (isAdminRoute && userRole !== "admin") {
    console.log(`[Middleware] Access Denied: User role '${userRole}' cannot access ${pathname}`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

// Configure paths to match
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
