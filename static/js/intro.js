/* =========================================================
   INTRO — scroll-scrubbed boot sequence
   ========================================================= */

function introToggleTheme() {
  const body   = document.body;
  const isDark = body.classList.toggle('dark');
  const sw     = document.getElementById('theme-switch');
  if (sw) sw.checked = isDark;
  const lbl  = document.getElementById('intro-theme-label');
  const icon = document.getElementById('intro-theme-icon');
  if (lbl)  lbl.textContent  = isDark ? 'Light mode' : 'Dark mode';
  if (icon) icon.textContent = isDark ? '☀' : '☾';
  const lblL = document.getElementById('lbl-light');
  const lblD = document.getElementById('lbl-dark');
  if (lblL) lblL.classList.toggle('active', !isDark);
  if (lblD) lblD.classList.toggle('active', isDark);
}

(function () {
  const intro    = document.getElementById('intro');
  const body     = document.body;
  if (!intro) return;

  const sceneTerm  = document.getElementById('scene-term');
  const sceneGlyph = document.getElementById('scene-glyph');
  const scenePipe  = document.getElementById('scene-pipe');
  const termLines  = [...document.querySelectorAll('.t-line')];
  const nodes      = [...document.querySelectorAll('.pipe-nodes .node')];
  const edges      = [...document.querySelectorAll('.pipe-edges .edge')];
  const years      = [...document.querySelectorAll('.pipe-years .yr')];
  const packet     = document.getElementById('packet');
  const glyphWrap  = document.getElementById('glyph-wrap');
  const bar        = document.getElementById('intro-bar');
  const barOuter   = document.querySelector('.intro-progress-bar');
  const hint       = document.querySelector('.intro-hint');
  const hudProg    = document.getElementById('hud-prog');
  const hudPhase   = document.getElementById('hud-phase');
  const hudRec     = document.getElementById('hud-rec');
  const hudDags    = document.getElementById('hud-dags');

  let target = 0;
  let current = 0;
  const STEP = 1 / 32;
  const TOUCH_STEP = 1 / 420;
  let finished = false;
  let touchY = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  function consume(e) {
    if (finished) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function onWheel(e) {
    if (finished) return;
    consume(e);
    const dir = Math.sign(e.deltaY);
    const mag = clamp(Math.abs(e.deltaY) / 100, 0.4, 1.8);
    target = clamp(target + dir * STEP * mag, 0, 1);
  }

  function onTouchStart(e) {
    if (finished) return;
    touchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (finished || touchY == null) return;
    consume(e);
    const y = e.touches[0].clientY;
    const dy = touchY - y;
    touchY = y;
    target = clamp(target + dy * TOUCH_STEP, 0, 1);
  }
  function onTouchEnd() { touchY = null; }

  function onKey(e) {
    if (finished) return;
    const k = e.key;
    if (k === 'Escape') { finish(); return; }
    if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
      consume(e); target = clamp(target + STEP * 4, 0, 1);
    } else if (k === 'ArrowUp' || k === 'PageUp') {
      consume(e); target = clamp(target - STEP * 4, 0, 1);
    } else if (k === 'End') {
      consume(e); finish();
    } else if (k === 'Home') {
      consume(e); target = 0;
    }
  }

  function onClick(e) {
    if (finished) return;
    if (e.target.closest('#intro-theme-btn')) return;
    e.stopPropagation();
    finish();
  }

  window.addEventListener('wheel',      onWheel,      { passive: false, capture: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true,  capture: true });
  window.addEventListener('touchmove',  onTouchMove,  { passive: false, capture: true });
  window.addEventListener('touchend',   onTouchEnd,   { passive: true,  capture: true });
  window.addEventListener('keydown',    onKey,        { capture: true });
  intro.addEventListener('click', onClick, { capture: true });

  try { history.scrollRestoration = 'manual'; } catch (e) {}

  function render(p) {
    // Drive background canvas speed
    let bgSpeed;
    if (p < 0.33) {
      bgSpeed = lerp(3, 5, p / 0.33);
    } else if (p < 0.60) {
      bgSpeed = lerp(5, 6, (p - 0.33) / 0.27);
    } else if (p < 0.95) {
      bgSpeed = lerp(6, 1, smooth((p - 0.60) / 0.35));
    } else {
      bgSpeed = 1;
    }
    window.__bgSpeed = bgSpeed;

    const phase =
      p < 0.33 ? 'boot' :
      p < 0.60 ? 'identity' :
      p < 0.95 ? 'pipeline' : 'ready';

    hudProg.textContent  = String(Math.round(p * 100)).padStart(2, '0') + '%';
    hudPhase.textContent = phase;
    hudRec.textContent   = Math.floor(lerp(0, 1247832, smooth(clamp((p-0.55)/0.40, 0, 1)))).toLocaleString();
    const dagN = Math.floor(lerp(0, 23, smooth(clamp((p-0.05)/0.25, 0, 1))));
    hudDags.textContent  = dagN + '/23';

    if (barOuter) barOuter.style.setProperty('--p', (p * 100).toFixed(1) + '%');

    if (hint) hint.classList.toggle('fade', p > 0.04);

    const termOp = clamp(1 - (p - 0.33) / 0.07, 0, 1);
    sceneTerm.style.opacity = termOp.toFixed(3);
    sceneTerm.classList.toggle('on', termOp > 0.01);

    const glyphIn  = clamp((p - 0.33) / 0.09, 0, 1);
    const glyphOut = clamp(1 - (p - 0.60) / 0.08, 0, 1);
    const glyphOp  = glyphIn * glyphOut;
    sceneGlyph.style.opacity = glyphOp.toFixed(3);
    sceneGlyph.classList.toggle('on', glyphOp > 0.01);
    if (glyphWrap) {
      const s = lerp(0.88, 1.0, smooth(glyphIn));
      glyphWrap.style.transform = `scale(${s})`;
    }

    const pipeIn  = clamp((p - 0.58) / 0.10, 0, 1);
    const pipeOut = clamp(1 - (p - 0.93) / 0.07, 0, 1);
    const pipeOp  = pipeIn * pipeOut;
    scenePipe.style.opacity = pipeOp.toFixed(3);
    scenePipe.classList.toggle('on', pipeOp > 0.01);

    termLines.forEach(line => {
      const at = parseFloat(line.dataset.show);
      line.classList.toggle('visible', p >= at || at <= 0.06);
    });

    nodes.forEach(n => {
      const at = parseFloat(n.dataset.at);
      n.classList.toggle('on', p >= at);
    });
    edges.forEach(e => {
      const at = parseFloat(e.dataset.at);
      e.classList.toggle('on', p >= at);
    });
    years.forEach(y => {
      const at = parseFloat(y.dataset.at);
      y.classList.toggle('on', p >= at);
    });

    if (packet) {
      if (pipeOp < 0.1) {
        packet.style.opacity = 0;
      } else {
        const t = clamp((p - 0.60) / 0.30, 0, 1);
        const x = lerp(100, 970, t);
        packet.setAttribute('cx', x);
        packet.setAttribute('cy', 180);
        packet.style.opacity = 0.95;
      }
    }
  }

  function tick() {
    current = lerp(current, target, 0.14);
    if (Math.abs(current - target) < 0.0005) current = target;
    render(current);

    if (!finished && target >= 0.999 && current >= 0.995) {
      finish();
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    if (finished) return;
    window.__bgSpeed = 1;
    finished = true;
    intro.classList.add('hidden');
    body.classList.remove('intro-locked');
    body.classList.add('intro-revealing');
    window.scrollTo(0, 0);
    setTimeout(() => {
      body.classList.remove('intro-revealing');
      intro.setAttribute('aria-hidden', 'true');
      intro.style.display = 'none';
    }, 1000);
  }

  render(0);
  requestAnimationFrame(tick);
})();
