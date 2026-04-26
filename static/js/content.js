/* =================================================================
   CONTENT LOADER — fetches static/data/*.json and renders sections.
   All portfolio copy lives in JSON; edit there, never here.
   ================================================================= */

const PIPELINE_SVG = `<div class="exp-pipeline">
  <svg id="pipeline-svg" viewBox="0 0 300 380">
    <text x="8" y="18" class="pip-meta">// xbot.pipeline.live</text>
    <rect x="80"  y="36"  width="140" height="38" class="pip-rect"/>
    <text x="150" y="59"  class="pip-text">IoT Source</text>
    <rect x="55"  y="114" width="88"  height="38" class="pip-rect"/>
    <text x="99"  y="137" class="pip-text">Airflow DAG</text>
    <rect x="157" y="114" width="88"  height="38" class="pip-rect"/>
    <text x="201" y="137" class="pip-text">ManEx v3</text>
    <rect x="25"  y="196" width="108" height="38" class="pip-rect"/>
    <text x="79"  y="219" class="pip-text">MySQL</text>
    <rect x="167" y="196" width="108" height="38" class="pip-rect"/>
    <text x="221" y="219" class="pip-text">GCS / Logs</text>
    <rect x="80"  y="278" width="140" height="38" class="pip-rect"/>
    <text x="150" y="301" class="pip-text">BI / Power BI</text>
    <line x1="150" y1="74"  x2="99"  y2="114" class="pip-line"/>
    <line x1="150" y1="74"  x2="201" y2="114" class="pip-line"/>
    <line x1="99"  y1="152" x2="79"  y2="196" class="pip-line"/>
    <line x1="99"  y1="152" x2="221" y2="196" class="pip-line"/>
    <line x1="201" y1="152" x2="79"  y2="196" class="pip-line"/>
    <line x1="79"  y1="234" x2="150" y2="278" class="pip-line"/>
    <line x1="221" y1="234" x2="150" y2="278" class="pip-line"/>
    <circle id="pkt1" cx="150" cy="36" r="3.5" fill="#c1440e" opacity="0"/>
    <circle id="pkt2" cx="201" cy="114" r="3.5" fill="#1a4f8a" opacity="0"/>
    <text x="8" y="348" class="pip-meta">records_total: <tspan id="rec-ct" style="fill:var(--accent);opacity:1">1,247,832</tspan></text>
    <text x="8" y="363" class="pip-meta">dag_status: <tspan style="fill:var(--accent);opacity:1">23/23 OK</tspan></text>
  </svg>
</div>`;

const ICONS = {
  email:    `<svg width="18" height="18" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="1" width="16" height="12" rx="1"/><path d="M1 4l8 5 8-5"/></svg>`,
  phone:    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 1.5h4l2 5-2.5 1.5a11 11 0 005 5L12.5 11l5 2v4c0 .8-4 3-9-2s-7.8-9-6-12.5z"/></svg>`,
  linkedin: `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="6" width="3.5" height="11"/><circle cx="2.75" cy="2.75" r="1.75"/><path d="M6.5 6h3v1.6s.8-1.6 3-1.6c2.4 0 4 1.4 4 4.4V17h-3.5v-6c0-1.3-.6-2-1.7-2s-1.8.8-1.8 2V17H6.5V6z"/></svg>`,
  github:   `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M9 0C4 0 0 4 0 9c0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.5v-1.7c-2.6.6-3.1-1.2-3.1-1.2-.4-1-.9-1.3-.9-1.3-.7-.5.1-.5.1-.5.8.1 1.3.8 1.3.8.7 1.2 1.9 1 2.3.8.1-.5.3-.9.5-1.1-1.9-.2-3.8-1-3.8-4.3 0-1 .3-1.8.8-2.5-.1-.2-.4-1.1.1-2.4 0 0 .7-.2 2.4.8.7-.2 1.4-.3 2.1-.3s1.4.1 2.1.3c1.7-1 2.4-.8 2.4-.8.4 1.2.2 2.1.1 2.4.5.6.8 1.4.8 2.5 0 3.4-2 4.2-3.9 4.4.3.3.6.8.6 1.6v2.3c0 .2.2.5.6.4C15.4 16.4 18 13 18 9 18 4 14 0 9 0z"/></svg>`
};

/* ── Fetchers ─────────────────────────────────────────────────── */
const base = 'static/data/';
const files = ['meta','hero','experience','education','skills','projects','achievements','feedback','contact','cover_letter'];

async function loadAll() {
  const results = await Promise.all(files.map(f => fetch(`${base}${f}.json`).then(r => r.json())));
  return Object.fromEntries(files.map((name, i) => [name, results[i]]));
}

/* ── Renderers ────────────────────────────────────────────────── */
function renderHero(d, meta) {
  const el = document.getElementById('hero');
  if (!el) return;
  el.querySelector('.hero-eyebrow').textContent = d.eyebrow;
  el.querySelector('.hero-name').innerHTML = `${meta.name.first}<em>${meta.name.last}</em>`;
  el.querySelector('.hero-title').innerHTML = d.titleLines.join('<br/>');
  el.querySelector('.hero-desc').innerHTML = d.description;
}

