/* ===================================================================
   NOVA · preloader.js
   Smooth 1 → 100% progress driven by actual hero asset loading.
   • Tracks the four <img> tags inside .hero__render — these are the
     heaviest assets and represent "the first screen is loaded".
   • Bar increments smoothly: time-eased ramp acts as a ceiling, real
     load fraction acts as a floor. Neither alone can complete the bar.
   • Holds the final 100% briefly, then fades the overlay out.

   DEBUG: add `?slow=N` to the URL to delay the LAST hero image's
   "loaded" event by N seconds (capped 30). Lets you watch the
   waiting state without DevTools throttling. Example: index.html?slow=5
   =================================================================== */
(() => {
  const pre = document.querySelector('[data-preloader]');
  if (!pre) return;

  const bar    = pre.querySelector('[data-preloader-bar]');
  const pctEl  = pre.querySelector('[data-preloader-percent]');

  const MIN_DURATION  = 1800;  // ms — minimum visual ramp time
  const HOLD_AT_FULL  = 420;   // ms — pause at 100% before fade
  const FADE_DURATION = 900;   // ms — must match CSS opacity transition
  const SAFETY_LIMIT  = 10000; // ms — hard ceiling on waiting

  /* Debug delay: ?slow=N seconds, applied to the last hero image */
  const slowParam = new URLSearchParams(location.search).get('slow');
  const FAKE_DELAY_MS = Math.max(0, Math.min(30, parseInt(slowParam || '0', 10))) * 1000;

  /* ── Track hero image assets ──────────────────────────────────── */
  const heroImages = Array.from(document.querySelectorAll('.hero__render img'));
  const totalAssets = heroImages.length || 1;
  let loadedAssets = 0;

  function bumpLoaded() { loadedAssets = Math.min(totalAssets, loadedAssets + 1); }

  heroImages.forEach((img, i) => {
    const isLast = (i === heroImages.length - 1);
    const onDone = () => {
      if (isLast && FAKE_DELAY_MS > 0) setTimeout(bumpLoaded, FAKE_DELAY_MS);
      else bumpLoaded();
    };
    if (img.complete && img.naturalWidth > 0) {
      onDone();
    } else {
      img.addEventListener('load',  onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
    }
  });

  /* ── Animation loop ──────────────────────────────────────────── */
  let displayed = 1;   // start at 1% so the bar feels alive immediately
  let finished  = false;
  const start = performance.now();

  function tick() {
    if (finished) return;

    const elapsed = performance.now() - start;
    const t = Math.min(elapsed / MIN_DURATION, 1);
    /* Ease-out: confident fast start, gentle finish */
    const timeEased = 1 - Math.pow(1 - t, 2.2);
    const loadFrac  = loadedAssets / totalAssets;

    /* The bar can never exceed either the time-ramp OR the actual
       load progress — whichever is more conservative. Both must be
       at 100% for the bar to complete. */
    let target = Math.min(timeEased, loadFrac) * 100;

    /* Once minimum time has elapsed AND everything is loaded,
       unlock the final 100% snap */
    if (t >= 1 && loadFrac >= 1) target = 100;

    /* Smooth catch-up: independent of frame rate, feels organic */
    displayed += (target - displayed) * 0.14;
    const rounded = Math.max(1, Math.min(100, Math.round(displayed)));

    if (bar)   bar.style.width = `${rounded}%`;
    if (pctEl) pctEl.textContent = `${rounded}%`;

    if (loadFrac >= 1 && t >= 1 && displayed >= 99.4) {
      finished = true;
      if (bar)   bar.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      setTimeout(() => {
        pre.classList.add('is-done');
        document.body.classList.remove('is-loading');
        setTimeout(() => pre.remove(), FADE_DURATION + 60);
      }, HOLD_AT_FULL);
      return;
    }

    requestAnimationFrame(tick);
  }

  /* Safety: if any image stalls (broken / 404 / network down),
     force-complete so the user is never stuck on the splash. */
  setTimeout(() => { loadedAssets = totalAssets; }, SAFETY_LIMIT + FAKE_DELAY_MS);

  requestAnimationFrame(tick);
})();
