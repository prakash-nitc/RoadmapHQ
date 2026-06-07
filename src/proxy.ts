import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gate the entire app behind APP_PASSWORD. Skipped entirely if APP_PASSWORD
// is empty so local dev works without prompting.
//
// Auth flow:
//   1. User hits any page with no cookie → redirected to /unlock
//   2. /unlock posts to /api/unlock with the password
//   3. On match, an httpOnly cookie is set (90 days) and they're redirected home
//
// Cookie value = the password itself (cheap but adequate for a single-user
// personal app). A real app would HMAC it; here the threat model is "casual
// snooping" not "motivated attacker".

const COOKIE_NAME = "dsa_unlock";
const UNLOCK_PATH = "/unlock";
const UNLOCK_API = "/api/unlock";

// Paths that never need auth (the unlock page itself, manifest, icons).
function isPublicPath(pathname: string): boolean {
  return (
    pathname === UNLOCK_PATH ||
    pathname === UNLOCK_API ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/icon.svg" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  );
}

export function proxy(req: NextRequest) {
  const password = process.env.APP_PASSWORD;

  // No password configured → no gating.
  if (!password || password.length === 0) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieValue === password) {
    return NextResponse.next();
  }

  // Not authorized — redirect to the unlock page.
  const unlockUrl = new URL(UNLOCK_PATH, req.url);
  // Preserve where the user was trying to go so we can send them there after.
  if (pathname !== "/") unlockUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  // Run on every path; the function above handles its own exclusions.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
