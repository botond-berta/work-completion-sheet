export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import SheetForm from "./SheetForm";

export default async function NewSheetPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user?.companyId) redirect("/dashboard");

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, user.companyId),
  });

  if (!company) redirect("/dashboard");

  return <SheetForm company={company} userId={userId} />;
}
