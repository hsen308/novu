/* ═══════════════════════════════════════════
   NOVU STUDIOS — MAIN JS
═══════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ─── STAR CANVAS ────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], w = 0, h = 0;
  const STAR_COUNT = 220;
  const MAX_RADIUS = 1.4;
  const SHOOT_INTERVAL = 6000;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildStars();
  }
  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * MAX_RADIUS + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.003,
      dx: (Math.random() - 0.5) * 0.08,
      dy: (Math.random() - 0.5) * 0.03,
    }));
  }
  let shoot = null;
  function launchShoot() {
    shoot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4,
      len: Math.random() * 120 + 60, speed: Math.random() * 10 + 8,
      angle: Math.PI / 5 + Math.random() * 0.3, alpha: 1 };
  }
  setTimeout(launchShoot, 2000);
  setInterval(launchShoot, SHOOT_INTERVAL);
  let frame = 0;
  function draw() {
    frame++;
    ctx.clearRect(0, 0, w, h);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const starColor = isDark ? '200,255,0' : '90,150,0';
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(frame * s.speed + s.phase);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${starColor},${s.alpha * twinkle})`; ctx.fill();
      s.x += s.dx; s.y += s.dy;
      if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
    });
    if (shoot) {
      shoot.x += Math.cos(shoot.angle) * shoot.speed;
      shoot.y += Math.sin(shoot.angle) * shoot.speed;
      shoot.alpha -= 0.018;
      if (shoot.alpha <= 0) { shoot = null; }
      else {
        const tx = shoot.x - Math.cos(shoot.angle) * shoot.len;
        const ty = shoot.y - Math.sin(shoot.angle) * shoot.len;
        const grad = ctx.createLinearGradient(tx, ty, shoot.x, shoot.y);
        grad.addColorStop(0, `rgba(${starColor},0)`);
        grad.addColorStop(1, `rgba(${starColor},${shoot.alpha * 0.9})`);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(shoot.x, shoot.y);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); }, { passive: true });
  resize(); draw();
})();

/* ─── GLOBALS ────────────────────────────── */
const html    = document.documentElement;
const isTouch = window.matchMedia('(hover: none)').matches;
let   menuOpen = false;

/* ═══════════════════════════════════════════
   PRELOADER
═══════════════════════════════════════════ */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const preNum    = document.getElementById('pre-num');
  const preBar    = document.getElementById('pre-bar');
  const letters   = document.querySelectorAll('.pre-letter');
  const preMeta   = document.querySelector('.pre-meta');

  document.body.style.overflow = 'hidden';

  // Stagger-in letters
  gsap.to(letters, {
    y: 0, opacity: 1,
    duration: 0.85, stagger: 0.1, ease: 'power4.out',
    delay: 0.3
  });
  setTimeout(() => preMeta && preMeta.classList.add('show'), 900);

  // Count-up
  let count = 0;
  const tick = setInterval(() => {
    count += Math.floor(Math.random() * 4) + 2;
    if (count >= 100) count = 100;
    if (preNum) preNum.textContent = count;
    if (preBar) preBar.style.width = count + '%';

    if (count === 100) {
      clearInterval(tick);
      setTimeout(finishPreloader, 320);
    }
  }, 22);

  function finishPreloader() {
    // Scatter letters out
    gsap.to(letters, {
      y: -80, opacity: 0,
      duration: 0.6, stagger: 0.06, ease: 'power3.in'
    });
    gsap.to(preloader, {
      yPercent: -100, duration: 0.85, delay: 0.45, ease: 'power4.inOut',
      onComplete: () => {
        preloader.style.display = 'none';
        document.body.style.overflow = '';
        initHeroAnim();
      }
    });
  }
})();

/* ═══════════════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════════════ */
const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const max = document.body.scrollHeight - window.innerHeight;
  if (scrollBar) scrollBar.style.width = (window.scrollY / max * 100) + '%';
}, { passive: true });

