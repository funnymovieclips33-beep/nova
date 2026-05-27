/* ===================================================================
   NOVA · facilities.js
   Facilities slider (Screen 05).
   • Seven facilities, all photos and text panels rendered upfront.
   • Only the active one is visible (CSS-driven via data-active-facility).
   • Click an icon at the bottom to switch.
   • Keyboard ←/→ cycles through the icons row.
   =================================================================== */

(() => {
  const root = document.querySelector('.facilities');
  if (!root) return;

  const FACILITIES = ['pool', 'gym', 'parking', 'cafe', 'rooftop', 'relax', 'coworking'];
  const icons = root.querySelectorAll('[data-facility-btn]');
  if (!icons.length) return;

  function activate(id) {
    if (!FACILITIES.includes(id)) return;
    if (root.getAttribute('data-active-facility') === id) return;
    root.setAttribute('data-active-facility', id);
    icons.forEach(btn => {
      const isActive = btn.dataset.facilityBtn === id;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('role', 'tab');
    });
  }

  /* Initial active-class sync */
  const initial = root.getAttribute('data-active-facility') || FACILITIES[0];
  icons.forEach(btn => {
    const isActive = btn.dataset.facilityBtn === initial;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('role', 'tab');
  });

  /* Click handlers */
  icons.forEach(btn => {
    btn.addEventListener('click', () => activate(btn.dataset.facilityBtn));
  });

  /* Arrow-key navigation on the icons row */
  root.querySelector('.facilities__icons')?.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const current = root.getAttribute('data-active-facility') || FACILITIES[0];
    const i = FACILITIES.indexOf(current);
    const next = e.key === 'ArrowRight'
      ? FACILITIES[(i + 1) % FACILITIES.length]
      : FACILITIES[(i - 1 + FACILITIES.length) % FACILITIES.length];
    activate(next);
    root.querySelector(`[data-facility-btn="${next}"]`)?.focus();
  });
})();
