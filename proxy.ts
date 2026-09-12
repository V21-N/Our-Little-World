import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_STATIC_PATHS = ["/", "/privacy", "/support"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/memories",
  "/story",
  "/letters",
  "/bucket-list",
  "/playlist",
  "/quiz",
  "/mood",
  "/future",
  "/achievements",
  "/settings",
  "/onboarding",
];

const AUTH_ONLY_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

const PUBLIC_API_PREFIXES = ["/api/couples/by-invite"];

function isPublicStatic(pathname: string) {
  return PUBLIC_STATIC_PATHS.includes(pathname) || pathname.startsWith("/join");
}

function isProtected(pathname: string) {
  if (isPublicStatic(pathname)) return false;
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  return false;
}

function isAuthOnlyPage(pathname: string) {
  return AUTH_ONLY_PAGES.includes(pathname);
}

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("yugma.session_token") ||
    request.cookies.has("__Secure-yugma.session_token")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const next = search ?? "";

  if (isPublicStatic(pathname)) {
    return NextResponse.next();
  }

  // API route protection remains handled by route handlers
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Use cookie presence as a fast-path gate for protected pages
  const isLoggedIn = hasSessionCookie(request);
  const protectedPath = isProtected(pathname);
  const authOnly = isAuthOnlyPage(pathname);

  if (protectedPath && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + next);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && authOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|gif|webm|mp4)$).*)",
  ],
};