/* ═══════════════════════════════════════════
   HERO CANVAS — dot grid + wave lines
═══════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mouse = { x: -999, y: -999 };
  let dots = [], frame = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const gap = isTouch ? 58 : 46;
    for (let x = gap; x < canvas.width; x += gap) {
      for (let y = gap; y < canvas.height; y += gap) {
        dots.push({ x, y, ox: x, oy: y, phase: Math.random() * Math.PI * 2 });
      }
    }
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = html.getAttribute('data-theme') !== 'light';

    // Wave lines (5 sinusoidal sweeps)
    if (!isTouch) {
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const amp    = 28 + i * 14;
        const freq   = 0.0048 + i * 0.001;
        const speed  = frame * (0.006 + i * 0.002);
        const yBase  = canvas.height * (0.2 + i * 0.16);
        for (let x = 0; x <= canvas.width; x += 3) {
          const y = yBase + Math.sin(x * freq + speed) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = isDark
          ? `rgba(200,255,0,${0.018 - i * 0.002})`
          : `rgba(90,150,0,${0.015 - i * 0.002})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Mesh — connect nearby dots with faint lines (limited window for perf)
    if (!isTouch) {
      const MESH_DIST = 90;
      const MESH_DIST_SQ = MESH_DIST * MESH_DIST;
      const colsPerScreen = Math.ceil(canvas.width  / (isTouch ? 58 : 46));
      const maxJ = Math.min(colsPerScreen * 2 + 4, 40);
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j <= Math.min(i + maxJ, dots.length - 1); j++) {
          const dx = dots[i].x - dots[j].x;
          if (Math.abs(dx) > MESH_DIST) continue;
          const dy = dots[i].y - dots[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MESH_DIST_SQ) {
            const alpha = (1 - Math.sqrt(d2) / MESH_DIST) * (isDark ? 0.065 : 0.035);
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = isDark ? `rgba(200,255,0,${alpha})` : `rgba(90,150,0,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Dots
    dots.forEach(d => {
      const dx   = mouse.x - d.ox;
      const dy   = mouse.y - d.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 130;
      if (dist < radius && !isTouch) {
        const force = (1 - dist / radius) * 13;
        d.x += (d.ox - (dx / dist) * force - d.x) * 0.16;
        d.y += (d.oy - (dy / dist) * force - d.y) * 0.16;
      } else {
        d.x += (d.ox - d.x) * 0.1;
        d.y += (d.oy - d.y) * 0.1;
      }
      const pulse   = 0.5 + 0.5 * Math.sin(frame * 0.016 + d.phase);
      const baseA   = isDark ? 0.07 : 0.055;
      const r       = dist < radius && !isTouch ? 1.6 : 1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(200,255,0,${baseA + pulse * 0.065})`
        : `rgba(90,150,0,${baseA + pulse * 0.04})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });
  resize();
  draw();
})();

/* ═══════════════════════════════════════════
   TYPEWRITER (hero cycling words)
═══════════════════════════════════════════ */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const words  = ['RESTAURANTS', 'CAFÉS', 'HOTELS', 'BUSINESSES', 'BRANDS', 'HOSPITALITY'];
  let wi = 0, ci = 0, deleting = false;
  const speed  = { type: 90, delete: 55, pause: 1800 };

  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, speed.pause); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, deleting ? speed.delete : speed.type);
  }
  setTimeout(tick, 1800);
})();

