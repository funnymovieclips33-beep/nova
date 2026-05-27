/* ===================================================================
   NOVA · navigation.js
   Smooth anchor scrolling + scroll progress bar.
   (Header + mobile menu removed.)
   =================================================================== */
(function () {
  'use strict';

  /* ── Smooth scroll for in-page anchors ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* ── Scroll progress bar ─────────────────────────────────────── */
  const progressBar = document.querySelector('.nova-progress__bar');
  if (!progressBar) return;

  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(scrolled, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
