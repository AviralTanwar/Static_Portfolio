/* ===== THEME ===== */
const body = document.getElementById('body');
let dark = false;

function toggleTheme(on) {
  dark = on;
  body.classList.toggle('dark', dark);
  document.getElementById('lbl-light').classList.toggle('active', !dark);
  document.getElementById('lbl-dark').classList.toggle('active', dark);
}

/* ===== SNIPER CURSOR + GLOBAL MOUSE ===== */
const xhair = document.getElementById('xhair');
const mouse = { x: -999, y: -999 };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  xhair.style.left = e.clientX + 'px';
  xhair.style.top  = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
document.querySelectorAll('a,button,.sk-tag,.proj-card,.c-link,.exp-pts li,.switch,.footer-easter,.fb-card,.ach-card,.nav-id,.bean-seed,.proj-dot').forEach(el => {
  el.addEventListener('mouseenter', () => xhair.classList.add('big'));
  el.addEventListener('mouseleave', () => xhair.classList.remove('big'));
});

/* ===== SCROLL PROGRESS BAR ===== */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (total > 0 ? window.scrollY / total * 100 : 0) + '%';
}, { passive: true });

/* ===== ACTIVE NAV HIGHLIGHT ===== */
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
function setActiveNav(id) {
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
}
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); });
}, { threshold: 0, rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

/* ===== FULL-PAGE BACKGROUND CANVAS ===== */
const bgCanvas = document.getElementById('bg-canvas');
const ctx = bgCanvas.getContext('2d');
let W, H, lines = [], t = 0;

let introStart = performance.now();
const INTRO_DUR = 4200;

function buildWordMask(word, width, height) {
  const off = document.createElement('canvas');
  off.width = width; off.height = height;
  const c = off.getContext('2d');
  c.fillStyle = '#000';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const fontSize = Math.min(width, height) * 0.7;
  c.font = `900 italic ${fontSize}px Fraunces, "Times New Roman", Georgia, serif`;
  c.fillText(word, width / 2, height / 2);
  const data = c.getImageData(0, 0, width, height).data;
  return (px, py) => {
    const x = px | 0, y = py | 0;
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    return data[(y * width + x) * 4 + 3] > 80;
  };
}

function initCanvas() {
  W = bgCanvas.width  = window.innerWidth;
  H = bgCanvas.height = window.innerHeight;
  lines = [];
  const step = 30;
  const cols = Math.ceil(W / step);
  const rows = Math.ceil(H / step);
  const mask = buildWordMask('AT', W, H);
  introStart = performance.now();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const jx = (Math.random() - .5) * 8;
      const jy = (Math.random() - .5) * 8;
      const bx = i * step + step / 2 + jx;
      const by = j * step + step / 2 + jy;
      const onGlyph = mask(bx, by);
      const cx = W / 2, cy = H / 2;
      const patternAngle = Math.atan2(by - cy, bx - cx) + Math.PI / 2;
      lines.push({
        x: bx, y: by,
        baseX: bx, baseY: by,
        vx: 0, vy: 0,
        angle: patternAngle + (Math.random() - .5) * 0.3,
        baseAngle: patternAngle,
        spin: 0,
        speed: .22 + Math.random() * .3,
        len:   onGlyph ? 16 + Math.random() * 4 : 9 + Math.random() * 6,
        alpha: onGlyph ? .28 : .2 + Math.random() * .12,
        exploded: 0,
        onGlyph: onGlyph,
        revealDelay: onGlyph ? (bx / W) * 1400 : 600 + Math.random() * 1400
      });
    }
  }
}

initCanvas();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { initCanvas(); });
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initCanvas, 150);
});

