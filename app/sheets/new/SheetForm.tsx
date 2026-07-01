"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { companies } from "@/db/schema";
import type { CompanyConfig, WorkSheetFormData } from "@/db/schema";

type Company = typeof companies.$inferSelect;

export default function SheetForm({ company, userId }: { company: Company; userId: string }) {
  const router = useRouter();
  const config = company.config as CompanyConfig;

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<WorkSheetFormData>({
    munkateruletMegnevezese: "",
    munkavegzesIdeje: "",
    munkateruletMerete: "",
    selectedEngineers: [],
    selectedProducts: [],
    catRovarirtas: false,
    catRagcsaloirtas: false,
    catMonitoring: false,
    catAgyiPoloska: false,
    egyebText: "",
    megjegyzes: "",
    fixtures: Object.fromEntries(
      config.fixtures.map((f) => [f.label, { kihelyezes: "", toltes: "" }])
    ),
  });

  function setField<K extends keyof WorkSheetFormData>(key: K, value: WorkSheetFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, formData }),
      });
      if (!res.ok) throw new Error("Mentés sikertelen");
      const { id } = await res.json();
      router.push(`/sheets/${id}`);
    } catch (e) {
      alert("Hiba a mentés során. Kérlek próbáld újra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-bold text-gray-900">Új munkalap</h1>
          <p className="text-xs text-gray-500">{company.displayName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Vissza
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">

        {/* Alapadatok */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg">Alapadatok</h2>
          <Field label="Munkaterület megnevezése">
            <input
              type="text"
              value={formData.munkateruletMegnevezese}
              onChange={(e) => setField("munkateruletMegnevezese", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="pl. Raktárépület, Budapest..."
            />
          </Field>
          <Field label="Munkavégzés ideje">
            <input
              type="text"
              value={formData.munkavegzesIdeje}
              onChange={(e) => setField("munkavegzesIdeje", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="pl. 2026.07.01. 09:00–11:00"
            />
          </Field>
          <Field label="Munkaterület mérete">
            <input
              type="text"
              value={formData.munkateruletMerete}
              onChange={(e) => setField("munkateruletMerete", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="pl. 450 m²"
            />
          </Field>
        </section>

        {/* Műszaki engedélyszámok */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-800 text-lg mb-4">Műszaki engedélyszámok</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {config.engineerPermits.map((permit) => (
              <label
                key={permit.number}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.selectedEngineers.includes(permit.number)}
                  onChange={() =>
                    setField("selectedEngineers", toggleArrayItem(formData.selectedEngineers, permit.number))
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">
                  <span className="font-mono font-bold">{permit.number}</span>
                  <br />
                  <span className="text-gray-500 text-xs">{permit.name}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Rovarirtás */}
        <ServiceSection
          title="Rovarirtás"
          checked={formData.catRovarirtas}
          onToggle={() => setField("catRovarirtas", !formData.catRovarirtas)}
          products={config.products.rovarirtas}
          selectedProducts={formData.selectedProducts}
          onProductToggle={(id) =>
            setField("selectedProducts", toggleArrayItem(formData.selectedProducts, id))
          }
        />

        {/* Rágcsálóirtás */}
        <ServiceSection
          title="Rágcsálóirtás"
          checked={formData.catRagcsaloirtas}
          onToggle={() => setField("catRagcsaloirtas", !formData.catRagcsaloirtas)}
          products={config.products.ragcsaloirtas}
          selectedProducts={formData.selectedProducts}
          onProductToggle={(id) =>
            setField("selectedProducts", toggleArrayItem(formData.selectedProducts, id))
          }
          footer={<p className="text-xs text-gray-500 mt-2">Ellenszer: {config.antidote}</p>}
        />

        {/* Monitoring */}
        <section className="bg-white rounded-xl border p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.catMonitoring}
              onChange={() => setField("catMonitoring", !formData.catMonitoring)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-semibold text-gray-800 text-lg">Monitoring</span>
          </label>
        </section>

        {/* Ágyi poloska */}
        <ServiceSection
          title="Ágyi poloska irtás"
          checked={formData.catAgyiPoloska}
          onToggle={() => setField("catAgyiPoloska", !formData.catAgyiPoloska)}
          products={config.products.agyi_poloska}
          selectedProducts={formData.selectedProducts}
          onProductToggle={(id) =>
            setField("selectedProducts", toggleArrayItem(formData.selectedProducts, id))
          }
          extraField={
            <div className="mt-3">
              <label className="text-xs text-gray-600 font-medium">Egyéb:</label>
              <input
                type="text"
                value={formData.egyebText}
                onChange={(e) => setField("egyebText", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Egyéb készítmény..."
              />
            </div>
          }
        />

        {/* Szerelvények */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-800 text-lg mb-4">Szerelvények</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <p className="text-sm font-medium text-gray-600">Kihelyezés</p>
            <p className="text-sm font-medium text-gray-600">Töltés</p>
            {config.fixtures.map((fixture) => (
              <>
                <div key={`k-${fixture.label}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-28">{fixture.label}:</span>
                  <input
                    type="text"
                    value={formData.fixtures[fixture.label]?.kihelyezes ?? ""}
                    onChange={(e) =>
                      setField("fixtures", {
                        ...formData.fixtures,
                        [fixture.label]: {
                          ...formData.fixtures[fixture.label],
                          kihelyezes: e.target.value,
                        },
                      })
                    }
                    className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-500">{fixture.unitLabel ?? "db"}</span>
                </div>
                <div key={`t-${fixture.label}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-28">{fixture.label}:</span>
                  <input
                    type="text"
                    value={formData.fixtures[fixture.label]?.toltes ?? ""}
                    onChange={(e) =>
                      setField("fixtures", {
                        ...formData.fixtures,
                        [fixture.label]: {
                          ...formData.fixtures[fixture.label],
                          toltes: e.target.value,
                        },
                      })
                    }
                    className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-500">{fixture.unitLabel ?? "db"}</span>
                </div>
              </>
            ))}
          </div>
        </section>

        {/* Megjegyzés */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-800 text-lg mb-3">Megjegyzés</h2>
          <textarea
            value={formData.megjegyzes}
            onChange={(e) => setField("megjegyzes", e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Megjegyzések a munkáról..."
          />
        </section>

        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Vissza
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Mentés..." : "Mentés és tovább"}
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ServiceSection({
  title,
  checked,
  onToggle,
  products,
  selectedProducts,
  onProductToggle,
  footer,
  extraField,
}: {
  title: string;
  checked: boolean;
  onToggle: () => void;
  products: { id: string; name: string; activeIngredient: string }[];
  selectedProducts: string[];
  onProductToggle: (id: string) => void;
  footer?: React.ReactNode;
  extraField?: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border p-6">
      <label className="flex items-center gap-3 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-5 h-5 accent-blue-600"
        />
        <span className="font-semibold text-gray-800 text-lg">{title}</span>
      </label>
      <div className="space-y-2">
        {products.map((product) => (
          <label
            key={product.id}
            className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => onProductToggle(product.id)}
              className="w-4 h-4 accent-blue-600 mt-0.5 shrink-0"
            />
            <span className="text-sm">
              <span className="font-medium">{product.name}</span>
              {product.activeIngredient && (
                <span className="block text-gray-500 text-xs mt-0.5">
                  Hatóanyag: {product.activeIngredient}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      {extraField}
      {footer}
    </section>
  );
}
