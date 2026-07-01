import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workSheets, users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { WorkSheetFormData, CompanyConfig } from "@/db/schema";
import { formatDate } from "@/lib/format";
import PrintButton from "./PrintButton";

export default async function SheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) redirect("/dashboard");

  const sheet = await db.query.workSheets.findFirst({ where: eq(workSheets.id, id) });
  if (!sheet || sheet.companyId !== user.companyId) notFound();

  const company = await db.query.companies.findFirst({ where: eq(companies.id, sheet.companyId) });
  if (!company) notFound();

  const data = sheet.formData as WorkSheetFormData;
  const config = company.config as CompanyConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">
            {data.munkateruletMegnevezese || "Névtelen munkalap"}
          </h1>
          <p className="text-xs text-gray-500">
            {company.displayName} · {formatDate(sheet.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
            ← Vissza
          </Link>
          <PrintButton sheetId={sheet.id} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Alapadatok */}
        <Card title="Alapadatok">
          <Row label="Munkaterület" value={data.munkateruletMegnevezese} />
          <Row label="Munkavégzés ideje" value={data.munkavegzesIdeje} />
          <Row label="Munkaterület mérete" value={data.munkateruletMerete} />
        </Card>

        {/* Engedélyszámok */}
        {data.selectedEngineers.length > 0 && (
          <Card title="Műszaki engedélyszámok">
            <div className="flex flex-wrap gap-2">
              {data.selectedEngineers.map((num) => {
                const permit = config.engineerPermits.find((p) => p.number === num);
                return (
                  <span key={num} className="text-sm bg-gray-100 rounded px-2 py-1">
                    <span className="font-mono font-bold">{num}</span>
                    {permit && <span className="text-gray-500 ml-1">{permit.name}</span>}
                  </span>
                );
              })}
            </div>
          </Card>
        )}

        {/* Elvégzett szolgáltatások */}
        <Card title="Elvégzett szolgáltatások">
          {data.catRovarirtas && <Badge label="Rovarirtás" />}
          {data.catRagcsaloirtas && <Badge label="Rágcsálóirtás" />}
          {data.catMonitoring && <Badge label="Monitoring" />}
          {data.catAgyiPoloska && <Badge label="Ágyi poloska irtás" />}

          {data.selectedProducts.length > 0 && (
            <div className="mt-3 space-y-1">
              {data.selectedProducts.map((pid) => {
                const product =
                  [...config.products.rovarirtas, ...config.products.ragcsaloirtas, ...config.products.agyi_poloska].find(
                    (p) => p.id === pid
                  );
                return product ? (
                  <p key={pid} className="text-sm">
                    <span className="font-medium">✓ {product.name}</span>
                    {product.activeIngredient && (
                      <span className="text-gray-500 ml-2 text-xs">({product.activeIngredient})</span>
                    )}
                  </p>
                ) : null;
              })}
            </div>
          )}
          {data.egyebText && (
            <p className="text-sm mt-2">
              <span className="font-medium">Egyéb:</span> {data.egyebText}
            </p>
          )}
        </Card>

        {/* Szerelvények */}
        <Card title="Szerelvények">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="font-medium text-gray-600">Kihelyezés</p>
            <p className="font-medium text-gray-600">Töltés</p>
            {Object.entries(data.fixtures).map(([label, val]) => (
              <>
                <p key={`k-${label}`}>{label}: <span className="font-bold">{val.kihelyezes || "—"}</span> db</p>
                <p key={`t-${label}`}>{label}: <span className="font-bold">{val.toltes || "—"}</span> db</p>
              </>
            ))}
          </div>
        </Card>

        {/* Megjegyzés */}
        {data.megjegyzes && (
          <Card title="Megjegyzés">
            <p className="text-sm whitespace-pre-wrap">{data.megjegyzes}</p>
          </Card>
        )}
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm py-1 border-b last:border-0">
      <span className="text-gray-500 w-40 shrink-0">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block text-sm bg-blue-50 text-blue-700 rounded px-2 py-0.5 mr-2 mb-1 font-medium">
      {label}
    </span>
  );
}
