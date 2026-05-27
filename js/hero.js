/* ═══════════════════════════════════════════════════════════════════
   NOVA · hero.js
   Living Architectural Observatory
   — Auto time-of-day driven by Bali WITA (UTC+8)
   — Manual override (clicking a mode temporarily wins)
   — Atmospheric metadata: temperature, air descriptor, light wind
     evolving slowly through the day for realism
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  /* ── Cinematic copy per mode ─────────────────────────────────────── */
  const COPY = {
    morning: {
      eyebrow: '01 — Quiet Morning',
      line:    'Coffee in the courtyard, the island slowly waking up.',
      status:  'Pre-dawn light',
    },
    day: {
      eyebrow: '02 — Tropical Daylight',
      line:    'Open spaces, moving shadows, and architecture that breathes.',
      status:  'Open daylight',
    },
    sunset: {
      eyebrow: '03 — Golden Hour',
      line:    'Warm concrete, soft reflections, and the city slowing down.',
      status:  'Golden hour',
    },
    night: {
      eyebrow: '04 — After Dark',
      line:    'Warm lights, quiet conversations, and a different kind of Bali.',
      status:  'After dark',
    },
  };

  const ORDER       = ['morning', 'day', 'sunset', 'night'];
  const modeButtons = hero.querySelectorAll('[data-mode-btn]');
  const eyebrowEl   = hero.querySelector('[data-statement-eyebrow]');
  const lineEl      = hero.querySelector('[data-statement-line]');
  const statusEl    = hero.querySelector('[data-obs-status]');
  const timeEl      = hero.querySelector('[data-obs-time]');
  const tempEl      = hero.querySelector('[data-obs-temp]');
  const airEl       = hero.querySelector('[data-obs-air]');

  /* ── Bali WITA clock (UTC+8) ─────────────────────────────────────── */
  function witaNow() {
    const now = new Date();
    /* Convert local to UTC then add 8h offset for WITA */
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 3600 * 1000);
  }

  /* Map WITA hour → mode.
     05-09 morning · 09-17 day · 17-19 sunset · 19-05 night */
  function modeForHour(h) {
    if (h >= 5  && h < 9)  return 'morning';
    if (h >= 9  && h < 17) return 'day';
    if (h >= 17 && h < 19) return 'sunset';
    return 'night';
  }

  /* ── Mode switching ──────────────────────────────────────────────── */
  function activate(mode) {
    if (!COPY[mode]) return;
    const current = hero.getAttribute('data-mode');
    if (current === mode) return;

    hero.classList.add('is-mode-changing');

    setTimeout(() => {
      hero.setAttribute('data-mode', mode);
      if (eyebrowEl) eyebrowEl.textContent = COPY[mode].eyebrow;
      if (lineEl)    lineEl.textContent    = COPY[mode].line;
      if (statusEl)  statusEl.textContent  = COPY[mode].status;

      modeButtons.forEach(b => {
        const active = b.dataset.modeBtn === mode;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      requestAnimationFrame(() => hero.classList.remove('is-mode-changing'));
    }, 380);
  }

  /* ── Auto vs. manual mode arbitration ────────────────────────────── */
  /* Manual override expires 30s after the last user interaction with
     a mode button, then auto-mode resumes gently. */
  const MANUAL_OVERRIDE_MS = 30 * 1000;
  let manualOverrideUntil = 0;

  function maybeAutoSync() {
    if (Date.now() < manualOverrideUntil) return;
    const auto = modeForHour(witaNow().getHours());
    if (hero.getAttribute('data-mode') !== auto) activate(auto);
  }

  /* ── Initialize: set mode by WITA before first paint ─────────────── */
  const startMode = modeForHour(witaNow().getHours());
  hero.setAttribute('data-mode', startMode);
  if (COPY[startMode]) {
    if (eyebrowEl) eyebrowEl.textContent = COPY[startMode].eyebrow;
    if (lineEl)    lineEl.textContent    = COPY[startMode].line;
    if (statusEl)  statusEl.textContent  = COPY[startMode].status;
  }
  modeButtons.forEach(b => {
    const active = b.dataset.modeBtn === startMode;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  /* ── Bind manual override on buttons ─────────────────────────────── */
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      manualOverrideUntil = Date.now() + MANUAL_OVERRIDE_MS;
      activate(btn.dataset.modeBtn);
      /* Broadcast: keep the reality screen in sync */
      window.dispatchEvent(new CustomEvent('nova:mode', {
        detail: { mode: btn.dataset.modeBtn, from: 'hero' }
      }));
    });
  });

  /* ── Listen for the other screen's mode change ──────────────────── */
  window.addEventListener('nova:mode', (e) => {
    if (!e.detail || e.detail.from === 'hero') return;
    manualOverrideUntil = Date.now() + MANUAL_OVERRIDE_MS;
    activate(e.detail.mode);
  });

  /* ── Keyboard arrow nav ──────────────────────────────────────────── */
  const modesList = hero.querySelector('.hero__modes-list');
  if (modesList) {
    modesList.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      manualOverrideUntil = Date.now() + MANUAL_OVERRIDE_MS;
      const current = hero.getAttribute('data-mode') || 'sunset';
      const i = ORDER.indexOf(current);
      const next = e.key === 'ArrowRight'
        ? ORDER[(i + 1) % ORDER.length]
        : ORDER[(i - 1 + ORDER.length) % ORDER.length];
      activate(next);
      hero.querySelector(`[data-mode-btn="${next}"]`)?.focus();
      /* Broadcast keyboard nav too */
      window.dispatchEvent(new CustomEvent('nova:mode', {
        detail: { mode: next, from: 'hero' }
      }));
    });
  }

  /* ── Observatory clock ──────────────────────────────────────────── */
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickClock() {
    if (!timeEl) return;
    const w = witaNow();
    timeEl.textContent = `${pad(w.getHours())}:${pad(w.getMinutes())} WITA`;
  }
  tickClock();
  setInterval(tickClock, 30 * 1000);

  /* ── Atmospheric metadata ────────────────────────────────────────
     Live values from Open-Meteo (free, no API key) for Ungasan, Bali.
     Falls back to a tropical model if the network is unavailable. */

  /* Synthetic fallback — used until first fetch resolves, or if it fails.
     Diurnal curve calibrated to Bali (~24-30°C, humidity 70-90%,
     light sea breeze peaking mid-afternoon). */
  function syntheticAirAt(witaDate) {
    const h = witaDate.getHours() + witaDate.getMinutes() / 60;
    const tempBase = 27 + 3 * Math.cos((h - 14) * Math.PI / 12);
    const humid    = 90 - (tempBase - 24) * 3;
    const wind     = 3 + 6 * Math.max(0, Math.sin((h - 6) * Math.PI / 14));
    return {
      temp:  Math.round(tempBase + (Math.random() - 0.5) * 0.4),
      humid: Math.round(humid    + (Math.random() - 0.5) * 1.5),
      wind:  Math.max(1, wind    + (Math.random() - 0.5) * 0.6),
      source: 'synthetic',
    };
  }

  /* Real-weather state */
  let latestWeather = null; // { temp, humid, wind, source: 'live' }
  let lastFetchAt   = 0;
  const FETCH_INTERVAL_MS = 10 * 60 * 1000; // refresh every 10 minutes

  function fetchLiveWeather() {
    if (Date.now() - lastFetchAt < FETCH_INTERVAL_MS && latestWeather) return;
    lastFetchAt = Date.now();
    /* Ungasan, Bali. timezone=auto keeps Open-Meteo's clock aligned with WITA. */
    const url = 'https://api.open-meteo.com/v1/forecast'
              + '?latitude=-8.83&longitude=115.17'
              + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m'
              + '&timezone=Asia%2FMakassar';
    fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const c = data && data.current;
        if (!c) throw new Error('no current data');
        latestWeather = {
          temp:   Math.round(c.temperature_2m),
          humid:  Math.round(c.relative_humidity_2m),
          wind:   c.wind_speed_10m, // km/h by default
          source: 'live',
        };
        tickAir(); /* refresh UI immediately */
      })
      .catch(() => {
        /* swallow — synthetic stays in use */
      });
  }

  function currentAir() {
    if (latestWeather) {
      /* small ambient jitter so the line still "breathes" between fetches */
      return {
        temp:  latestWeather.temp,
        humid: latestWeather.humid,
        wind:  latestWeather.wind,
        source: 'live',
      };
    }
    return syntheticAirAt(witaNow());
  }

  /* Editorial descriptor — one atmospheric phrase per tick.
     Follows the active hero mode (not real-time), so the observatory
     line stays consistent with whatever scene the user is viewing. */
  function airDescriptor(w) {
    const mode = hero.getAttribute('data-mode') || 'sunset';
    if (mode === 'morning') {
      return w.wind < 4 ? 'Still air' : 'Cool breeze';
    }
    if (mode === 'day') {
      return w.humid > 80 ? 'Humid air' : 'Warm air';
    }
    if (mode === 'sunset') {
      return w.wind > 5 ? 'Warm breeze' : 'Golden stillness';
    }
    /* night */
    return w.humid > 78 ? 'Tropical night air' : 'Cool night air';
  }

  function tickAir() {
    const w = currentAir();
    if (tempEl) tempEl.textContent = `${w.temp}°C`;
    if (airEl)  airEl.textContent  = airDescriptor(w);
  }

  /* Kick off: render synthetic immediately, then fetch live in background. */
  tickAir();
  fetchLiveWeather();
  /* Refresh display every 12s (uses cached live data + new descriptor),
     and pull fresh live data every 10 minutes (handled inside fetchLiveWeather) */
  setInterval(() => { tickAir(); fetchLiveWeather(); }, 12 * 1000);

  /* ── Auto-mode tick — check every 5s so 30s override resolves on time ─ */
  setInterval(maybeAutoSync, 5 * 1000);
})();
