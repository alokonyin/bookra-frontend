import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// same secret as in FastAPI .env (JWT_SECRET)
const JWT_SECRET = new TextEncoder().encode("bookra_secret_key");

// routes that require authentication
const protectedRoutes = ["/traveler", "/operator", "/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // only check protected routes
  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    const token = req.cookies.get("bookra_token")?.value;

    if (!token) {
      // no token → redirect to signin
      const signinUrl = new URL("/signin", req.url);
      signinUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signinUrl);
    }

    try {
      // verify JWT and extract role
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // role-based route protection
      if (pathname.startsWith("/traveler") && role !== "traveler")
        throw new Error("unauthorized");
      if (pathname.startsWith("/operator") && role !== "operator")
        throw new Error("unauthorized");
      if (pathname.startsWith("/admin") && role !== "admin")
        throw new Error("unauthorized");

      return NextResponse.next();
    } catch {
      // invalid or expired token
      const signinUrl = new URL("/signin", req.url);
      signinUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  // allow non-protected routes
  return NextResponse.next();
}

// Apply middleware only to dashboards
export const config = {
  matcher: ["/traveler/:path*", "/operator/:path*", "/admin/:path*"],
};