function renderCanvas() {
  ctx.clearRect(0, 0, W, H);
  t += .007 * (window.__bgSpeed !== undefined ? window.__bgSpeed : 1);
  const fl = dark ? '230,220,200' : '14,14,14';
  const fa = dark ? '217,79,30'   : '184,58,12';
  const now = performance.now();
  const intro = Math.min(1, Math.max(0, (now - introStart) / INTRO_DUR));

  lines.forEach(ln => {
    const localT   = Math.max(0, (now - introStart - ln.revealDelay) / 900);
    const revealed = Math.min(1, localT);
    const dissolve = Math.max(0, (intro - 0.85) / 0.15);

    if (ln.exploded > 0.001) {
      ln.x += ln.vx;
      ln.y += ln.vy;
      ln.vx *= 0.955;
      ln.vy *= 0.955;
      ln.angle += ln.spin;
      ln.spin *= 0.96;
      ln.x += (ln.baseX - ln.x) * 0.012 * (1 - ln.exploded);
      ln.y += (ln.baseY - ln.y) * 0.012 * (1 - ln.exploded);
      ln.exploded *= 0.975;
      if (ln.exploded < 0.02) {
        ln.exploded = 0;
        ln.x += (ln.baseX - ln.x) * 0.08;
        ln.y += (ln.baseY - ln.y) * 0.08;
      }
    } else {
      ln.x += (ln.baseX - ln.x) * 0.1;
      ln.y += (ln.baseY - ln.y) * 0.1;
    }

    const dx   = mouse.x - ln.x;
    const dy   = mouse.y - ln.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const inf  = Math.max(0, 1 - dist / 160);

    if (ln.exploded < 0.05) {
      let target;
      if (dist < 160) {
        target = Math.atan2(dy, dx) + Math.PI / 2;
      } else if (intro < 1 && ln.onGlyph) {
        target = ln.baseAngle;
      } else {
        target = ln.angle + Math.sin(t * ln.speed + ln.baseX * .016 + ln.baseY * .016) * .65;
      }
      ln.angle += (target - ln.angle) * (ln.onGlyph && intro < 1 ? .12 : .05);
    }

    const glyphBoost = ln.onGlyph ? (1 - dissolve) * 0.18 : 0;
    const a     = (ln.alpha + glyphBoost + inf * .1 + ln.exploded * .25) * revealed;
    const isAcc = inf > .4 || ln.exploded > 0.15 || (ln.onGlyph && intro < 0.95);

    ctx.beginPath();
    ctx.moveTo(ln.x - Math.cos(ln.angle) * ln.len * .5, ln.y - Math.sin(ln.angle) * ln.len * .5);
    ctx.lineTo(ln.x + Math.cos(ln.angle) * ln.len * .5, ln.y + Math.sin(ln.angle) * ln.len * .5);
    ctx.strokeStyle = isAcc
      ? `rgba(${fa},${Math.min(a * 1.4, .35)})`
      : `rgba(${fl},${a})`;
    ctx.lineWidth = isAcc ? 1.1 : .6;
    ctx.stroke();
  });

  requestAnimationFrame(renderCanvas);
}
renderCanvas();

/* ===== CLICK EXPLOSION — blow the lines outward ===== */
function explodeLines(cx, cy) {
  const radius = 280;
  lines.forEach(ln => {
    const dx = ln.baseX - cx;
    const dy = ln.baseY - cy;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < radius) {
      const falloff = 1 - d / radius;
      const ang = Math.atan2(dy, dx);
      const force = 14 + falloff * 22 + Math.random() * 4;
      ln.vx += Math.cos(ang) * force;
      ln.vy += Math.sin(ang) * force;
      ln.spin = (Math.random() - 0.5) * 0.6 * falloff;
      ln.exploded = Math.max(ln.exploded, 0.55 + falloff * 0.45);
    }
  });

  // shockwave ring
  const ring = document.createElement('div');
  ring.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:4px;height:4px;border:1px solid var(--accent);border-radius:50%;transform:translate(-50%,-50%);z-index:9996;pointer-events:none;will-change:transform,opacity;`;
  document.body.appendChild(ring);
  let r = 4, op = 0.7;
  const grow = () => {
    r += 14; op -= 0.035;
    ring.style.width = r + 'px'; ring.style.height = r + 'px';
    ring.style.opacity = op;
    ring.style.borderWidth = Math.max(0.3, 1.5 - r / 240) + 'px';
    if (op > 0) requestAnimationFrame(grow); else ring.remove();
  };
  requestAnimationFrame(grow);

  // spark particles
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    const ang = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
    p.className = 'burst-p';
    p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:1.5px;height:${6 + Math.random() * 6}px;background:var(--accent);z-index:9996;pointer-events:none;transform:translate(-50%,-50%) rotate(${ang}rad);opacity:.8;`;
    document.body.appendChild(p);
    let px = cx, py = cy, vx = Math.cos(ang) * (6 + Math.random() * 8), vy = Math.sin(ang) * (6 + Math.random() * 8), o = 0.8;
    const fly = () => {
      vx *= 0.94; vy *= 0.94; vy += 0.15;
      px += vx; py += vy; o -= 0.035;
      p.style.left = px + 'px'; p.style.top = py + 'px'; p.style.opacity = o;
      if (o > 0) requestAnimationFrame(fly); else p.remove();
    };
    requestAnimationFrame(fly);
  }
}