/* ═══════════════════════════════════════════
   HERO ANIMATION (runs after preloader)
═══════════════════════════════════════════ */
function initHeroAnim() {
  // Split chars inside .word spans
  document.querySelectorAll('.hero-headline .word').forEach(word => {
    if (word.children.length) return;
    const text = word.textContent;
    word.innerHTML = text.split('').map(c =>
      c === ' ' ? ' ' : `<span class="char">${c}</span>`
    ).join('');
  });

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.hero-eyebrow-line', { scaleX: 1, duration: 0.75 })
    .to('.hero-eyebrow span',  { y: 0, duration: 0.55 }, '-=0.35')
    .to('.char', {
      y: 0, opacity: 1,
      duration: 0.7, stagger: 0.02, ease: 'power3.out'
    }, '-=0.2')
    .to('.hero-headline .word', { y: 0, duration: 0.65, stagger: 0.1 }, '<')
    .to('.hero-desc',    { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
    .to('.hero-stats',   { opacity: 1, duration: 0.7 },       '-=0.5')
    .to('.hero-badge',   { opacity: 1, duration: 0.8 },       '-=0.5')
    .to('.hero-scroll',  { opacity: 1, duration: 0.5 },       '-=0.3');
}

/* ═══════════════════════════════════════════
   HERO PARALLAX
═══════════════════════════════════════════ */
if (!isTouch) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const hi = document.querySelector('.hero-inner');
    const hs = document.querySelector('.hero-stats');
    const hb = document.querySelector('.hero-badge');
    if (hi) hi.style.transform = `translateY(${y * 0.17}px)`;
    if (hs) hs.style.transform = `translateY(calc(-50% + ${y * 0.1}px))`;
    if (hb) hb.style.transform = `translateY(calc(-50% + ${y * 0.08}px))`;
  }, { passive: true });

  // 3D tilt on hero inner
  const hero = document.getElementById('hero');
  const heroInner = document.querySelector('.hero-inner');
  if (hero && heroInner) {
    hero.addEventListener('mousemove', e => {
      const r  = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(heroInner, {
        rotateY: nx * 4, rotateX: -ny * 3,
        duration: 0.8, ease: 'power2.out', overwrite: 'auto'
      });
    });
    hero.addEventListener('mouseleave', () => {
      gsap.to(heroInner, { rotateY: 0, rotateX: 0, duration: 1, ease: 'power3.out' });
    });
  }
}

/* ═══════════════════════════════════════════
   CURSOR + TRAIL
═══════════════════════════════════════════ */
if (!isTouch) {
  const cur   = document.getElementById('cur');
  const ring  = document.getElementById('cur-ring');
  const label = document.getElementById('cur-label');
  const trails= [...document.querySelectorAll('.cur-trail')];
  const lags  = [0.14, 0.1, 0.075, 0.055, 0.04];

  let cx = 0, cy = 0;
  const pts = trails.map(() => ({ x: 0, y: 0 }));
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    if (cur)  { cur.style.left  = cx + 'px'; cur.style.top  = cy + 'px'; }
    if (label){ label.style.left= cx + 'px'; label.style.top= cy + 'px'; }
  });

  // Click burst
  document.addEventListener('click', () => {
    if (!ring) return;
    gsap.fromTo(ring,
      { width: '40px', height: '40px', opacity: 0.8 },
      { width: '70px', height: '70px', opacity: 0, duration: 0.45, ease: 'power2.out',
        onComplete: () => { ring.style.opacity = ''; ring.style.width = ''; ring.style.height = ''; } }
    );
  });

  (function moveCursor() {
    rx += (cx - rx) * 0.13;
    ry += (cy - ry) * 0.13;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }

    trails.forEach((t, i) => {
      const prev = i === 0 ? { x: cx, y: cy } : pts[i - 1];
      pts[i].x += (prev.x - pts[i].x) * lags[i];
      pts[i].y += (prev.y - pts[i].y) * lags[i];
      t.style.left = pts[i].x + 'px';
      t.style.top  = pts[i].y + 'px';
      const s = 1 - i * 0.15;
      t.style.transform = `translate(-50%,-50%) scale(${s})`;
    });

    requestAnimationFrame(moveCursor);
  })();

  // Hover states
  document.querySelectorAll('a,button,.service-item,.p-step,.t-card,.why-card,.pricing-card,.about-tag,.filter-btn,.faq-question,.slider-arrow').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  // Work card — VIEW label
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering', 'cur-view');
      if (label) label.textContent = 'VIEW →';
    });
    card.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering', 'cur-view');
    });
  });

  // Work card — click to open live site
  document.querySelectorAll('.work-card[data-href]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
     window.open(card.dataset.href, '_blank', 'noopener');
      
    });
  });

  // Work track drag cursor
  const track = document.getElementById('work-track');
  if (track) {
    track.addEventListener('mousedown', () => document.body.classList.add('cur-drag'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cur-drag'));
  }
}

/* ═══════════════════════════════════════════
   MAGNETIC BUTTONS
═══════════════════════════════════════════ */
if (!isTouch) {
  document.querySelectorAll('.btn-lime, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
    });
  });
}

