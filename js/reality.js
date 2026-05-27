/* ═══════════════════════════════════════════════════════════════════
   NOVA · reality.js
   Reality screen — time-of-day mode switching
   • Auto-driven by Bali WITA (UTC+8): morning / day / sunset / night
   • Manual override via .reality__mode buttons (resumes auto after 30s)
   • No observatory ticker, no copy swap — just photo + active button
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  const reality = document.querySelector('.reality');
  if (!reality) return;

  const ORDER = ['morning', 'day', 'sunset', 'night'];
  const modeButtons = reality.querySelectorAll('[data-r-mode-btn]');
  if (!modeButtons.length) return;

  /* ── Bali WITA clock (UTC+8) ─────────────────────────────────────── */
  function witaNow() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 3600 * 1000);
  }

  /* Map WITA hour → mode. Same windows as the hero, kept in sync.
     05–09 morning · 09–17 day · 17–19 sunset · 19–05 night */
  function modeForHour(h) {
    if (h >= 5  && h < 9)  return 'morning';
    if (h >= 9  && h < 17) return 'day';
    if (h >= 17 && h < 19) return 'sunset';
    return 'night';
  }

  /* ── Mode switching ──────────────────────────────────────────────── */
  function activate(mode) {
    if (!ORDER.includes(mode)) return;
    const current = reality.getAttribute('data-mode');
    if (current === mode) return;

    reality.classList.add('is-mode-changing');

    /* Small delay synced to CSS crossfade: data-mode swap triggers
       opacity transitions on the four <picture> renders. */
    setTimeout(() => {
      reality.setAttribute('data-mode', mode);

      modeButtons.forEach(b => {
        const active = b.dataset.rModeBtn === mode;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      requestAnimationFrame(() => reality.classList.remove('is-mode-changing'));
    }, 240);
  }

  /* ── Auto vs. manual mode arbitration ────────────────────────────── */
  const MANUAL_OVERRIDE_MS = 30 * 1000;
  let manualOverrideUntil = 0;

  function maybeAutoSync() {
    if (Date.now() < manualOverrideUntil) return;
    const auto = modeForHour(witaNow().getHours());
    if (reality.getAttribute('data-mode') !== auto) activate(auto);
  }

  /* ── Initialize: set mode by WITA before first paint ─────────────── */
  const startMode = modeForHour(witaNow().getHours());
  reality.setAttribute('data-mode', startMode);
  modeButtons.forEach(b => {
    const active = b.dataset.rModeBtn === startMode;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  /* ── Bind manual override on buttons ─────────────────────────────── */
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      manualOverrideUntil = Date.now() + MANUAL_OVERRIDE_MS;
      activate(btn.dataset.rModeBtn);
      /* Broadcast: keep the hero screen in sync */
      window.dispatchEvent(new CustomEvent('nova:mode', {
        detail: { mode: btn.dataset.rModeBtn, from: 'reality' }
      }));
    });
  });

  /* ── Listen for the other screen's mode change ──────────────────── */
  window.addEventListener('nova:mode', (e) => {
    if (!e.detail || e.detail.from === 'reality') return;
    manualOverrideUntil = Date.now() + MANUAL_OVERRIDE_MS;
    activate(e.detail.mode);
  });

  /* ── Keyboard arrow nav inside the modes list ────────────────────── */
  const modesList = reality.querySelector('.reality__modes-list');
  if (modesList) {
    modesList.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      manualOverrideUntil = Date.now() + MANUAL_OVERRIDE_MS;
      const current = reality.getAttribute('data-mode') || 'sunset';
      const i = ORDER.indexOf(current);
      const next = e.key === 'ArrowRight'
        ? ORDER[(i + 1) % ORDER.length]
        : ORDER[(i - 1 + ORDER.length) % ORDER.length];
      activate(next);
      reality.querySelector(`[data-r-mode-btn="${next}"]`)?.focus();
      window.dispatchEvent(new CustomEvent('nova:mode', {
        detail: { mode: next, from: 'reality' }
      }));
    });
  }

  /* ── Auto-mode tick — check every 5s so 30s override resolves on time ─ */
  setInterval(maybeAutoSync, 5 * 1000);
})();