document.addEventListener('click', e => {
  explodeLines(e.clientX, e.clientY);
});

/* ===== PIPELINE PACKET ANIMATION ===== */
let pktT = 0;
function animPipeline() {
  pktT = (pktT + .007) % 1;
  const pk1 = document.getElementById('pkt1');
  const pk2 = document.getElementById('pkt2');
  if (!pk1 || !pk2) return;

  const p1 = pktT;
  if (p1 < .35) {
    const prog = p1 / .35;
    pk1.setAttribute('cx', 150 + (99  - 150) * prog);
    pk1.setAttribute('cy',  36 + (114 -  36) * prog);
    pk1.setAttribute('opacity', prog < .12 ? prog / .12 : prog > .88 ? (1 - prog) / .12 : 1);
  } else if (p1 < .7) {
    const prog = (p1 - .35) / .35;
    pk1.setAttribute('cx',  99 + (79  -  99) * prog);
    pk1.setAttribute('cy', 152 + (196 - 152) * prog);
    pk1.setAttribute('opacity', prog < .1 ? prog / .1 : prog > .9 ? (1 - prog) / .1 : .9);
  } else {
    pk1.setAttribute('opacity', 0);
  }

  const p2 = (pktT + .5) % 1;
  if (p2 < .35) {
    const prog = p2 / .35;
    pk2.setAttribute('cx', 150 + (201 - 150) * prog);
    pk2.setAttribute('cy',  74 + (114 -  74) * prog);
    pk2.setAttribute('opacity', prog < .12 ? prog / .12 : prog > .88 ? (1 - prog) / .12 : .8);
  } else if (p2 < .7) {
    const prog = (p2 - .35) / .35;
    pk2.setAttribute('cx', 201 + (221 - 201) * prog);
    pk2.setAttribute('cy', 152 + (196 - 152) * prog);
    pk2.setAttribute('opacity', prog < .1 ? prog / .1 : prog > .9 ? (1 - prog) / .1 : .7);
  } else {
    pk2.setAttribute('opacity', 0);
  }

  requestAnimationFrame(animPipeline);
}
animPipeline();

/* ===== LIVE RECORD COUNTER ===== */
let rec = 1247832;
setInterval(() => {
  rec += Math.floor(Math.random() * 9 + 1);
  const el = document.getElementById('rec-ct');
  if (el) el.textContent = rec.toLocaleString('en-IN');
}, 1600);

/* ===== FOOTER CLOCK ===== */
function updateClock() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const h = ist.getHours().toString().padStart(2, '0');
  const m = ist.getMinutes().toString().padStart(2, '0');
  const s = ist.getSeconds().toString().padStart(2, '0');
  const el = document.getElementById('footer-clock');
  if (el) el.textContent = `IST ${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ===== KONAMI CODE ===== */
const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
  if (e.key === konamiSeq[ki]) {
    ki++;
    if (ki === konamiSeq.length) {
      document.getElementById('konami').style.display = 'flex';
      ki = 0;
    }
  } else {
    ki = 0;
  }
  if (e.key === 'Escape') document.getElementById('konami').style.display = 'none';
});

/* ===== HINT TOAST ===== */
function hint() {
  const h = document.createElement('div');
  h.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:2px;padding:10px 22px;z-index:9998;pointer-events:none;text-transform:uppercase;transition:opacity .3s';
  h.textContent = '↑↑↓↓←→←→BA';
  document.body.appendChild(h);
  setTimeout(() => {
    h.style.opacity = '0';
    setTimeout(() => h.remove(), 300);
  }, 2200);
}

/* ===== LOGO CLICK EASTER EGG ===== */
let lc = 0;
function logoClick() {
  lc++;
  if (lc === 5) {
    const at = document.querySelector('.logo-at');
    if (at) {
      const orig = at.textContent;
      at.textContent = ':wq!';
      at.style.color = 'var(--accent)';
      setTimeout(() => { if (at) { at.textContent = orig; at.style.color = ''; } }, 1600);
    }
    lc = 0;
  }
}

/* ===== SCROLL REVEAL ===== */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ===== RESUME ROLE PICKER MODAL ===== */
function openResumeModal(e) {
  if (e) e.preventDefault();
  document.getElementById('resume-modal').classList.add('open');
}

function closeResumeModal() {
  document.getElementById('resume-modal').classList.remove('open');
}

function pickRole(role) {
  closeResumeModal();
  const labels = { po: 'Platform Owner', sa: 'Solution Architect', de: 'Data Engineer' };
  const label = labels[role] || 'Data Engineer';

  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translate(-50%,20px);background:var(--ink);color:var(--bg);font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;padding:12px 24px;z-index:9998;text-transform:uppercase;border-left:2px solid var(--accent);opacity:0;transition:opacity .25s, transform .25s;pointer-events:none;`;
  toast.textContent = `↓ preparing ${label.toLowerCase()}.pdf`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translate(-50%,0)'; });

  const win = window.open('', '_blank');
  if (!win) {
    toast.textContent = '⚠ allow popups to download';
    setTimeout(() => toast.remove(), 2400);
    return;
  }
  win.document.write(resumeHTML(role));
  win.document.close();
  setTimeout(() => { try { win.focus(); win.print(); } catch(_) {} }, 400);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%,20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

