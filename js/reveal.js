/* ===================================================================
   NOVA · reveal.js
   IntersectionObserver-based reveal-on-scroll
   Honors data-reveal-delay (ms) for staggered entrances
   =================================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal]');

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);

        // Stagger via setTimeout (cheap, no layout)
        window.setTimeout(() => {
          el.classList.add('is-revealed');
        }, delay);

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  targets.forEach((el) => observer.observe(el));

  /* Hero elements reveal immediately on page load (they're above the fold) */
  window.addEventListener('load', () => {
    const heroTargets = document.querySelectorAll('.hero [data-reveal]');
    heroTargets.forEach((el) => {
      const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      window.setTimeout(() => el.classList.add('is-revealed'), delay);
    });
  });
})();
