import { NextRequest, NextResponse } from "next/server";

// Auth protection is handled per-page via Clerk's auth() in server components.
// This middleware is intentionally minimal to stay edge-compatible on Cloudflare Workers.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
