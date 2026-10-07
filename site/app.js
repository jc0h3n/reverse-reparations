import { hbars, showTip, hideTip } from "./charts.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const src = list => list.map(([t, u]) => `<a href="${esc(u)}">${esc(t)}</a>`).join(" · ");
const usd = v => v >= 1e9 ? `US$${(v / 1e9).toFixed(v >= 1e10 ? 0 : 2)} billion` : `US$${(v / 1e6).toFixed(1)} million`;
const view = document.getElementById("view");
let D;

async function main() {
  D = await (await fetch("data.json")).json();
  render();
  addEventListener("resize", debounce(gantt, 200));
}

function render() {
  const c = D.corporate;
  view.innerHTML = `
    <h2 class="section-title">1. Colonized peoples paying the colonizers</h2>
    <p class="lead">Anghie traces today's law of reparations back to episodes in which imperial powers set the rules, declared them broken, and billed the colonized. He calls these "reverse colonial reparations".</p>
    <section class="chart"><h2>How long the payments ran</h2><p class="note">Hover for detail. The lighter segments are the loans Haiti took to pay the indemnity and the British "apprenticeship" that kept the freed working unpaid.</p><div class="body gantt" id="gantt"></div></section>
    <div class="cards">${D.reverse.slice().sort((a, b) => a.year - b.year).map(r => `
      <article class="card">
        <h3>${esc(r.name)}, ${r.year}</h3>
        <div class="flow"><b>${esc(r.payer)}</b> paid <b>${esc(r.payee)}</b></div>
        <div class="amount">${esc(r.amount)}</div>
        <p>${esc(r.detail)}</p>
        <p class="muted">${esc(r.why)}</p>
        <div class="src">${src(r.sources)}</div>
      </article>`).join("")}</div>

    <h2 class="section-title">2. Corporate reparations</h2>
    <p class="lead">${esc(c.intro)} The same law of state responsibility that makes colonial claims so hard to win has been built out, through arbitration, into a system that works.</p>
    <div class="tiles">${c.facts.map(f => `<div class="tile"><div class="value">${esc(f.value)}</div><div class="sub">${esc(f.label)}</div><div class="label">${src([f.source])}</div></div>`).join("")}</div>
    <section class="chart compare"><h2>Two courts, two scales</h2><p class="note">Nominal US dollars. The bar for the International Court of Justice covers every compensation award it has made in eight decades.</p><div class="body" id="compare"></div></section>
    <div class="cards">${c.cases.map(k => `<article class="card"><h3>${esc(k.name)}</h3><p>${esc(k.text)}</p><div class="src">${src(k.sources)}</div></article>`).join("")}</div>

    <h2 class="section-title">3. Claims for colonial reparations</h2>
    <p class="lead">Against that system, claims by the formerly colonized meet the objection that colonial conduct was lawful when it happened. Anghie suggests an answer that the colonial powers' own law already contained: trusteeship, the duty to govern dependent peoples for their benefit, which Nauru invoked at the ICJ.</p>
    <div class="cards">${D.colonial.map(k => `<article class="card"><h3>${esc(k.name)}<span class="status">${esc(k.status)}</span></h3><p>${esc(k.text)}</p>
      ${k.points ? `<ul class="ten">${k.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}<div class="src" style="margin-top:8px">${src(k.sources)}</div></article>`).join("")}</div>

    <h2 class="section-title">4. Debt</h2>
    <p class="lead">Independence often came with debt attached, as in Haiti and Indonesia, and the burden has persisted. Anghie treats the international system for managing sovereign debt as another channel for reparations running from poor countries to rich ones, now open to creditors through investment arbitration as well.</p>
    <div class="tiles">${D.debt.facts.map(f => `<div class="tile"><div class="value">${esc(f.value)}</div><div class="sub">${esc(f.label)}${f.asCited ? ` <span class="ascited">(not independently verified)</span>` : ""}</div><div class="label">${src([f.source])}</div></div>`).join("")}</div>

    <h2 class="section-title">About this page</h2>
    <ul class="sources">
      <li>Built from ${esc(D.article.cite)}, <a href="${D.article.doi}">${D.article.doi.replace("https://", "")}</a>, and the primary and secondary sources linked beside each figure. The argument is summarized; read the article for its full reasoning.</li>
      <li>Two figures differ from the article. The Rockhopper award was about €190 million rather than in pounds, and it was annulled in June 2025, after the article went to press. Sources disagree on Indonesia's debt (4.3 or 4.5 billion guilders), so both are shown.</li>
      <li>The debt-service total of $7.7 trillion comes from the article, which cites Steger; it could not be checked against the underlying data.</li>
      <li>No amounts are converted between currencies or eras except where a cited source does so (the New York Times estimate for Haiti).</li>
    </ul>`;
  gantt();
  const max = Math.max(...c.compare.map(x => x.usd));
  const el = document.getElementById("compare");
  hbars(el, c.compare.map(x => ({ label: x.label, value: x.usd, note: x.note })), { format: usd, max, tipText: i => `<b>${esc(i.label)}</b><br>${usd(i.value)}<br>${esc(i.note)}` });
  el.querySelectorAll(".hbar").forEach((row, i) => row.insertAdjacentHTML("afterend", `<p class="note">${esc(c.compare[i].note)} <a href="${esc(c.compare[i].href)}">Source</a></p>`));
}

// Timeline of payment periods, 1820 to 2020.
function gantt() {
  const el = document.getElementById("gantt");
  if (!el) return;
  const rows = D.reverse.slice().sort((a, b) => a.year - b.year);
  const W = Math.max(el.clientWidth, 300), narrow = W < 560;
  const L = narrow ? 8 : 190, R = 12, T = 8, rowH = narrow ? 52 : 34, B = 26, H = T + rows.length * rowH + B;
  const x0 = 1820, x1 = 2020, sx = x => L + (W - L - R) * (x - x0) / (x1 - x0);
  const ticks = [1820, 1860, 1900, 1940, 1980, 2020];
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Timeline of reverse reparations payments">
    ${ticks.map(t => `<line class="grid" x1="${sx(t)}" x2="${sx(t)}" y1="${T}" y2="${H - B}"/><text class="ax" x="${sx(t)}" y="${H - 8}" text-anchor="middle">${t}</text>`).join("")}
    ${rows.map((r, i) => {
      const y = T + i * rowH, by = narrow ? y + 20 : y + 9;
      return `<text class="lab" x="${narrow ? L : L - 10}" y="${narrow ? y + 13 : y + 21}" text-anchor="${narrow ? "start" : "end"}">${esc(r.name)}</text>
        ${r.spans.map(s => `<rect class="bar${s.light ? " light" : ""}" x="${sx(s.from)}" y="${by + (s.light && r.id === "britain" ? 8 : 0)}" width="${Math.max(3, sx(s.to) - sx(s.from))}" height="${s.light && r.id === "britain" ? 6 : 14}" rx="3"
          data-tip="${esc(`<b>${esc(r.name)}</b><br>${s.from}–${s.to}: ${esc(s.label)}<br>${esc(r.amount)}`)}" tabindex="0"/>`).join("")}`;
    }).join("")}
  </svg>`;
  el.querySelectorAll("[data-tip]").forEach(n => {
    n.addEventListener("pointermove", e => showTip(n.dataset.tip, e.clientX, e.clientY));
    n.addEventListener("pointerleave", hideTip);
    n.addEventListener("focus", () => { const b = n.getBoundingClientRect(); showTip(n.dataset.tip, b.right, b.top); });
    n.addEventListener("blur", hideTip);
  });
}

function debounce(f, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; }
main();
