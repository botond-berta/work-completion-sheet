export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CompanyConfig } from "@/db/schema";

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user || user.role !== "admin" || !user.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { displayName, config } = body as { displayName: string; config: CompanyConfig };

  await db
    .update(companies)
    .set({ displayName, config })
    .where(eq(companies.id, user.companyId));

  return NextResponse.json({ ok: true });
}
