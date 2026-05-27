/* ===================================================================
   NOVA · live.js
   Live camera timestamp + animated counters
   =================================================================== */
(function () {
  'use strict';

  /* ── Live timestamp ──────────────────────────────────────────── */
  const tsEl = document.querySelector('[data-live-timestamp]');

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function updateTs() {
    if (!tsEl) return;
    // Bali is UTC+8
    const now = new Date();
    const baliOffsetMs = 8 * 60 * 60 * 1000;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const bali = new Date(utcMs + baliOffsetMs);

    const yyyy = bali.getFullYear();
    const mm = pad(bali.getMonth() + 1);
    const dd = pad(bali.getDate());
    const hh = pad(bali.getHours());
    const min = pad(bali.getMinutes());
    const ss = pad(bali.getSeconds());

    tsEl.textContent = `${yyyy}.${mm}.${dd} · ${hh}:${min}:${ss} WITA`;
  }

  if (tsEl) {
    updateTs();
    setInterval(updateTs, 1000);
  }

  /* ── Counter animation (when in viewport) ────────────────────── */
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-counter') || '0', 10);
        const duration = 1800;
        const start = performance.now();
        const suffix = el.textContent.includes('%') ? '%' : '';

        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          el.textContent = `${value}${suffix}`;

          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => observer.observe(c));
})();
