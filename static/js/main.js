/* ===== THEME ===== */
const body = document.getElementById('body');
let dark = false;

function toggleTheme(on) {
  dark = on;
  body.classList.toggle('dark', dark);
  document.getElementById('lbl-light').classList.toggle('active', !dark);
  document.getElementById('lbl-dark').classList.toggle('active', dark);
}

/* ===== CUSTOM CURSOR + GLOBAL MOUSE ===== */
const xhair = document.getElementById('xhair');
const mouse = { x: -999, y: -999 };
document.addEventListener('mousemove', e => {
  xhair.style.left = e.clientX + 'px';
  xhair.style.top  = e.clientY + 'px';
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
document.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
document.querySelectorAll('a,button,.sk-tag,.proj-card,.c-link,.exp-pts li,.switch,.footer-easter').forEach(el => {
  el.addEventListener('mouseenter', () => xhair.classList.add('big'));
  el.addEventListener('mouseleave', () => xhair.classList.remove('big'));
});

/* ===== FULL-PAGE BACKGROUND CANVAS ===== */
const bgCanvas = document.getElementById('bg-canvas');
const ctx = bgCanvas.getContext('2d');
let W, H, lines = [], t = 0;

function initCanvas() {
  W = bgCanvas.width  = window.innerWidth;
  H = bgCanvas.height = window.innerHeight;
  lines = [];
  const cols = Math.ceil(W / 44);
  const rows = Math.ceil(H / 44);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      lines.push({
        x: i * 44 + 22,
        y: j * 44 + 22,
        angle: Math.random() * Math.PI * 2,
        speed: .22 + Math.random() * .3,
        len:   10 + Math.random() * 8,
        alpha: .09 + Math.random() * .07
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

function renderCanvas() {
  ctx.clearRect(0, 0, W, H);
  t += .007;
  const fl = dark ? '230,220,200' : '14,14,14';
  const fa = dark ? '217,79,30'   : '184,58,12';

  lines.forEach(ln => {
    const dx   = mouse.x - ln.x;
    const dy   = mouse.y - ln.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const inf  = Math.max(0, 1 - dist / 160);
    const target = dist < 160
      ? Math.atan2(dy, dx) + Math.PI / 2
      : ln.angle + Math.sin(t * ln.speed + ln.x * .016 + ln.y * .016) * .65;

    ln.angle += (target - ln.angle) * .05;
    const a     = ln.alpha + inf * .1;
    const isAcc = inf > .4;

    ctx.beginPath();
    ctx.moveTo(ln.x - Math.cos(ln.angle) * ln.len * .5, ln.y - Math.sin(ln.angle) * ln.len * .5);
    ctx.lineTo(ln.x + Math.cos(ln.angle) * ln.len * .5, ln.y + Math.sin(ln.angle) * ln.len * .5);
    ctx.strokeStyle = isAcc
      ? `rgba(${fa},${Math.min(a * 1.8, .38)})`
      : `rgba(${fl},${a})`;
    ctx.lineWidth = isAcc ? 1.1 : .6;
    ctx.stroke();
  });

  requestAnimationFrame(renderCanvas);
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
    document.getElementById('logo').innerHTML = 'Aviral Tanwar<sup style="color:var(--accent)">:wq!</sup>';
    lc = 0;
    setTimeout(() => {
      document.getElementById('logo').innerHTML = 'Aviral Tanwar<sup title="Platform Owner · Solution Architect · Data Engineer">PO/SA/DE</sup>';
    }, 1800);
  }
}

/* ===== SCROLL REVEAL ===== */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ===== DEVELOPER EXCUSE ===== */
async function loadExcuse() {
  try {
    const r = await fetch('/api/excuse');
    const d = await r.json();
    const el = document.getElementById('nav-quote');
    if (el && d.excuse) el.textContent = d.excuse;
  } catch {
    const el = document.getElementById('nav-quote');
    if (el) el.textContent = 'It works on my machine.';
  }
}
loadExcuse();

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
  dot.style.cursor = 'crosshair';
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
  const sz = 10 + Math.random() * 14;
  b.style.cssText = `position:fixed;font-size:${sz}px;left:${sx}px;top:-20px;z-index:9997;pointer-events:none;transform:rotate(${Math.random()*360}deg);`;
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

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});