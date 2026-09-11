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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const next = search ?? "";

  // Public static pages (landing, privacy, support, join) don't need a session.
  // Skip the DB-backed getSession() call entirely — the client resolves auth via
  // useAuth()/api/auth. This removes the TTFB cost from the LCP-critical landing page.
  if (isPublicStatic(pathname)) {
    return NextResponse.next();
  }

  // API routes: only allow public API prefixes without a session.
  if (pathname.startsWith("/api")) {
    if (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }
    if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    // For everything else under /api, still short-circuit when not protected:
    // a session is required to authorize, so redirect to login for browsers,
    // return 401 JSON for others. Keeps behavior but only hits the DB when needed.
    if (!isProtected(pathname)) {
      return NextResponse.next();
    }
  }

  let session: { user?: { id: string } } | null = null;
  try {
    const { auth } = await import("@/lib/auth");
    session = (await auth.api.getSession({ headers: request.headers })) as any;
  } catch {
    session = null;
  }

  const isLoggedIn = Boolean(session?.user);
  const protectedPath = isProtected(pathname);
  const authOnly = isAuthOnlyPage(pathname);

  if (protectedPath && !isLoggedIn) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + next);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && authOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    pathname.startsWith("/api") &&
    !isLoggedIn &&
    !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|gif|webm|mp4)$).*)",
  ],
};
