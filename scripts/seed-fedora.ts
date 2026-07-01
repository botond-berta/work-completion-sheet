/**
 * Seed script: Fedora-Extra Kft. cég és első admin felhasználó létrehozása.
 *
 * Futtatás:
 *   npx tsx scripts/seed-fedora.ts
 *
 * Szükséges: DATABASE_URL env változó (másolj egy .env.local fájlt vagy add meg közvetlenül)
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { companies, users } from "../db/schema";
import type { CompanyConfig } from "../db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const page2Html = `
<div class="p2-title">IRTÁS UTÁNI TEENDŐK – ÜGYFÉL TÁJÉKOZTATÓ</div>

<h2>1. ROVARIRTÁS UTÁNI TEENDŐK</h2>
<h3>Permetezés alkalmazása esetén</h3>
<ul>
  <li>A kezelt területet a kezelés befejezését követően minimum 2–4 órán át zárva kell tartani.</li>
  <li>A várakozási idő letelte után alapos szellőztetés szükséges (legalább 20–30 perc).</li>
  <li>A kezelt felületek 48 óráig nem moshatók.</li>
  <li>A kezelt helyeket takarással vagy tisztítással megbolygatni tilos.</li>
  <li>Háziállatok és gyermekek csak teljes szellőztetés után vihetők vissza.</li>
</ul>
<h3>Géllel végzett csótányirtás esetén</h3>
<ul>
  <li>A gélt nem szabad eltávolítani vagy lemosni.</li>
  <li>A gél hatása 1–2 hét alatt teljesedik ki, a csótányok aktivitása átmenetileg fokozódhat.</li>
  <li>Csótányfertőzöttség esetén az ismétlő kezelések között legfeljebb 3–4 hét telhet el.</li>
</ul>
<h3>Ágyi poloska irtása esetén</h3>
<ul>
  <li>Az ágynemű huzat mosható, de legalább 60 °C-on, azonban a matrac és a bútorok tisztítását kerülni kell.</li>
  <li>A kezelések között 7–10 napnál hosszabb idő nem hagyható ki.</li>
  <li>Az ismétlő kezelések ajánlottak, a fertőzöttség mértékétől függően akár 3–4 alkalom is szükségessé válhat.</li>
  <li>Hideg ködképző (ULV) technológia esetén a visszatéréshez minimum 6 óra szükséges, ezt követően legalább 1 órán át intenzív szellőztetés javasolt.</li>
</ul>

<h2>2. RÁGCSÁLÓIRTÁS UTÁNI TEENDŐK</h2>
<h3>Általános előírások</h3>
<ul>
  <li>A csalétkeket, etetődobozokat mozgatni, áthelyezni tilos.</li>
  <li>Gyermekek és háziállatok nem férhetnek hozzá az etetőállomásokhoz.</li>
  <li>Elhullott rágcsálók kezelése kesztyűben, kettős zacskóba zárva történjen.</li>
</ul>

<h2>3. ÁLTALÁNOS BIZTONSÁGI ELŐÍRÁSOK</h2>
<ul>
  <li>A kihelyezett irtószerekhez és monitoring eszközökhöz csak a szolgáltató nyúlhat.</li>
  <li>Élelmiszert a kezelt területekre kihelyezni tilos.</li>
  <li>A véralvadásgátló hatású rágcsálóirtó szerek esetében mérgezéskor az ellenszer a K1-vitamin, melynek alkalmazásáról minden esetben orvos dönt.</li>
</ul>

<h2>4. ESETLEGES UTÓKEZELÉS</h2>
<ul>
  <li>A fertőzöttség mértékétől függően az első kezelést követően kontroll vagy ismétlő kezelés szükséges lehet.</li>
  <li>A csótányirtásnál az ismétlők között legfeljebb 3–4 hét telhet el.</li>
  <li>Ágyi poloskánál az ismétlések 7–10 nap eltéréssel szükségesek.</li>
  <li>Erős fertőzöttség esetén többszöri, akár 3–4 kezelés is indokolt lehet.</li>
</ul>
`;

const fedoraConfig: CompanyConfig = {
  licenseNumber: "CS-06/NEO/05170-3/2025",
  subtitle: "Kártevőirtás és Fertőtlenítés",
  colors: {
    primary: "#8a1518",
    secondary: "#c0161a",
    accent: "#7d8b2e",
  },
  engineerPermits: [
    { number: "-61820.", name: "H.I.János." },
    { number: "-281269.", name: "K.Zsolt." },
    { number: "-185378.", name: "H.István" },
    { number: "-246888", name: "Z.Viktor." },
    { number: "-133515", name: "R.Tamás." },
    { number: "-307908.", name: "P.György." },
    { number: "-13901", name: "B.Péter" },
  ],
  products: {
    rovarirtas: [
      { id: "magnum", name: "Magnum® CSÓTÁNYÍRTÓ GÉL", activeIngredient: "2,51 % (21,5 g/kg) imidakloprid" },
      { id: "pertex", name: "PERTEX rovarirtó konc. (kullancs)", activeIngredient: "permetrin 3%, piperonil-butoxid 0,053%" },
      { id: "tathrin", name: "TATHRIN EC", activeIngredient: "5 % cipermetrin + 2 % imidakloprid" },
      { id: "peststop10", name: "PestStop 10 EC (kiűző szer)", activeIngredient: "10%, piperonil-butoxid 10% d-tetrametrin" },
      { id: "pyregreen", name: "PYREGREEN", activeIngredient: "5 % természetes piretrin" },
      { id: "tetracip", name: "TETRACIP EXTRA Rovarirtó koncentrátum", activeIngredient: "permetrin 15%, piperonil-butoxid 7%, tetrametrin 0,8%" },
    ],
    ragcsaloirtas: [
      { id: "protect_blokk", name: "PROTECT® PRO PARAFFINOS RÁGCSÁLÓIRTÓ BLOKK", activeIngredient: "0,005 % (0,05 g/kg) bromadiolon" },
      { id: "protect_pep", name: "PROTECT® PRO RÁGCSÁLÓIRTÓ PÉP", activeIngredient: "0,005 % (0,05 g/kg) bromadiolon" },
      { id: "kilrat", name: "KILRAT® PLUS RÁGCSÁLÓIRTÓ PÉP", activeIngredient: "0,005 % (0,05 g/kg) brodifakum" },
      { id: "prokum", name: "PROKUM PRO RÁGCSÁLÓIRTÓ GRANULÁTUM", activeIngredient: "0,005 % (0,05 g/kg) brodifakum" },
    ],
    agyi_poloska: [
      { id: "peststop16", name: "PestStop 16 EC", activeIngredient: "12% cifenotrin, 4% d-tetrametrin" },
      { id: "biopren", name: "BIOPREN 6 EC® PLUS Ágyipoloska és bolhairtó koncentrátum", activeIngredient: "s-metoprén 6,74%, Chrysanthemum cinerariaefolium kivonat" },
      { id: "sting", name: "STING Rovarirtó koncentrátum", activeIngredient: "permetrin 15%, pralletrin 2%" },
      { id: "gokilaht", name: "Gokilaht 10MC Rovarirtó koncentrátum", activeIngredient: "10%, cifenotrin" },
      { id: "cimetrol", name: "CIMETROL SUPER EW", activeIngredient: "5 % cipermetrin + 2 % imidakloprid" },
    ],
  },
  fixtures: [
    { label: "Monitoring", unitLabel: "db" },
    { label: "Egér etető", unitLabel: "db" },
    { label: "Patkányláda", unitLabel: "db" },
  ],
  antidote: "K1 vitamin (inj.: KONAKION)",
  page2Html,
};

async function main() {
  console.log("🌱 Seeding Fedora-Extra Kft...");

  const [company] = await db
    .insert(companies)
    .values({
      slug: "fedora",
      displayName: "FEDORA-EXTRA KFT.",
      config: fedoraConfig,
    })
    .onConflictDoUpdate({
      target: companies.slug,
      set: { config: fedoraConfig, displayName: "FEDORA-EXTRA KFT." },
    })
    .returning();

  console.log(`✅ Cég létrehozva/frissítve: ${company.id}`);

  // Admin felhasználó hozzárendelése (Clerk user ID-t cseréld le a sajtodra)
  const ADMIN_CLERK_USER_ID = process.env.ADMIN_CLERK_USER_ID;
  if (ADMIN_CLERK_USER_ID) {
    await db
      .insert(users)
      .values({ clerkUserId: ADMIN_CLERK_USER_ID, companyId: company.id, role: "admin" })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: { companyId: company.id, role: "admin" },
      });
    console.log(`✅ Admin felhasználó hozzárendelve: ${ADMIN_CLERK_USER_ID}`);
  } else {
    console.log("ℹ️  ADMIN_CLERK_USER_ID nem volt megadva — felhasználó nem lett hozzárendelve.");
    console.log("   Add hozzá a .env.local fájlhoz: ADMIN_CLERK_USER_ID=user_xxxx");
  }

  console.log("\n🎉 Kész!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