function renderExperience(entries) {
  const container = document.querySelector('.exp-container');
  if (!container) return;
  container.innerHTML = entries.map(e => {
    const kpis = e.kpis ? `<div class="exp-kpis">${
      e.kpis.map(k => `<div class="kpi"><div class="kpi-val">${k.value}</div><div class="kpi-lab">${k.label}</div></div>`).join('')
    }</div>` : '';
    const bullets = `<ul class="exp-pts">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
    return `
    <div class="exp${e.pipeline ? ' exp-with-pipeline' : ''} reveal">
      <div class="exp-main">
        <div class="exp-meta-line">
          <span>${e.period}</span>
          <span class="exp-meta-sep">·</span>
          <span>${e.company}</span>
          <span class="exp-meta-sep">·</span>
          <span>${e.location}</span>
          <span class="exp-meta-sep">·</span>
          <span class="exp-tag-inline">${e.role}</span>
        </div>
        <h3>${e.title}</h3>
        ${kpis}${bullets}
      </div>
      ${e.pipeline ? PIPELINE_SVG : ''}
    </div>`;
  }).join('');
}

function renderEducation(entries) {
  const list = document.querySelector('.edu-list');
  if (!list) return;
  list.innerHTML = entries.map(e => `
    <div class="edu-item">
      <div>
        <div class="edu-date">${e.period}</div>
        <div class="edu-inst">${e.institution}</div>
        <div class="edu-loc">${e.location}</div>
        <div class="edu-tag">${e.tag}</div>
      </div>
      <div>
        <div class="edu-degree">${e.degree}</div>
        <div class="edu-detail">${e.detail}</div>
      </div>
    </div>`).join('');
}

function renderSkills(d) {
  const outer = document.querySelector('.skills-outer');
  if (!outer) return;
  outer.querySelector('.skills-intro').innerHTML = d.intro;
  outer.querySelector('.skills-cols').innerHTML = d.categories.map(cat => `
    <div class="sk-row">
      <div class="sk-cat">${cat.name}</div>
      <div class="sk-tags">
        ${cat.tags.map(t => `<span class="sk-tag${cat.wip ? ' wip' : ''}">${t}</span>`).join('')}
      </div>
    </div>`).join('');
}

function renderProjects(entries) {
  const grid = document.querySelector('.proj-grid');
  if (!grid) return;
  grid.innerHTML = entries.map(p => `
    <div class="proj-card" data-num="${p.num}">
      <div class="proj-status"><span class="proj-dot${p.live ? '' : ' wip'}"></span>${p.status}</div>
      <div class="proj-title">${p.title}</div>
      <p class="proj-desc">${p.description}</p>
      <div class="proj-stack">${p.stack.map(s => `<span class="proj-chip">${s}</span>`).join('')}</div>
    </div>`).join('');
}

function renderAchievements(entries) {
  const grid = document.querySelector('.ach-grid');
  if (!grid) return;
  grid.innerHTML = entries.map(a => `
    <div class="ach-card">
      <div class="ach-head">
        <div class="ach-logo">${a.logo}</div>
        <div class="ach-meta">
          <div class="ach-platform">${a.platform}</div>
          <div class="ach-badge">${a.badge}</div>
        </div>
      </div>
      <div class="ach-title">${a.title}</div>
      <p class="ach-desc">${a.description}</p>
      <a href="${a.link.url}" target="_blank" rel="noopener" class="ach-link">${a.link.label}</a>
    </div>`).join('');
}

function renderFeedback(d) {
  const outer = document.querySelector('.fb-outer');
  if (!outer) return;
  outer.querySelector('.fb-intro').innerHTML = d.intro;
  outer.querySelector('.fb-count').textContent = d.items.length;
  outer.querySelector('.fb-cards-grid').innerHTML = d.items.map(f => `
    <article class="fb-card">
      <div class="fb-card-top">
        <div class="fb-avatar">${f.initials}</div>
        <div class="fb-who">
          <div class="fb-name">${f.name} <span class="fb-conn">· ${f.connection}</span></div>
          <div class="fb-role">${f.role}</div>
        </div>
      </div>
      <div class="fb-card-date">${f.date}</div>
      ${f.paragraphs.map(p => `<p class="fb-body">${p}</p>`).join('')}
    </article>`).join('');
}

function renderContact(d) {
  const section = document.getElementById('contact');
  if (!section) return;
  section.querySelector('.contact-big').innerHTML = `${d.heading}<strong>${d.cta}</strong>`;
  section.querySelector('.contact-note').innerHTML =
    d.note.replace(/\n\n/g, '<br/><br/>') +
    ` <span class="footer-easter" onclick="hint()" title="try something">There's more to this page than meets the eye.</span>`;
  section.querySelector('.contact-links').innerHTML = d.links.map(l => `
    <a href="${l.href}" class="c-link"${l.external ? ' target="_blank" rel="noopener"' : ''}>
      <div class="c-link-icon">${ICONS[l.icon]}</div>
      <div class="c-link-l">
        <span class="c-link-type">${l.type}</span>
        <span class="c-link-label">${l.label}</span>
      </div>
      <span class="c-link-arrow">→</span>
    </a>`).join('');
}

/* ── Boot ─────────────────────────────────────────────────────── */
(async () => {
  try {
    const data = await loadAll();

    /* Expose for other scripts (cover letter, etc.) */
    window.__metaData       = data.meta;
    window.__coverLetterData = data.cover_letter;

    renderHero(data.hero, data.meta);
    renderExperience(data.experience);
    renderEducation(data.education);
    renderSkills(data.skills);
    renderProjects(data.projects);
    renderAchievements(data.achievements);
    renderFeedback(data.feedback);
    renderContact(data.contact);

    /* Re-initialise animations for dynamically rendered elements */
    if (typeof window.__reinitAnimations === 'function') {
      window.__reinitAnimations();
    }

    /* Re-observe .reveal elements with the main scroll observer */
    if (window.__revealObs) {
      document.querySelectorAll('.reveal').forEach(el => window.__revealObs.observe(el));
    }
  } catch (err) {
    console.error('[content] failed to load:', err);
  }
})();
