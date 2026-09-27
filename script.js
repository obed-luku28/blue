/* ============================================================
   GLORA — Landing page interactions
   Vanilla JS, sans dépendance externe.
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nav: fond au scroll + menu mobile ---------- */
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');
const progressBar = document.getElementById('progressBar');

function onScroll() {
  const scrollY = window.scrollY;
  nav.classList.toggle('is-scrolled', scrollY > 8);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (burger) {
  burger.addEventListener('click', () => {
    navMobile.classList.toggle('is-open');
  });
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMobile.classList.remove('is-open'));
  });
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // léger décalage pour les éléments qui apparaissent ensemble (grilles)
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
}

/* ---------- Compteurs animés (stats du hero) ---------- */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  if (prefersReducedMotion || isNaN(target)) {
    el.textContent = formatNumber(target);
    return;
  }
  const duration = 1400;
  const start = performance.now();

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M+';
    if (n >= 1000) return Math.round(n / 100) / 10 + 'k+';
    return n + '+';
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNumber(Math.floor(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = formatNumber(target);
  }
  requestAnimationFrame(tick);
}

const statEls = document.querySelectorAll('.stat__num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
statEls.forEach(el => statObserver.observe(el));

/* ---------- Ligne de progression de la section "Fonctionnement" ---------- */
const flowSteps = document.getElementById('flowSteps');
const flowFill = document.getElementById('flowFill');

if (flowSteps && flowFill && !prefersReducedMotion) {
  function updateFlowLine() {
    const rect = flowSteps.getBoundingClientRect();
    const viewportH = window.innerHeight;
    // progression entre "la section entre dans le viewport" et "elle le quitte en haut"
    const start = viewportH * 0.85;
    const end = rect.height * 0.6;
    const raw = (start - rect.top) / (start + end - viewportH * 0.15);
    const pct = Math.max(0, Math.min(1, raw));
    flowFill.style.width = (pct * 100) + '%';
  }
  window.addEventListener('scroll', updateFlowLine, { passive: true });
  window.addEventListener('resize', updateFlowLine);
  updateFlowLine();
} else if (flowFill) {
  flowFill.style.width = '100%';
}

/* ---------- Fallback propre pour les images placeholder (à remplacer) ---------- */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.background = '#E7E2D9';
    img.style.display = 'inline-block';
  }, { once: true });
});

/* ---------- Parallax léger sur le mockup du hero (souris) ---------- */
const heroVisual = document.getElementById('heroVisual');

if (heroVisual && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const mock = heroVisual.querySelector('.mock');
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mock.style.transform = `rotate(${1.2 + x * 3}deg) translate(${x * 8}px, ${y * 8}px)`;
  });
  heroVisual.addEventListener('mouseleave', () => {
    mock.style.transform = 'rotate(1.2deg)';
  });
}
