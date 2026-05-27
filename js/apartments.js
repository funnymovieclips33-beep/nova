/* ===================================================================
   NOVA · apartments.js
   Type switcher for the Apartment Types screen (Screen 03).
   • Click a .apartments__tab → updates [data-type] on the section
   • Active panel + active floor plan are CSS-driven by data-type
   • Keyboard: ←/→ cycle through the two tabs
   =================================================================== */

(() => {
  const root = document.querySelector('.apartments');
  if (!root) return;

  const TYPES = ['27', '35'];
  const tabs  = root.querySelectorAll('[data-type-btn]');
  if (!tabs.length) return;

  function activate(type) {
    if (!TYPES.includes(type)) return;
    if (root.getAttribute('data-type') === type) return;
    root.setAttribute('data-type', type);
    tabs.forEach(t => {
      const isActive = t.dataset.typeBtn === type;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /* Initial active-class sync (markup is the source of truth via data-type) */
  const initial = root.getAttribute('data-type') || TYPES[0];
  tabs.forEach(t => {
    const isActive = t.dataset.typeBtn === initial;
    t.classList.toggle('is-active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    t.setAttribute('role', 'tab');
  });

  tabs.forEach(t => {
    t.addEventListener('click', () => activate(t.dataset.typeBtn));
  });

  /* Arrow-key nav */
  root.querySelector('.apartments__tabs')?.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const current = root.getAttribute('data-type') || TYPES[0];
    const i = TYPES.indexOf(current);
    const next = e.key === 'ArrowRight'
      ? TYPES[(i + 1) % TYPES.length]
      : TYPES[(i - 1 + TYPES.length) % TYPES.length];
    activate(next);
    root.querySelector(`[data-type-btn="${next}"]`)?.focus();
  });
})();
