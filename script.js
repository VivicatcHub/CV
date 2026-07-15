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

function render(data) {
  const m = data.meta || {};
  const r = document.documentElement.style;
  if (m.accentColor) r.setProperty("--accent", m.accentColor);
  if (m.accentColorSoft) r.setProperty("--accent-soft", m.accentColorSoft);
  if (m.backgroundColor) r.setProperty("--bg", m.backgroundColor);

  const b = data.basics || {};
  const sec = data.sections || {};
  document.documentElement.lang = m.language || "en";
  document.title = `${b.name || "CV"} — CV`;

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
      ? `<img class="photo" src="${esc(b.photo)}" alt="${esc(b.name)}" />`
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
            <span class="chips">${(g.items || []).map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</span>
          </div>`,
      )
      .join("");
    sideParts.push(
      `<section><h2>${secTitle("skills", "Skills")}</h2>${groups}</section>`,
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
                ? `<div class="tags chips">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`
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
            ${e.details ? `<div class="desc" style="color:var(--ink-soft)">${esc(e.details)}</div>` : ""}
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
          <h2 style="color:var(--accent)">Could not load data.json</h2>
          <p>${esc(msg)}</p>
          <p>Browsers block <code>fetch()</code> on <code>file://</code> for security.
          Run a tiny local server from this folder, then open the printed URL:</p>
          <p><code>python3 -m http.server 8000</code> &nbsp;→&nbsp; open <code>http://localhost:8000</code></p>
        </div>`;
}

fetch("data.json", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(render)
  .catch((err) => showError(err.message));

document
  .getElementById("download")
  .addEventListener("click", () => window.print());
