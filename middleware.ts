import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

const clerk = clerkMiddleware();

export function middleware(req: NextRequest, event: NextFetchEvent) {
  return clerk(req, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
