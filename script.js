const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const visible = (arr) => (arr || []).filter((x) => x.show !== false);

const slug = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const entryId = (x) =>
  x.id || slug(x.name || x.company || x.school || x.degree);

const PICKED = ["projects", "experiences", "education"];
const COMPO_ONLY = ["id", "label", "file", "highlight"];

function pick(base, refs, key) {
  return refs
    .map((ref) => {
      const o = typeof ref === "string" ? { id: ref } : ref;
      const found = (base || []).find((x) => entryId(x) === o.id);
      if (!found) console.warn(`compo: unknown ${key} id "${o.id}"`);
      return found ? { ...found, ...o, show: true } : null;
    })
    .filter(Boolean);
}

function applyCompo(data, compo) {
  if (!compo) return data;
  const out = { ...data };
  for (const [key, val] of Object.entries(compo)) {
    if (COMPO_ONLY.includes(key)) continue;
    if (PICKED.includes(key) && Array.isArray(val))
      out[key] = pick(data[key], val, key);
    else if (key === "meta") {
      const baseMeta = { ...data.meta };
      if (val.accentColor)
        for (const k of Object.keys(COLOR_VARS)) delete baseMeta[k];
      out.meta = { ...baseMeta, ...val };
    } else if (key === "basics")
      out.basics = {
        ...data.basics,
        ...val,
        show: { ...data.basics?.show, ...val.show },
      };
    else if (key === "sections") {
      out.sections = { ...data.sections };
      for (const [k, v] of Object.entries(val))
        out.sections[k] = { ...data.sections?.[k], ...v };
    } else if (val && typeof val === "object" && !Array.isArray(val))
      out[key] = { ...data[key], ...val };
    else out[key] = val;
  }
  return out;
}

const compoFile = (data, compo) =>
  compo?.file ||
  (!compo && data.meta?.file) ||
  ["CV", data.basics?.name, compo?.label].filter(Boolean).join(" - ");

const COLOR_VARS = {
  accentColor: "--accent",
  accentColorSoft: "--accent-soft",
  accentColorTint: "--accent-tint",
  backgroundColor: "--bg",
};

