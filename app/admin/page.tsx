import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminEditor from "./AdminEditor";
import type { CompanyConfig } from "@/db/schema";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user || user.role !== "admin") redirect("/dashboard");

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, user.companyId!),
  });
  if (!company) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Admin — {company.displayName}</h1>
          <p className="text-xs text-gray-500">Cég konfiguráció szerkesztése</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
          ← Vissza
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <AdminEditor
          displayName={company.displayName}
          config={company.config as CompanyConfig}
        />
      </main>
    </div>
  );
}
