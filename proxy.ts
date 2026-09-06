import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
];

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

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/join")) return true;
  return false;
}

function isProtected(pathname: string) {
  if (isPublic(pathname)) return false;
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
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname + next);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn) {
    if (pathname === "/" || authOnly) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const PUBLIC_API_PREFIXES = ["/api/couples/by-invite"];

  if (pathname.startsWith("/api") && pathname !== "/api/auth" && !pathname.startsWith("/api/auth/") && !isLoggedIn) {
    if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
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
