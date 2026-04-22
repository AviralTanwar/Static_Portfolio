/* ===== THEME ===== */
const body = document.getElementById('body');
let dark = false;

function toggleTheme(on) {
  dark = on;
  body.classList.toggle('dark', dark);
  document.getElementById('lbl-light').classList.toggle('active', !dark);
  document.getElementById('lbl-dark').classList.toggle('active', dark);
}

/* ===== CUSTOM CURSOR ===== */
const xhair = document.getElementById('xhair');
document.addEventListener('mousemove', e => {
  xhair.style.left = e.clientX + 'px';
  xhair.style.top  = e.clientY + 'px';
});
document.querySelectorAll('a,button,.sk-tag,.proj-card,.c-link,.exp-pts li,.switch,.footer-easter').forEach(el => {
  el.addEventListener('mouseenter', () => xhair.classList.add('big'));
  el.addEventListener('mouseleave', () => xhair.classList.remove('big'));
});

/* ===== HERO CANVAS ===== */
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let W, H, lines = [], mouse = { x: -999, y: -999 }, t = 0;
let raf;

function initCanvas() {
  const hero = document.getElementById('hero');
  W = canvas.width  = hero.offsetWidth;
  H = canvas.height = hero.offsetHeight;
  lines = [];
  const cols = Math.ceil(W / 40);
  const rows = Math.ceil(H / 40);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      lines.push({
        x: i * 40 + 20,
        y: j * 40 + 20,
        angle: Math.random() * Math.PI * 2,
        speed: .25 + Math.random() * .35,
        len:   10  + Math.random() * 8,
        alpha: .06 + Math.random() * .05
      });
    }
  }
}

initCanvas();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initCanvas, 150);
});

const hero = document.getElementById('hero');
hero.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

function renderCanvas() {
  ctx.clearRect(0, 0, W, H);
  t += .007;
  const fl = dark ? '230,220,200' : '14,14,14';
  const fa = dark ? '217,79,30'   : '184,58,12';

  lines.forEach(ln => {
    const dx   = mouse.x - ln.x;
    const dy   = mouse.y - ln.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const inf  = Math.max(0, 1 - dist / 150);
    const target = dist < 150
      ? Math.atan2(dy, dx) + Math.PI / 2
      : ln.angle + Math.sin(t * ln.speed + ln.x * .018 + ln.y * .018) * .65;

    ln.angle += (target - ln.angle) * .055;
    const a     = ln.alpha + inf * .14;
    const isAcc = inf > .38;

    ctx.beginPath();
    ctx.moveTo(ln.x - Math.cos(ln.angle) * ln.len * .5, ln.y - Math.sin(ln.angle) * ln.len * .5);
    ctx.lineTo(ln.x + Math.cos(ln.angle) * ln.len * .5, ln.y + Math.sin(ln.angle) * ln.len * .5);
    ctx.strokeStyle = isAcc
      ? `rgba(${fa},${Math.min(a * 1.8, .32)})`
      : `rgba(${fl},${a})`;
    ctx.lineWidth = isAcc ? 1.1 : .55;
    ctx.stroke();
  });

  raf = requestAnimationFrame(renderCanvas);
}
renderCanvas();

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
const konamiSeq = [38,38,40,40,37,39,37,39,66,65];
let ki = 0;
document.addEventListener('keydown', e => {
  if (e.keyCode === konamiSeq[ki]) {
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
    document.getElementById('logo').innerHTML = 'Aviral Tanwar<sup style="color:var(--accent)">:wq!</sup>';
    lc = 0;
    setTimeout(() => {
      document.getElementById('logo').innerHTML = 'Aviral Tanwar<sup title="Platform Owner · Solution Architect">PO/SA</sup>';
    }, 1800);
  }
}

/* ===== SCROLL REVEAL ===== */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});
