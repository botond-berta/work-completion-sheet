import { pgTable, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";

// ── Companies ─────────────────────────────────────────────────────────────────
// Every company has its own template config. The developer adds a template HTML
// file under /templates/template_<slug>.html — the slug matches company.slug.
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),          // e.g. "fedora"
  displayName: text("display_name").notNull(),    // e.g. "FEDORA-EXTRA KFT."
  config: jsonb("config").notNull().$type<CompanyConfig>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Users ─────────────────────────────────────────────────────────────────────
// Auth is handled by Clerk; we only store company assignment and role locally.
export const users = pgTable("users", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  companyId: uuid("company_id").references(() => companies.id),
  role: text("role", { enum: ["admin", "worker"] }).notNull().default("worker"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Work Sheets ───────────────────────────────────────────────────────────────
export const workSheets = pgTable("work_sheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  createdBy: text("created_by").references(() => users.clerkUserId).notNull(),
  formData: jsonb("form_data").notNull().$type<WorkSheetFormData>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type EngineerPermit = {
  number: string;  // e.g. "-61820."
  name: string;    // e.g. "H.I.János."
};

export type Product = {
  id: string;
  name: string;
  activeIngredient: string;
};

export type FixtureRow = {
  label: string;   // e.g. "Monitoring"
  unitLabel?: string; // e.g. "db"
};

export type CompanyConfig = {
  licenseNumber: string;
  subtitle: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  engineerPermits: EngineerPermit[];
  products: {
    rovarirtas: Product[];
    ragcsaloirtas: Product[];
    agyi_poloska: Product[];
  };
  fixtures: FixtureRow[];
  antidote: string;
  page2Html: string;
};

export type WorkSheetFormData = {
  munkateruletMegnevezese: string;
  munkavegzesIdeje: string;
  munkateruletMerete: string;
  selectedEngineers: string[];      // permit numbers
  selectedProducts: string[];       // product ids
  catRovarirtas: boolean;
  catRagcsaloirtas: boolean;
  catMonitoring: boolean;
  catAgyiPoloska: boolean;
  egyebText: string;
  megjegyzes: string;
  fixtures: Record<string, { kihelyezes: string; toltes: string }>;
};
