export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { workSheets, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user?.companyId) {
    return NextResponse.json({ error: "No company assigned" }, { status: 403 });
  }

  const body = await request.json();
  const { companyId, formData } = body;

  if (companyId !== user.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [sheet] = await db
    .insert(workSheets)
    .values({ companyId, createdBy: userId, formData })
    .returning({ id: workSheets.id });

  return NextResponse.json({ id: sheet.id });
}
