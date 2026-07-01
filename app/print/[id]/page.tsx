import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workSheets, users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { renderFedoraTemplate } from "@/lib/templates/fedora";
import type { WorkSheetFormData, CompanyConfig } from "@/db/schema";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) redirect("/sign-in");

  const sheet = await db.query.workSheets.findFirst({ where: eq(workSheets.id, id) });
  if (!sheet || sheet.companyId !== user.companyId) notFound();

  const company = await db.query.companies.findFirst({ where: eq(companies.id, sheet.companyId) });
  if (!company) notFound();

  const data = sheet.formData as WorkSheetFormData;
  const config = company.config as CompanyConfig;

  // A company slug alapján választjuk ki a template renderert
  const html = renderTemplate(company.slug, config, data);

  return (
    <>
      {/* Auto-trigger print dialog when page loads */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('load', () => { setTimeout(() => window.print(), 400); });`,
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

function renderTemplate(slug: string, config: CompanyConfig, data: WorkSheetFormData): string {
  switch (slug) {
    case "fedora":
      return renderFedoraTemplate(config, data);
    default:
      return `<p>Ismeretlen template: ${slug}</p>`;
  }
}
