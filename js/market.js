/* ===================================================================
   NOVA · market.js
   Yield-by-market bar chart (Screen 07).
   On scroll-in, add .is-charted on the chart container.  CSS then
   transitions the bar widths from 0 to their --bar-target with the
   per-row --bar-delay cascade.
   =================================================================== */

(() => {
  const chart = document.querySelector('[data-market-chart]');
  if (!chart) return;

  /* Respect users who don't want motion */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    chart.classList.add('is-charted');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        chart.classList.add('is-charted');
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });

  io.observe(chart);
})();
