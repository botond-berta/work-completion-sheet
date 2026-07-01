import type { CompanyConfig, WorkSheetFormData } from "@/db/schema";

/**
 * Generates the complete HTML for the Fedora work sheet print view.
 * The output is injected directly into the browser for window.print() → PDF.
 */
export function renderFedoraTemplate(config: CompanyConfig, data: WorkSheetFormData): string {
  const { colors } = config;

  const engineerCells = config.engineerPermits
    .map(
      (p) => `
    <div class="cell">
      <label>
        <input type="checkbox" ${data.selectedEngineers.includes(p.number) ? "checked" : ""} disabled>
        <span class="no">${esc(p.number)}</span>
      </label>
      <span>${esc(p.name)}</span>
    </div>`
    )
    .join("");

  const productRow = (product: { id: string; name: string; activeIngredient: string }) => `
    <div class="prod">
      <span class="name">
        <input type="checkbox" ${data.selectedProducts.includes(product.id) ? "checked" : ""} disabled>
        ${esc(product.name)}
      </span>
      ${product.activeIngredient ? `<span class="act">Hatóanyag: ${esc(product.activeIngredient)}</span>` : ""}
    </div>`;

  const rovarirtas = config.products.rovarirtas.map(productRow).join("");
  const ragcsaloirtas = config.products.ragcsaloirtas.map(productRow).join("");
  const agyiPoloska = config.products.agyi_poloska.map(productRow).join("");

  const fixtureRows = config.fixtures
    .map(
      (f) => `
    <div class="row">
      <div><span class="item">${esc(f.label)}:</span> <input class="cnt" type="text" value="${esc(data.fixtures[f.label]?.kihelyezes ?? "")}" readonly> ${f.unitLabel ?? "db"}.</div>
      <div><span class="item">${esc(f.label)}:</span> <input class="cnt" type="text" value="${esc(data.fixtures[f.label]?.toltes ?? "")}" readonly> ${f.unitLabel ?? "db"}</div>
    </div>`
    )
    .join("");

  const logoSvg = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,25 90,25 50,80" fill="#fff"/>
      <g stroke="${esc(colors.primary)}" stroke-width="3">
        <line x1="50" y1="80" x2="30" y2="30"/>
        <line x1="50" y1="80" x2="42" y2="30"/>
        <line x1="50" y1="80" x2="50" y2="30"/>
        <line x1="50" y1="80" x2="58" y2="30"/>
        <line x1="50" y1="80" x2="70" y2="30"/>
      </g>
    </svg>`;

  const headerHtml = `
    <header>
      <div class="logo">${logoSvg}</div>
      <div class="brand">
        <h1>FEDORA-EXTRA KFT.</h1>
        <div class="sub">${esc(config.subtitle)}</div>
      </div>
    </header>`;

  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<title>Teljesítési Igazolás – ${esc(data.munkateruletMegnevezese)}</title>
<style>
  :root{
    --red:${esc(colors.primary)};
    --red-bright:${esc(colors.secondary)};
    --olive:${esc(colors.accent)};
    --blue:#2f5aa0;
    --ink:#111;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;background:#e9e9e9;color:var(--ink);font-family:"Times New Roman",Georgia,serif;}
  .page{background:#fff;width:210mm;min-height:297mm;margin:16px auto;padding:16mm 18mm;box-shadow:0 2px 10px rgba(0,0,0,.25);position:relative;}
  .page-number{position:absolute;top:6mm;right:18mm;font-size:9pt;}
  .page-number.bottom{top:auto;bottom:8mm;left:0;right:0;text-align:center;}
  header{display:flex;align-items:center;gap:14px;border-bottom:2px solid var(--red);padding-bottom:6px;}
  .logo{width:70px;height:70px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#b02024,#6d0f12);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
  .logo svg{width:42px;height:42px;}
  .brand{flex:1;}
  .brand h1{margin:0;font-size:30pt;font-weight:bold;color:#111;}
  .brand .sub{margin-top:2px;font-size:13pt;font-weight:bold;letter-spacing:6px;color:#6b7a86;}
  .lic{text-align:center;margin:8px 0 2px;font-size:11pt;color:var(--red-bright);}
  .lic .num{color:var(--blue);font-weight:bold;}
  .doc-title{text-align:center;font-size:16pt;font-weight:bold;color:var(--olive);margin:2px 0 14px;}
  .field-row{display:flex;align-items:flex-end;margin:10px 0;gap:10px;}
  .field-row label{font-weight:bold;font-size:12pt;white-space:nowrap;}
  .field-row .fill{flex:1;border-bottom:1px solid #000;min-height:20px;font-size:12pt;padding:0 4px 2px;}
  .eng{margin:14px 0 4px;}
  .eng .lead{color:var(--red-bright);font-weight:bold;font-size:11pt;margin-bottom:3px;}
  .eng-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:9.5pt;text-align:center;}
  .eng-grid .cell{display:flex;flex-direction:column;align-items:center;gap:2px;}
  .eng-grid .no{font-weight:bold;}
  .eng-grid label{display:inline-flex;align-items:center;gap:4px;}
  .services-title{color:var(--olive);font-weight:bold;font-size:14pt;margin:16px 0 6px;}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
  .cat-head{display:flex;align-items:center;gap:8px;font-size:13pt;font-weight:bold;color:var(--red);margin-bottom:6px;}
  .prod{margin:6px 0;font-size:9pt;}
  .prod .name{font-weight:bold;display:inline-flex;align-items:flex-start;gap:5px;}
  .prod .act{color:#000;margin-left:18px;display:block;line-height:1.25;}
  .antidote{font-weight:bold;font-size:11pt;margin:8px 0;}
  .monitoring-head{display:flex;align-items:center;gap:8px;font-weight:bold;font-size:13pt;margin:10px 0 4px;}
  .bedbug{margin-top:14px;}
  .bedbug-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;}
  .sds{color:var(--blue);font-weight:bold;font-size:10pt;margin:14px 0 6px;}
  .bottom{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:4px;}
  .note-box .lbl{font-weight:bold;font-size:9.5pt;margin-bottom:2px;}
  .note-box .text-content{width:100%;height:120px;border:1px solid #000;font:inherit;font-size:10pt;padding:4px;}
  .fixtures{font-size:10.5pt;}
  .fixtures .head-row{display:grid;grid-template-columns:1fr 1fr;font-weight:bold;margin-bottom:4px;gap:10px;}
  .fixtures .row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:3px 0;}
  .fixtures .row .item{font-weight:bold;}
  .fixtures .cnt{width:38px;border:none;border-bottom:1px solid #000;text-align:center;font:inherit;}
  .signs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;text-align:center;font-weight:bold;}
  .signs .line{border-top:1px dotted #000;padding-top:4px;}
  input[type="checkbox"]{width:12px;height:12px;accent-color:#333;}
  .cat-head input[type="checkbox"]{width:16px;height:16px;}
  .p2-title{color:var(--red);font-weight:bold;text-align:center;font-size:13pt;margin:6px 0 16px;}
  .p2 h2{font-size:12pt;color:#111;margin:16px 0 6px;}
  .p2 h3{font-size:11pt;font-style:italic;margin:10px 0 4px;font-weight:bold;}
  .p2 ul{margin:2px 0 8px;padding-left:22px;font-size:10.5pt;line-height:1.45;}
  .p2 li{margin:3px 0;}
  @media print{
    body{background:#fff;}
    .page{box-shadow:none;margin:0;width:auto;min-height:auto;page-break-after:always;}
  }
</style>
</head>
<body>

<section class="page" id="page-1">
  <div class="page-number">1/2</div>
  ${headerHtml}
  <div class="lic"><b>Vállalkozás engedély száma:</b> <span class="num">${esc(config.licenseNumber)}</span></div>
  <div class="doc-title">TELJESÍTÉSI IGAZOLÁS / MUNKALAP</div>

  <div class="field-row">
    <label>Munkaterület megnevezése:</label>
    <div class="fill">${esc(data.munkateruletMegnevezese)}</div>
  </div>
  <div class="field-row">
    <label>Munkavégzés ideje:</label>
    <div class="fill">${esc(data.munkavegzesIdeje)}</div>
  </div>
  <div class="field-row">
    <label>Munkaterület mérete:</label>
    <div class="fill">${esc(data.munkateruletMerete)}</div>
  </div>

  <div class="eng">
    <div class="lead">Mű.eng.számok:</div>
    <div class="eng-grid">${engineerCells}</div>
  </div>

  <div class="services-title">ELVÉGZETT SZOLGÁLTATÁS ÉS FELHASZNÁLT KÉSZÍTMÉNY-/EK:</div>

  <div class="cols">
    <div class="col-left">
      <div class="cat-head">
        <input type="checkbox" ${data.catRovarirtas ? "checked" : ""} disabled>
        <span>ROVARIRTÁS:</span>
      </div>
      ${rovarirtas}
    </div>
    <div class="col-right">
      <div class="cat-head">
        <input type="checkbox" ${data.catRagcsaloirtas ? "checked" : ""} disabled>
        <span>RÁGCSÁLÓIRTÁS:</span>
      </div>
      ${ragcsaloirtas}
      <div class="antidote">ELLENSZER: ${esc(config.antidote)}</div>
      <div class="monitoring-head">
        <span>Monitoring:</span>
        <input type="checkbox" ${data.catMonitoring ? "checked" : ""} disabled>
      </div>
    </div>
  </div>

  <div class="bedbug">
    <div class="cat-head">
      <input type="checkbox" ${data.catAgyiPoloska ? "checked" : ""} disabled>
      <span>ÁGYI POLOSKA IRTÁS:</span>
    </div>
    <div class="bedbug-grid">
      ${agyiPoloska}
      ${
        data.egyebText
          ? `<div class="prod"><span class="name"><input type="checkbox" checked disabled> Egyéb: ${esc(data.egyebText)}</span></div>`
          : '<div class="prod"><span class="name"><input type="checkbox" disabled> Egyéb:</span> <span style="border-bottom:1px solid #000;display:inline-block;width:120px;">&nbsp;</span></div>'
      }
    </div>
  </div>

  <div class="sds">BIZTONSÁGI ADATLAPOK MELLÉKELVE</div>

  <div class="bottom">
    <div class="note-box">
      <div class="lbl">Megjegyzés:</div>
      <div class="text-content">${esc(data.megjegyzes)}</div>
    </div>
    <div class="fixtures">
      <div class="head-row"><div>Szerelvény Kihelyezés:</div><div>Szerelvény Töltés:</div></div>
      ${fixtureRows}
    </div>
  </div>

  <div class="signs">
    <div class="line">Munkavégző</div>
    <div class="line">Munkavégzést igazoló</div>
  </div>
</section>

<section class="page p2" id="page-2">
  <div class="page-number">2/2</div>
  ${headerHtml}
  ${config.page2Html}
  <div class="page-number bottom">2/2</div>
</section>

</body>
</html>`;
}

function esc(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
