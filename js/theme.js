/* ===================================================================
   NOVA · theme.js
   Global light / dark theme for the LOWER sections (cta, footer).
   Hero and Reality stay on their own mode system — they don't react
   to this theme attribute.

   Rules:
   • Theme follows the active time-of-day mode by default:
       morning, day, sunset → light
       night                → dark
   • Listens to the shared `nova:mode` event broadcast by hero.js and
     reality.js, so flipping a mode button on either screen also
     re-syncs this lower-section theme.
   • Manual override via the floating .theme-toggle button.  Once
     manually set, mode changes will NOT overwrite the choice — the
     user is in control until they explicitly click another mode tile.
   =================================================================== */

(() => {
  const body   = document.body;
  const toggle = document.querySelector('[data-theme-toggle]');

  /* ── Mode → theme mapping ──────────────────────────────────────── */
  function modeToTheme(mode) {
    return mode === 'night' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    body.dataset.theme = theme;
  }

  /* ── Initial state — read whatever mode the hero starts with ────── */
  const startMode =
    document.querySelector('.hero')?.getAttribute('data-mode')
    || document.querySelector('.reality')?.getAttribute('data-mode')
    || 'night';
  applyTheme(modeToTheme(startMode));

  /* Manual toggle: flips current theme. The next mode-button click
     will re-sync the theme to the mode, so manual overrides are
     "sticky until the next deliberate scene change". */
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = body.dataset.theme || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* React to mode changes. `nova:mode` is only ever dispatched on
     deliberate user interaction (button clicks, keyboard nav) — auto
     WITA-driven mode changes do NOT dispatch it, so an existing
     manual theme override is respected until the user makes a new
     scene choice. */
  window.addEventListener('nova:mode', (e) => {
    if (!e.detail) return;
    applyTheme(modeToTheme(e.detail.mode));
  });

  /* ── Toggle visibility — show once the first lower-themed section
       enters or is scrolled past. We observe `.apartments` instead of
       `.cta` because Apartments is the FIRST section that needs the
       toggle; once it's been reached, the toggle stays for everything
       below (CTA, footer). ─────────────────────────────────────────── */
  const firstLowerSection = document.querySelector('.apartments')
    || document.querySelector('.cta');
  if (toggle && firstLowerSection) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          /* Show as soon as the section's top edge enters the viewport;
             keep showing for everything below as well (top < 0). */
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            toggle.classList.add('is-visible');
          } else {
            toggle.classList.remove('is-visible');
          }
        });
      },
      { rootMargin: '0px 0px -20% 0px', threshold: 0 }
    );
    io.observe(firstLowerSection);
  }
})();
