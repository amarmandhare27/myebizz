import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? "")
    .toLowerCase()
    .replace(/[-\s]/g, "_")
    .trim();

  if (normalized === "superadmin") return "super_admin";
  if (normalized === "administrator") return "admin";

  return normalized;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect /admin routes — require admin or super_admin role
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/admin", req.url));
    }
    const role = normalizeRole((token as any).role);
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Protect /super-admin routes — require super_admin role
  if (pathname.startsWith("/super-admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/super-admin", req.url));
    }
    if (normalizeRole((token as any).role) !== "super_admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
};