document.querySelectorAll('.rm-opt').forEach(btn => {
  btn.addEventListener('click', () => pickRole(btn.dataset.role));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeResumeModal();
});

function resumeHTML(role) {
  const eyebrows = {
    po: 'Platform Owner · Solution Architect · Data Engineer',
    sa: 'Solution Architect · Platform Owner · Data Engineer',
    de: 'Data Engineer · Platform Owner · Solution Architect'
  };
  const eyebrow = eyebrows[role] || eyebrows.de;

  const expBullets = {
    po: `
  <li>Owned end-to-end XBot lifecycle — architecture, deployment, scaling, observability — on GCP VMs with Apache Airflow</li>
  <li>Designed ManEx v3: low-code automation engine with 15+ reusable components and JSON-driven workflow triggers</li>
  <li>CI/CD via Jenkins + GitHub for controlled DAG promotion QA → production with zero-downtime deploys</li>
  <li>Incremental ETL + historical snapshots across 12+ MySQL tables — 100% reproducibility, time-travel analytics</li>
  <li>100K+ logs/month centralized on GCS with automated retention; 5,000+ notification alerts/month</li>
  <li>Processed 1M+ IoT records/month (OEE, energy, SPC, alarms) into real-time KPIs for 5+ factory plant managers</li>
  <li>Architecting Kafka streaming pipelines for real-time IoT telemetry ingestion [in progress]</li>`,
    sa: `
  <li>Architected XBot end-to-end on GCP: VM topology, network, storage, Airflow scheduler tuning, RBAC model</li>
  <li>Designed ManEx v3 component model: 15+ reusable building blocks, JSON DSL interface for non-engineers</li>
  <li>Unified DFOS data model across 12+ MySQL tables — single queryable layer, 35% SLA improvement</li>
  <li>CI/CD pipeline: Jenkins + GitHub, multi-stage DAG promotion, zero-downtime production deploys</li>
  <li>Architecting Kafka streaming topology for real-time IoT telemetry ingestion [in progress]</li>
  <li>Owned entire observability stack: 100K+ logs/month on GCS, 5,000+ alert dispatches/month</li>
  <li>Delivered 7+ production deployments with zero unplanned downtime since May 2024</li>`,
    de: `
  <li>Incremental ETL + historical snapshots across 12+ MySQL tables — 100% reproducibility, time-travel analytics</li>
  <li>Processed 1M+ IoT records/month (OEE, energy, SPC, alarms) into real-time KPIs for 5+ factory plant managers</li>
  <li>Architecting Kafka streaming pipelines for real-time IoT telemetry ingestion [in progress]</li>
  <li>Owned end-to-end XBot lifecycle — architecture, deployment, scaling, observability — on GCP VMs with Apache Airflow</li>
  <li>Designed ManEx v3: low-code automation engine with 15+ reusable components and JSON-driven workflow triggers</li>
  <li>CI/CD via Jenkins + GitHub for controlled DAG promotion QA → production with zero-downtime deploys</li>
  <li>100K+ logs/month centralized on GCS with automated retention; 5,000+ notification alerts/month</li>`
  };
  const bullets = expBullets[role] || expBullets.de;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Aviral Tanwar — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Fraunces:ital,wght@0,700;1,300;1,700&display=swap" rel="stylesheet"/>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Mono', monospace; color: #1a1714; font-size: 10.5pt; line-height: 1.55; background: #fff; }
  h1 { font-family: 'Fraunces', serif; font-weight: 700; font-size: 32pt; letter-spacing: -1.5px; line-height: 1; }
  h1 em { font-style: italic; color: #b83a0c; }
  .eyebrow { font-size: 8pt; letter-spacing: 3px; text-transform: uppercase; color: #857f74; margin-bottom: 8pt; }
  .contact { font-size: 9pt; color: #4a4540; margin-top: 10pt; display: flex; gap: 16pt; flex-wrap: wrap; }
  .contact span strong { color: #b83a0c; margin-right: 4pt; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; font-size: 7.5pt; }
  hr { border: none; border-top: 1px solid #c4bfb4; margin: 16pt 0 14pt; }
  h2 { font-size: 9pt; letter-spacing: 3px; text-transform: uppercase; color: #b83a0c; margin-bottom: 10pt; font-weight: 500; }
  h3 { font-family: 'Fraunces', serif; font-style: italic; font-weight: 300; font-size: 14pt; color: #1a1714; margin-bottom: 2pt; }
  .role-meta { font-size: 8pt; letter-spacing: 1.5px; text-transform: uppercase; color: #857f74; margin-bottom: 8pt; }
  .role-meta b { color: #b83a0c; font-weight: 500; }
  ul { list-style: none; }
  ul li { font-size: 10pt; line-height: 1.7; color: #4a4540; padding: 2pt 0 2pt 14pt; position: relative; }
  ul li::before { content: '//'; position: absolute; left: 0; color: #b83a0c; font-size: 9pt; }
  .skills-grid { display: grid; grid-template-columns: 110pt 1fr; gap: 6pt 14pt; }
  .skills-grid dt { font-size: 8pt; letter-spacing: 1.5px; text-transform: uppercase; color: #857f74; padding-top: 2pt; }
  .skills-grid dd { font-size: 10pt; color: #1a1714; }
  .kpis { display: flex; gap: 14pt; margin: 10pt 0; }
  .kpi { flex: 1; padding: 8pt 10pt; background: #f0ece2; }
  .kpi .v { font-family: 'Fraunces', serif; font-weight: 700; font-size: 16pt; color: #b83a0c; line-height: 1; }
  .kpi .l { font-size: 7.5pt; letter-spacing: 1.5px; text-transform: uppercase; color: #857f74; margin-top: 3pt; }
  .footer-note { font-size: 8pt; color: #857f74; margin-top: 18pt; font-style: italic; font-family: 'Fraunces', serif; }
</style></head><body>
<div class="eyebrow">— ${eyebrow} —</div>
<h1>Aviral <em>Tanwar.</em></h1>
<div class="contact">
  <span><strong>Email</strong> aviraltanwar@gmail.com</span>
  <span><strong>Phone</strong> +91 99718 86273</span>
  <span><strong>Location</strong> Noida, India</span>
  <span><strong>LinkedIn</strong> linkedin.com/in/aviraltanwar</span>
  <span><strong>GitHub</strong> github.com/aviraltanwar</span>
</div>
<hr/>
<h2>Summary</h2>
<p style="color:#4a4540;font-size:10pt;line-height:1.7;">Data engineer focused on workflow orchestration and platform ownership. I build the infrastructure that moves data at scale — <b style="color:#1a1714;font-weight:500;">1M+ records/month</b>, 7+ production deployments, zero tolerance for manual toil. Currently architecting real-time streaming pipelines at NRV DesignX.</p>
<hr/>
<h2>Experience</h2>
<h3>Platform Owner — XBot Orchestration System</h3>
<div class="role-meta"><b>NRV DesignX Pvt. Ltd.</b> · Noida · May 2024 – Present · Associate Manager</div>
<div class="kpis">
  <div class="kpi"><div class="v">1M+</div><div class="l">records/mo</div></div>
  <div class="kpi"><div class="v">7+</div><div class="l">deployments</div></div>
  <div class="kpi"><div class="v">40%</div><div class="l">effort saved</div></div>
  <div class="kpi"><div class="v">70%</div><div class="l">less follow-ups</div></div>
</div>
<ul>${bullets}
</ul>
<hr/>
<h2>Selected Projects</h2>
<ul>
  <li><b style="color:#1a1714;">XBot</b> — Enterprise workflow orchestration on Apache Airflow. Built from zero; 7+ production deployments.</li>
  <li><b style="color:#1a1714;">ManEx v3</b> — Low-code automation engine. JSON-driven ETL for non-engineers. ~40% faster delivery.</li>
  <li><b style="color:#1a1714;">DFOS Data Platform</b> — Unified data model across 5+ factories. 35% SLA improvement.</li>
  <li><b style="color:#1a1714;">Kafka Streaming Pipeline</b> — Real-time IoT telemetry ingestion [in progress].</li>
</ul>
<hr/>
<h2>Tech Stack</h2>
<dl class="skills-grid">
  <dt>Orchestration</dt><dd>Apache Airflow · DAG Design · Scheduler Tuning · RBAC</dd>
  <dt>Languages</dt><dd>Python · SQL / MySQL · Bash</dd>
  <dt>Cloud / Infra</dt><dd>GCP Compute · Cloud Storage · Docker · Linux · Git</dd>
  <dt>Data Eng</dt><dd>ETL Pipelines · Incremental ETL · Data Modeling · Power BI</dd>
  <dt>Automation</dt><dd>Jenkins · GitHub Actions · REST APIs · JSON DSL</dd>
  <dt>In Progress</dt><dd>Apache Kafka · Databricks · BigQuery</dd>
</dl>
<hr/>
<h2>Education</h2>
<h3>B.Tech, Computer Science &amp; Engineering</h3>
<div class="role-meta"><b>Jaypee Institute of Information Technology (JIIT)</b> · 2020 – 2024</div>
<hr/>
<h2>Achievements</h2>
<ul>
  <li>HackerRank — Python &amp; Problem Solving verified certification</li>
  <li>HackerRank — 100+ problems solved across DS, algorithms, SQL</li>
</ul>
<div class="footer-note">// built with precision — no templates</div>
</body></html>`;
}

/* ===== PROJ-DOT CLICK EXPLOSION ===== */
function dotExplode(cx, cy, isWip) {
  const colors = isWip
    ? ['#c4a030','#d4b040','#e4c050','#a08020']
    : ['#d94f1e','#c1440e','#e06030','#b83a0c'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    const sz = 4 + Math.random() * 5;
    p.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;background:${colors[i % colors.length]};left:${cx}px;top:${cy}px;z-index:9997;pointer-events:none;`;
    document.body.appendChild(p);
    const angle = (i / 28) * Math.PI * 2 + Math.random() * .4;
    const spd   = 4 + Math.random() * 10;
    let vx = Math.cos(angle) * spd, vy = Math.sin(angle) * spd;
    let x = cx, y = cy, op = 1, s = sz;
    const step = () => {
      vy += .3; vx *= .96;
      x += vx; y += vy; op -= .022; s *= .97;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.opacity = op; p.style.width = s + 'px'; p.style.height = s + 'px';
      if (op > 0) requestAnimationFrame(step); else p.remove();
    };
    setTimeout(() => requestAnimationFrame(step), i * 12);
  }
}

document.querySelectorAll('.proj-dot').forEach(dot => {
  dot.addEventListener('click', e => {
    e.stopPropagation();
    const r = dot.getBoundingClientRect();
    dotExplode(r.left + r.width / 2, r.top + r.height / 2, dot.classList.contains('wip'));
  });
});

/* ===== BEAN EASTER EGG ===== */
let beanActive = false;
let beanInterval = null;

function spawnBurstBean(cx, cy) {
  const b = document.createElement('div');
  b.className = 'bean-p';
  b.textContent = '🫘';
  b.style.cssText = `position:fixed;font-size:${12 + Math.random() * 12}px;left:${cx}px;top:${cy}px;z-index:9997;pointer-events:none;`;
  document.body.appendChild(b);
  const angle = Math.random() * Math.PI * 2;
  const spd   = 5 + Math.random() * 10;
  let vx = Math.cos(angle) * spd, vy = Math.sin(angle) * spd - 4;
  let x = cx, y = cy, op = 1;
  const step = () => {
    vy += .35; vx *= .97; x += vx; y += vy; op -= .018;
    b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.opacity = op;
    if (op > 0 && y < window.innerHeight + 40) requestAnimationFrame(step); else b.remove();
  };
  requestAnimationFrame(step);
}

function spawnRainBean() {
  const b = document.createElement('div');
  b.className = 'bean-p';
  b.textContent = '🫘';
  const sx = Math.random() * window.innerWidth;
  b.style.cssText = `position:fixed;font-size:${10 + Math.random() * 14}px;left:${sx}px;top:-20px;z-index:9997;pointer-events:none;transform:rotate(${Math.random()*360}deg);`;
  document.body.appendChild(b);
  const vx = (Math.random() - .5) * 2;
  const spd = 3 + Math.random() * 5;
  let x = sx, y = -20, rot = Math.random() * 360;
  const fall = () => {
    if (!b.isConnected) return;
    y += spd; x += vx; rot += 3;
    b.style.top = y + 'px'; b.style.left = x + 'px';
    b.style.transform = `rotate(${rot}deg)`;
    if (y < window.innerHeight + 30) requestAnimationFrame(fall); else b.remove();
  };
  requestAnimationFrame(fall);
}

function stopBeans() {
  beanActive = false;
  clearInterval(beanInterval);
  beanInterval = null;
  document.querySelectorAll('.bean-p').forEach(b => b.remove());
}

function beanBurst(e) {
  e.stopPropagation();
  const seed = document.getElementById('bean-seed');
  if (beanActive) { stopBeans(); return; }
  beanActive = true;
  seed.textContent = '💥';
  setTimeout(() => { if (seed) seed.textContent = '🫘'; }, 500);
  for (let i = 0; i < 20; i++) spawnBurstBean(e.clientX, e.clientY);
  beanInterval = setInterval(() => {
    if (!beanActive) return;
    for (let j = 0; j < 3; j++) spawnRainBean();
  }, 55);
  window.addEventListener('scroll', stopBeans, { once: true });
}

/* ===== BEAN CORNER ===== */
const beanCorner = document.getElementById('bean-corner');
let beanHeroObs = null;

function spawnWaterfallBean() {
  const b = document.createElement('div');
  b.className = 'bean-p';
  b.textContent = '🫘';
  const bRect = beanCorner.getBoundingClientRect();
  const cx = bRect.left + bRect.width / 2;
  const x = cx + (Math.random() - .5) * 10;
  const sz = 7 + Math.random() * 5;
  b.style.cssText = `position:fixed;font-size:${sz}px;left:${x}px;top:${bRect.bottom}px;z-index:9997;pointer-events:none;`;
  document.body.appendChild(b);
  const vx = (Math.random() - .5) * 1.2;
  const spd = 11 + Math.random() * 7;
  let px = x, py = bRect.bottom, rot = Math.random() * 360;
  const fall = () => {
    if (!b.isConnected) return;
    py += spd; px += vx; rot += 5;
    b.style.top = py + 'px'; b.style.left = px + 'px';
    b.style.transform = `rotate(${rot}deg)`;
    if (py < window.innerHeight + 30) requestAnimationFrame(fall); else b.remove();
  };
  requestAnimationFrame(fall);
}

beanCorner.addEventListener('click', e => {
  e.stopPropagation();
  if (beanActive) {
    stopBeans();
    beanCorner.classList.remove('raining');
    if (beanHeroObs) { beanHeroObs.disconnect(); beanHeroObs = null; }
    return;
  }
  beanActive = true;
  beanCorner.classList.add('raining');
  beanInterval = setInterval(() => {
    if (!beanActive) return;
    for (let j = 0; j < 8; j++) spawnWaterfallBean();
  }, 35);
  beanHeroObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) {
      stopBeans();
      beanCorner.classList.remove('raining');
      beanHeroObs.disconnect();
      beanHeroObs = null;
    }
  });
  beanHeroObs.observe(document.getElementById('hero'));
});

/* ===== DEVELOPER EXCUSE ===== */
async function loadExcuse() {
  const el = document.getElementById('nav-quote');
  if (!el) return;
  try {
    const r = await fetch('https://excuser-three.vercel.app/v1/excuse/developer/');
    const d = await r.json();
    const excuse = d[0]?.excuse;
    if (excuse) el.textContent = excuse;
  } catch {}
}
loadExcuse();

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});
