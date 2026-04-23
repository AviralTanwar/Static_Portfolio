/* =========================================================
   PORTFOLIO ANIMATIONS — additive JS layer
   Runs after main.js. Matches existing patterns exactly.
   ========================================================= */
(function () {
  'use strict';

  const qs  = (s, root) => (root || document).querySelector(s);
  const qsa = (s, root) => [...(root || document).querySelectorAll(s)];
  const raf = requestAnimationFrame;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ============================================================
     1. HERO STAGGER
  ============================================================ */
  function initHeroStagger() {
    const hero = qs('#hero');
    if (!hero) return;
    const run = () => { hero.classList.add('hero-animated'); };
    if (document.getElementById('intro')) {
      const wait = () => {
        if (!document.body.classList.contains('intro-locked')) { run(); }
        else { setTimeout(wait, 120); }
      };
      wait();
    } else {
      setTimeout(run, 200);
    }
  }

  /* ============================================================
     2. SECTION LABEL SWEEP
  ============================================================ */
  function initSectionLabels() {
    const labels = qsa('.sec-label');
    if (!labels.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('label-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    labels.forEach(el => io.observe(el));
  }

  /* ============================================================
     3. SKILL TAG STAGGER
  ============================================================ */
  function initSkillTags() {
    const outer = qs('.skills-outer');
    if (!outer) return;
    const tags = qsa('.sk-tag', outer);
    tags.forEach((tag, i) => {
      tag.style.transitionDelay = (i * 38) + 'ms';
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          outer.classList.add('skills-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    io.observe(outer);
  }

  /* ============================================================
     4. KPI COUNT-UP
  ============================================================ */
  function initKpiCountUp() {
    const kpis = qsa('.kpi');
    if (!kpis.length) return;

    function parseVal(text) {
      const m = text.match(/^([0-9.]+)([^0-9.]*)$/);
      if (!m) return null;
      return { num: parseFloat(m[1]), suffix: m[2] };
    }

    function animateKpi(el, from, to, suffix, duration) {
      const valEl = el.querySelector('.kpi-val');
      if (!valEl) return;
      valEl.classList.add('kpi-counting');
      const start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start) / duration);
        const val = from + (to - from) * easeOut(t);
        const disp = Number.isInteger(to) ? Math.round(val) : val.toFixed(1);
        valEl.textContent = disp + suffix;
        if (t < 1) raf(step);
        else {
          valEl.textContent = to + suffix;
          setTimeout(() => valEl.classList.remove('kpi-counting'), 400);
        }
      };
      raf(step);
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        qsa('.kpi-val', e.target).forEach((el, i) => {
          const parsed = parseVal(el.textContent.trim());
          if (!parsed) return;
          setTimeout(() => animateKpi(el.parentElement, 0, parsed.num, parsed.suffix, 900), i * 140);
        });
      });
    }, { threshold: 0.25 });

    const exp = qs('#experience');
    if (exp) io.observe(exp);
  }

  /* ============================================================
     5. PROJECT CARD 3D TILT
  ============================================================ */
  function initCardTilt() {
    qsa('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) / (r.width  / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        const maxTilt = 5;
        const rx = -dy * maxTilt;
        const ry =  dx * maxTilt;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ============================================================
     6. CONTACT LINKS STAGGER
  ============================================================ */
  function initContactStagger() {
    const links = qsa('.c-link');
    if (!links.length) return;
    links.forEach((link, i) => {
      link.style.transitionDelay = (i * 70) + 'ms';
    });
    const grid = qs('.contact-grid');
    if (!grid) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          grid.classList.add('contact-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    io.observe(grid);
  }

  /* ============================================================
     7. PARALLAX HERO
  ============================================================ */
  function initParallax() {
    const hero = qs('#hero');
    if (!hero) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      raf(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          hero.style.transform = `translateY(${y * 0.22}px)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ============================================================
     8. SECTION NUMBER COUNT-UP
  ============================================================ */
  function initSectionNumbers() {
    qsa('.sec-num').forEach(el => {
      const target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      el.textContent = '00';
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const start = performance.now();
          const dur   = 480;
          const step  = now => {
            const t = Math.min(1, (now - start) / dur);
            const v = Math.round(target * easeOut(t));
            e.target.textContent = String(v).padStart(2, '0');
            if (t < 1) raf(step);
          };
          raf(step);
        });
      }, { threshold: 0.2 });
      io.observe(el);
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    initHeroStagger();
    initSectionLabels();
    initSkillTags();
    initKpiCountUp();
    initCardTilt();
    initContactStagger();
    initParallax();
    initSectionNumbers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
