/* ===================================================================
   NOVA · parallax.js
   Lightweight, GPU-accelerated parallax for hero & gallery
   =================================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Only run parallax on devices with decent performance
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;

  const elements = Array.from(parallaxEls).map((el) => ({
    node: el,
    speed: parseFloat(el.getAttribute('data-parallax') || '0.2')
  }));

  let ticking = false;
  let scrollY = window.scrollY;

  function update() {
    elements.forEach(({ node, speed }) => {
      const rect = node.getBoundingClientRect();
      // Only update visible nodes
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed * -1;
      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', update);
  update();
})();
