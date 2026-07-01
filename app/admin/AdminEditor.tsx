"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanyConfig, EngineerPermit, Product, FixtureRow } from "@/db/schema";

type Props = {
  displayName: string;
  config: CompanyConfig;
};

export default function AdminEditor({ displayName: initDisplayName, config: initConfig }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(initDisplayName);
  const [config, setConfig] = useState<CompanyConfig>(initConfig);

  function setConfigField<K extends keyof CompanyConfig>(key: K, value: CompanyConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, config }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Mentés sikertelen. Kérlek próbáld újra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Sticky save bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 -mx-6 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-gray-900">Admin szerkesztő</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium">✓ Mentve</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </div>

      {/* Cég alapadatok */}
      <Section title="Cég alapadatok">
        <Field label="Megjelenítési név">
          <Input value={displayName} onChange={setDisplayName} placeholder="pl. FEDORA-EXTRA KFT." />
        </Field>
        <Field label="Alcím (fejlécben)">
          <Input
            value={config.subtitle}
            onChange={(v) => setConfigField("subtitle", v)}
            placeholder="pl. Kártevőirtás és Fertőtlenítés"
          />
        </Field>
        <Field label="Vállalkozás engedélyszáma">
          <Input
            value={config.licenseNumber}
            onChange={(v) => setConfigField("licenseNumber", v)}
            placeholder="pl. CS-06/NEO/05170-3/2025"
          />
        </Field>
        <Field label="Ellenszer (rágcsálóirtáshoz)">
          <Input
            value={config.antidote}
            onChange={(v) => setConfigField("antidote", v)}
            placeholder="pl. K1 vitamin (inj.: KONAKION)"
          />
        </Field>
      </Section>

      {/* Színek */}
      <Section title="Márkacolors">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Elsődleges szín">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.primary}
                onChange={(e) => setConfigField("colors", { ...config.colors, primary: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={config.colors.primary}
                onChange={(v) => setConfigField("colors", { ...config.colors, primary: v })}
                placeholder="#8a1518"
              />
            </div>
          </Field>
          <Field label="Másodlagos szín">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.secondary}
                onChange={(e) => setConfigField("colors", { ...config.colors, secondary: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={config.colors.secondary}
                onChange={(v) => setConfigField("colors", { ...config.colors, secondary: v })}
                placeholder="#c0161a"
              />
            </div>
          </Field>
          <Field label="Kiemelő szín">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.accent}
                onChange={(e) => setConfigField("colors", { ...config.colors, accent: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={config.colors.accent}
                onChange={(v) => setConfigField("colors", { ...config.colors, accent: v })}
                placeholder="#7d8b2e"
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* Engedélyszámok */}
      <Section title="Műszaki engedélyszámok">
        <div className="space-y-2">
          {config.engineerPermits.map((permit, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={permit.number}
                onChange={(v) => {
                  const updated = [...config.engineerPermits];
                  updated[i] = { ...updated[i], number: v };
                  setConfigField("engineerPermits", updated);
                }}
                placeholder="Szám (pl. -61820.)"
                className="w-36 font-mono"
              />
              <Input
                value={permit.name}
                onChange={(v) => {
                  const updated = [...config.engineerPermits];
                  updated[i] = { ...updated[i], name: v };
                  setConfigField("engineerPermits", updated);
                }}
                placeholder="Név (pl. H.I.János.)"
              />
              <RemoveButton
                onClick={() =>
                  setConfigField(
                    "engineerPermits",
                    config.engineerPermits.filter((_, j) => j !== i)
                  )
                }
              />
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            setConfigField("engineerPermits", [...config.engineerPermits, { number: "", name: "" }])
          }
          label="Engedélyszám hozzáadása"
        />
      </Section>

      {/* Termékek */}
      <ProductSection
        title="Rovarirtás termékek"
        products={config.products.rovarirtas}
        onChange={(v) => setConfigField("products", { ...config.products, rovarirtas: v })}
      />
      <ProductSection
        title="Rágcsálóirtás termékek"
        products={config.products.ragcsaloirtas}
        onChange={(v) => setConfigField("products", { ...config.products, ragcsaloirtas: v })}
      />
      <ProductSection
        title="Ágyi poloska irtás termékek"
        products={config.products.agyi_poloska}
        onChange={(v) => setConfigField("products", { ...config.products, agyi_poloska: v })}
      />

      {/* Szerelvények */}
      <Section title="Szerelvény típusok">
        <div className="space-y-2">
          {config.fixtures.map((fixture, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={fixture.label}
                onChange={(v) => {
                  const updated = [...config.fixtures];
                  updated[i] = { ...updated[i], label: v };
                  setConfigField("fixtures", updated);
                }}
                placeholder="Megnevezés (pl. Monitoring)"
              />
              <Input
                value={fixture.unitLabel ?? "db"}
                onChange={(v) => {
                  const updated = [...config.fixtures];
                  updated[i] = { ...updated[i], unitLabel: v };
                  setConfigField("fixtures", updated);
                }}
                placeholder="Egység (pl. db)"
                className="w-20"
              />
              <RemoveButton
                onClick={() =>
                  setConfigField(
                    "fixtures",
                    config.fixtures.filter((_, j) => j !== i)
                  )
                }
              />
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            setConfigField("fixtures", [...config.fixtures, { label: "", unitLabel: "db" }])
          }
          label="Szerelvény hozzáadása"
        />
      </Section>

      {/* 2. oldal szövege */}
      <Section title="2. oldal — Ügyfél tájékoztató (HTML)">
        <p className="text-xs text-gray-500 mb-2">
          Ez a szöveg jelenik meg a PDF második oldalán. HTML formátumban szerkeszthető.
        </p>
        <textarea
          value={config.page2Html}
          onChange={(e) => setConfigField("page2Html", e.target.value)}
          rows={16}
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </Section>

      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Mentés..." : "Mentés"}
        </button>
      </div>
    </div>
  );
}

// ── Termék szekció ─────────────────────────────────────────────────────────────

function ProductSection({
  title,
  products,
  onChange,
}: {
  title: string;
  products: Product[];
  onChange: (v: Product[]) => void;
}) {
  return (
    <Section title={title}>
      <div className="space-y-2">
        {products.map((product, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <Input
                value={product.name}
                onChange={(v) => {
                  const updated = [...products];
                  updated[i] = { ...updated[i], name: v };
                  onChange(updated);
                }}
                placeholder="Termék neve"
              />
              <Input
                value={product.activeIngredient}
                onChange={(v) => {
                  const updated = [...products];
                  updated[i] = { ...updated[i], activeIngredient: v };
                  onChange(updated);
                }}
                placeholder="Hatóanyag (elhagyható)"
                className="text-xs text-gray-600"
              />
            </div>
            <RemoveButton onClick={() => onChange(products.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <AddButton
        onClick={() =>
          onChange([
            ...products,
            { id: `product_${Date.now()}`, name: "", activeIngredient: "" },
          ])
        }
        label="Termék hozzáadása"
      />
    </Section>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="font-semibold text-gray-800 text-base mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
      title="Törlés"
    >
      ✕
    </button>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
    >
      + {label}
    </button>
  );
}