/* ═══════════════════════════════════════════
   NAV + OVERLAY
═══════════════════════════════════════════ */
const nav     = document.getElementById('nav');
const menuBtn = document.getElementById('nav-menu-btn');
const overlay = document.getElementById('nav-overlay');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('stuck', window.scrollY > 40);
}, { passive: true });

function toggleMenu() {
  menuOpen = !menuOpen;
  if (menuBtn) menuBtn.classList.toggle('open', menuOpen);
  if (overlay) overlay.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}
if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
document.querySelectorAll('[data-close]').forEach(a => {
  a.addEventListener('click', () => { if (menuOpen) toggleMenu(); });
});

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (menuOpen) toggleMenu();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Active nav link
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = [...navLinks].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
window.addEventListener('scroll', () => {
  let curr = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) curr = '#' + s.id;
  });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === curr));
}, { passive: true });

/* ═══════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════ */
const themeBtn = document.getElementById('theme-btn');
function applyTheme(t) { html.setAttribute('data-theme', t); localStorage.setItem('novu-theme', t); }
const saved = localStorage.getItem('novu-theme');
if (saved) applyTheme(saved);
if (themeBtn) themeBtn.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ═══════════════════════════════════════════
   FOOTER YEAR
═══════════════════════════════════════════ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ═══════════════════════════════════════════
   TEXT SCRAMBLE
═══════════════════════════════════════════ */
class Scramble {
  constructor(el) {
    this.el    = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.orig  = el.textContent;
  }
  run() {
    const len    = this.orig.length;
    let   iter   = 0;
    const total  = len * 3;
    const id = setInterval(() => {
      this.el.textContent = this.orig.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter / 3) return c;
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }).join('');
      if (iter >= total) { clearInterval(id); this.el.textContent = this.orig; }
      iter++;
    }, 28);
  }
}

// Apply to section titles on scroll enter
document.querySelectorAll('.scramble').forEach(el => {
  const sc = new Scramble(el);
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter: () => sc.run()
  });
});

/* ═══════════════════════════════════════════
   CLIP REVEALS
═══════════════════════════════════════════ */
document.querySelectorAll('.clip-reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter: () => el.classList.add('revealed')
  });
});

/* ═══════════════════════════════════════════
   COUNT-UP (stats strip + hero)
═══════════════════════════════════════════ */
document.querySelectorAll('.count-up').forEach(el => {
  const target = +el.dataset.target;
  ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => {
      let n = 0;
      const step = () => {
        n = Math.min(n + Math.ceil(target / 40), target);
        el.textContent = n;
        if (n < target) requestAnimationFrame(step);
      };
      step();
    }
  });
});

/* ═══════════════════════════════════════════
   SERVICES ANIMATION
═══════════════════════════════════════════ */
gsap.utils.toArray('.service-item').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, x: -24 },
    { opacity: 1, x: 0, duration: 0.65, delay: i * 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
  );
});

/* Compute icon path lengths for stroke animation */
document.querySelectorAll('.icon-path').forEach(path => {
  const len = path.getTotalLength ? path.getTotalLength() : 200;
  path.style.strokeDasharray  = len;
  path.style.strokeDashoffset = len;
});