function render(data, highlight = []) {
  const m = data.meta || {};
  const r = document.documentElement.style;
  for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
    if (m[key]) r.setProperty(cssVar, m[key]);
    else r.removeProperty(cssVar);
  }

  const b = data.basics || {};
  const sec = data.sections || {};
  document.documentElement.lang = m.language || "en";

  const hl = new Set(highlight.map((t) => t.toLowerCase()));
  const isHl = (t) => hl.has(String(t).toLowerCase());
  const chip = (t) =>
    `<span class="chip${isHl(t) ? " hl" : ""}">${esc(t)}</span>`;
  const hlFirst = (items) =>
    [...(items || [])].sort((a, b) => isHl(b) - isHl(a));

  const showSec = (key) => sec[key]?.show !== false;
  const secTitle = (key, fallback) => esc(sec[key]?.title || fallback);

  // ---- Contact ----
  const s = b.show || {};
  const contactBits = [];
  if (b.location && s.location !== false)
    contactBits.push(`<span>${esc(b.location)}</span>`);
  if (b.email)
    contactBits.push(
      `<span><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></span>`,
    );
  if (b.phone && s.phone !== false)
    contactBits.push(
      `<span><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></span>`,
    );
  if (b.website && s.website !== false)
    contactBits.push(
      `<span><a href="${esc(b.website)}">Mon Portfolio</a></span>`,
    );
  if (b.linkedin && s.linkedin !== false)
    contactBits.push(
      `<span><a href="${esc(b.linkedin)}">Mon LinkedIn</a></span>`,
    );
  if (b.github && s.github !== false)
    contactBits.push(`<span><a href="${esc(b.github)}">Mon GitHub</a></span>`);

  const photo =
    b.photo && s.photo === true
      ? `<span class="photo" style="--photo-zoom: ${Number(b.photoZoom) || 1}"><img src="${esc(b.photo)}" alt="${esc(b.name)}" /></span>`
      : "";

  const header = `
        <header class="cv-header">
          ${photo}
          <div>
            <h1>${esc(b.name)}</h1>
            <div class="role">${esc(b.title)}</div>
            <div class="contact">${contactBits.join("")}</div>
          </div>
        </header>`;

  const mainParts = [];
  const sideParts = [];

  // ---- Summary (main) ----
  if (showSec("summary") && b.summary) {
    mainParts.push(`<section><h2>${secTitle("summary", "Profile")}</h2>
          <p class="summary">${esc(b.summary)}</p></section>`);
  }

  // ---- Skills (sidebar) ----
  const skills = visible(data.skills);
  if (showSec("skills") && skills.length) {
    const groups = skills
      .map(
        (g) => `
          <div class="skill-group">
            <span class="cat">${esc(g.category)}</span>
            <span class="chips">${hlFirst(g.items).map(chip).join("")}</span>
          </div>`,
      )
      .join("");
    const note = sec.skills?.note
      ? `<div class="skill-note">${esc(sec.skills.note)}</div>`
      : "";
    sideParts.push(
      `<section><h2>${secTitle("skills", "Skills")}</h2>${groups}${note}</section>`,
    );
  }

  // ---- Experience ----
  const exp = visible(data.experiences);
  if (showSec("experiences") && exp.length) {
    const items = exp
      .map(
        (e) => `
          <div class="entry">
            <div class="entry-head">
              <div class="left">
                <div class="role-line">${esc(e.role)} <span class="sep">·</span> <span class="org">${esc(e.company)}</span></div>
              </div>
              <div class="dates">${esc(e.start)} – ${esc(e.end)}</div>
            </div>
            ${e.location ? `<div class="loc">${esc(e.location)}</div>` : ""}
            ${
              e.highlights && e.highlights.length
                ? `<ul class="highlights">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`
                : ""
            }
          </div>`,
      )
      .join("");
    mainParts.push(
      `<section><h2>${secTitle("experiences", "Experience")}</h2>${items}</section>`,
    );
  }

  // ---- Projects ----
  const projects = visible(data.projects);
  if (showSec("projects") && projects.length) {
    const items = projects
      .map(
        (p) => `
          <div class="project">
            <div class="name">${p.link ? `<a href="${esc(p.link)}">${esc(p.name)}</a>` : esc(p.name)}</div>
            ${p.description ? `<div class="desc">${esc(p.description)}</div>` : ""}
            ${
              p.tags && p.tags.length
                ? `<div class="tags chips">${p.tags.map(chip).join("")}</div>`
                : ""
            }
          </div>`,
      )
      .join("");
    mainParts.push(
      `<section><h2>${secTitle("projects", "Projects")}</h2>${items}</section>`,
    );
  }

  // ---- Values ----
  const vals = visible(data.values);
  if (showSec("values") && vals.length) {
    const items = vals
      .map(
        (v) => `
          <div class="value">
            <div class="name">${esc(v.value)}</div>
            ${v.description ? `<div class="desc">${esc(v.description)}</div>` : ""}
          </div>`,
      )
      .join("");
    sideParts.push(`<section><h2>${secTitle("values", "Personal Values")}</h2>
          <div class="values-grid">${items}</div></section>`);
  }

  // ---- Education (sidebar, between Values and Languages) ----
  const edu = visible(data.education);
  if (showSec("education") && edu.length) {
    const items = edu
      .map(
        (e) => `
          <div class="entry">
            <div class="entry-head">
              <div class="left">
                <div class="role-line">${esc(e.degree)}</div>
                <div class="org">${esc(e.school)}</div>
              </div>
            </div>
            ${e.details ? `<div class="desc edu-details">${esc(e.details)}</div>` : ""}
            <div class="loc">${e.location ? esc(e.location) : ""}${e.location ? ` <span class="sep">·</span> ` : ""}${esc(e.start)} – ${esc(e.end)}</div>
          </div>`,
      )
      .join("");
    sideParts.push(
      `<section><h2>${secTitle("education", "Education")}</h2>${items}</section>`,
    );
  }

  // ---- Languages ----
  const langs = visible(data.languages);
  if (showSec("languages") && langs.length) {
    const items = langs
      .map(
        (l) => `
          <span class="lang"><span class="name">${esc(l.name)}</span>
          ${l.level ? ` — <span class="level">${esc(l.level)}</span>` : ""}</span>`,
      )
      .join("");
    sideParts.push(`<section><h2>${secTitle("languages", "Languages")}</h2>
          <div class="lang-list">${items}</div></section>`);
  }

  if (data.final)
    mainParts.push(`<span class="final">${esc(data.final)}</span>`);

  document.getElementById("root").innerHTML = `<div class="page">
          ${header}
          <div class="cv-body">
            <aside class="sidebar">${sideParts.join("").replaceAll("\n\n", "<br/>")}</aside>
            <main class="main">${mainParts.join("").replaceAll("\n\n", "<br/>")}</main>
          </div>
        </div>`;
}

