import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workSheets, users, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { formatDate } from "@/lib/format";
import DeleteSheetButton from "./DeleteSheetButton";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Hozzáférés szükséges</h1>
          <p className="text-gray-600">
            A fiókod még nincs céghez rendelve. Kérj segítséget az adminisztrátortól.
          </p>
        </div>
      </main>
    );
  }

  const sheets = await db
    .select()
    .from(workSheets)
    .where(eq(workSheets.companyId, user.companyId!))
    .orderBy(desc(workSheets.createdAt))
    .limit(50);

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, user.companyId!),
  });

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{company?.displayName ?? "Munkalap"}</h1>
          <p className="text-sm text-gray-500">Teljesítési munkalapok</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
              Admin
            </Link>
          )}
          <UserButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Munkalapok</h2>
          <Link
            href="/sheets/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Új munkalap
          </Link>
        </div>

        {sheets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Még nincs munkalap.</p>
            <p className="text-sm mt-1">Kattints az &ldquo;Új munkalap&rdquo; gombra az első létrehozásához.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sheets.map((sheet) => (
              <div key={sheet.id} className="flex items-center gap-2">
                <Link
                  href={`/sheets/${sheet.id}`}
                  className="flex-1 bg-white border rounded-lg px-5 py-4 hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {(sheet.formData as { munkateruletMegnevezese?: string }).munkateruletMegnevezese || "Névtelen munkalap"}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {(sheet.formData as { munkavegzesIdeje?: string }).munkavegzesIdeje || "—"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(sheet.createdAt)}</p>
                  </div>
                </Link>
                {isAdmin && <DeleteSheetButton sheetId={sheet.id} />}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