/* ═══════════════════════════════════════════
   STATS STRIP
═══════════════════════════════════════════ */
gsap.utils.toArray('.stat-item').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

/* ═══════════════════════════════════════════
   WHY US ANIMATION
═══════════════════════════════════════════ */
gsap.utils.toArray('.why-card').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 40, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.75, delay: i * 0.12, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
  );
});

/* ═══════════════════════════════════════════
   WORK CARD TILT + DRAG
═══════════════════════════════════════════ */
if (!isTouch) {
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// Click to open — ALL devices
document.querySelectorAll('.work-card[data-href]').forEach(card => {
  card.addEventListener('click', () => {
   window.open(card.dataset.href, '_blank', 'noopener');
  });
});

// Drag scroll
const wTrack = document.getElementById('work-track');
if (wTrack) {
  let dragging = false, startX = 0, scrollLeft = 0, velocity = 0, lastX = 0;

  wTrack.addEventListener('mousedown', e => {
    dragging = true; wTrack.style.cursor = 'grabbing';
    startX = e.pageX - wTrack.offsetLeft;
    scrollLeft = wTrack.scrollLeft; lastX = e.pageX;
  });
  document.addEventListener('mouseup', () => {
    dragging = false; wTrack.style.cursor = 'grab';
    let v = velocity;
    const momentum = () => {
      if (Math.abs(v) < 0.5) return;
      wTrack.scrollLeft -= v; v *= 0.91;
      requestAnimationFrame(momentum);
    };
    momentum();
  });
  wTrack.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();
    const x = e.pageX - wTrack.offsetLeft;
    velocity = lastX - e.pageX; lastX = e.pageX;
    wTrack.scrollLeft = scrollLeft - (x - startX);
  });
  wTrack.addEventListener('touchstart', () => { scrollLeft = wTrack.scrollLeft; }, { passive: true });
}

// Reveal work cards
gsap.fromTo('.work-card',
  { opacity: 0, y: 28 },
  { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#work', start: 'top 85%', once: true } }
);

/* ═══════════════════════════════════════════
   WORK FILTER TABS
═══════════════════════════════════════════ */
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;

    document.querySelectorAll('.work-card').forEach(card => {
      const match = cat === 'all' || card.dataset.cat === cat;
      if (match) {
        card.classList.remove('hidden');
        gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(card, { opacity: 0.15, scale: 0.97, duration: 0.3, ease: 'power2.in' });
      }
    });
  });
});

/* ═══════════════════════════════════════════
   PROCESS — timeline line draw + step reveals
═══════════════════════════════════════════ */
const tlProgress = document.querySelector('.timeline-progress');
if (tlProgress) {
  ScrollTrigger.create({
    trigger: '.process-timeline',
    start: 'top 75%',
    end: 'bottom 30%',
    scrub: 1.2,
    onUpdate: self => {
      tlProgress.style.height = (self.progress * 100) + '%';
    }
  });
}
document.querySelectorAll('.p-step').forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 82%', once: true,
    onEnter: () => el.classList.add('visible')
  });
});

/* ═══════════════════════════════════════════
   TESTIMONIALS SLIDER (auto-play + touch)
═══════════════════════════════════════════ */
(function initSlider() {
  const track   = document.querySelector('.slider-track');
  const slides  = document.querySelectorAll('.t-slide');
  const dots    = document.querySelectorAll('.slider-dot');
  const prev    = document.getElementById('slider-prev');
  const next    = document.getElementById('slider-next');
  if (!track || slides.length === 0) return;

  let current  = 0;
  let autoTimer = null;
  let paused   = false;

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    gsap.to(track, {
      x: -current * 100 + '%',
      duration: 0.75, ease: 'power3.inOut'
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => { if (!paused) goTo(current + 1); }, 5000);
  }

  goTo(0);
  startAuto();

  if (prev) prev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

  // Touch swipe
  let touchStartX = 0;
  const wrapper = document.querySelector('.slider-wrapper');
  if (wrapper) {
    wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
    }, { passive: true });
    wrapper.addEventListener('mouseenter', () => { paused = true; });
    wrapper.addEventListener('mouseleave', () => { paused = false; });
  }
})();