function showError(msg) {
  document.getElementById("root").innerHTML = `
        <div class="error">
          <h2 style="color:var(--accent)">Could not load data.json or data.example.json</h2>
          <p>${esc(msg)}</p>
          <p>Browsers block <code>fetch()</code> on <code>file://</code> for security.
          Run a tiny local server from this folder, then open the printed URL:</p>
          <p><code>python3 -m http.server 8000</code> &nbsp;→&nbsp; open <code>http://localhost:8000</code></p>
        </div>`;
}

// ---- Toolbar (screen only): pick a compo, download it as PDF ----
function renderToolbar(data, current) {
  const bar = document.getElementById("toolbar");
  const compos = data.compos || [];
  const base = { id: "", label: "Base", meta: data.meta };
  const buttons = [base, ...compos]
    .map((c) => {
      const color = c.meta?.accentColor || data.meta?.accentColor || "";
      const active = (current?.id || "") === c.id;
      return `<button type="button" class="compo${active ? " active" : ""}" data-compo="${esc(c.id)}"
        style="--dot:${esc(color)}" aria-pressed="${active}">${esc(c.label || c.id)}</button>`;
    })
    .join("");
  bar.innerHTML = `
    <div class="compos" role="group" aria-label="Compo">${compos.length ? buttons : ""}</div>
    <span class="overflow-warning" hidden>⚠ Content is cut off at the bottom: hide or shorten something</span>
    <button type="button" class="download" title="Opens the print dialog: choose “Save as PDF”">Download PDF</button>`;
}

function setup(data) {
  const compos = data.compos || [];
  const show = (id) => {
    const compo = compos.find((c) => c.id === id) || null;
    render(applyCompo(data, compo), compo?.highlight);
    document.title = compoFile(data, compo);
    renderToolbar(data, compo);
    const bottom = document
      .querySelector(".page")
      .getBoundingClientRect().bottom;
    const cut = [...document.querySelectorAll(".page section")].some(
      (s) => s.getBoundingClientRect().bottom > bottom + 1,
    );
    document.querySelector(".overflow-warning").hidden = !cut;
    const url = new URL(location.href);
    if (compo) url.searchParams.set("compo", compo.id);
    else url.searchParams.delete("compo");
    history.replaceState(null, "", url);
  };

  document.getElementById("toolbar").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.classList.contains("download")) window.print();
    else show(btn.dataset.compo);
  });

  show(new URLSearchParams(location.search).get("compo") || "");
}

// Your own data lives in data.json (git-ignored); fall back to the template.
const loadJson = (file) =>
  fetch(file, { cache: "no-store" }).then((res) => {
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    return res.json();
  });

loadJson("data.json")
  .then((data) => data ?? loadJson("data.example.json"))
  .then((data) => {
    if (!data) throw new Error("No data file found");
    setup(data);
  })
  .catch((err) => showError(err.message));