/* ═══════════════════════════════════════════
   TESTIMONIAL CARDS REVEAL
═══════════════════════════════════════════ */
gsap.utils.toArray('.t-card').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '#testimonials', start: 'top 80%', once: true } }
  );
});

/* ═══════════════════════════════════════════
   PRICING — checkmark draw + card reveal
═══════════════════════════════════════════ */
ScrollTrigger.create({
  trigger: '#pricing', start: 'top 75%', once: true,
  onEnter: () => {
    document.querySelectorAll('#pricing .pricing-card').forEach(card => card.classList.add('revealed'));
  }
});
gsap.utils.toArray('.pricing-card').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 44, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: i * 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '#pricing', start: 'top 82%', once: true } }
  );
});

/* ═══════════════════════════════════════════
   FAQ ACCORDION
═══════════════════════════════════════════ */
document.querySelectorAll('.faq-item').forEach(item => {
  const q    = item.querySelector('.faq-question');
  const body = item.querySelector('.faq-body');
  if (!q || !body) return;

  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      gsap.to(other.querySelector('.faq-body'), { height: 0, duration: 0.4, ease: 'power2.inOut' });
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      gsap.to(body, { height: 'auto', duration: 0.5, ease: 'power3.out' });
    }
  });
});

/* ═══════════════════════════════════════════
   ABOUT SECTION
═══════════════════════════════════════════ */
gsap.fromTo('.about-card',
  { opacity: 0, x: -52, rotationY: -10 },
  { opacity: 1, x: 0, rotationY: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#about', start: 'top 78%', once: true } }
);
gsap.fromTo('.about-right',
  { opacity: 0, x: 52 },
  { opacity: 1, x: 0, duration: 1.1, delay: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '#about', start: 'top 78%', once: true } }
);
ScrollTrigger.create({
  trigger: '.about-bars', start: 'top 85%', once: true,
  onEnter: () => {
    document.querySelectorAll('.a-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }
});

/* ═══════════════════════════════════════════
   CONTACT — drifting orbs
═══════════════════════════════════════════ */
const orbs = document.querySelectorAll('.contact-orb');
orbs.forEach((orb, i) => {
  gsap.to(orb, {
    x: `random(-60, 60)`,
    y: `random(-60, 60)`,
    duration: `random(8, 14)`,
    repeat: -1, yoyo: true,
    ease: 'sine.inOut',
    delay: i * 2.5
  });
});

gsap.fromTo('.contact-avail, .contact-big, .contact-sub, .contact-actions, .contact-info',
  { opacity: 0, y: 36 },
  { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 82%', once: true } }
);

/* ═══════════════════════════════════════════
   GENERAL EYEBROW REVEALS
═══════════════════════════════════════════ */
gsap.utils.toArray('.s-eyebrow').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, x: -16 },
    { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
  );
});

/* ═══════════════════════════════════════════
   PROCESS SECTION BIG TEXT REVEAL
═══════════════════════════════════════════ */
gsap.fromTo('.process-left-big',
  { opacity: 0 },
  { opacity: 1, duration: 1.2, ease: 'power2.out',
    scrollTrigger: { trigger: '#process', start: 'top 80%', once: true } }
);
gsap.fromTo('.process-left-desc',
  { opacity: 0, y: 24 },
  { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out',
    scrollTrigger: { trigger: '#process', start: 'top 80%', once: true } }
);

/* ═══════════════════════════════════════════
   FOOTER REVEAL
═══════════════════════════════════════════ */
gsap.fromTo('.footer-top',
  { opacity: 0, y: 32 },
  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: 'footer', start: 'top 90%', once: true } }
);
