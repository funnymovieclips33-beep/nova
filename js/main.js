/* ===================================================================
   NOVA · main.js
   Orchestration, form handling, miscellaneous wiring
   =================================================================== */
(function () {
  'use strict';

  /* ── CTA form submission (graceful demo handler) ─────────────── */
  const form = document.querySelector('[data-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const note = form.querySelector('.cta__form-note');
      if (!submitBtn) return;

      const originalText = submitBtn.querySelector('span:first-child')?.textContent;
      const labelEl = submitBtn.querySelector('span:first-child');
      const arrowEl = submitBtn.querySelector('.btn__arrow');

      if (labelEl) labelEl.textContent = 'Sending...';
      if (arrowEl) arrowEl.textContent = '·';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      // Simulate request — in production, replace with real endpoint / WP REST
      window.setTimeout(() => {
        if (labelEl) labelEl.textContent = 'Thank you';
        if (arrowEl) arrowEl.textContent = '✓';
        if (note) note.textContent = "We'll be in touch shortly.";

        window.setTimeout(() => {
          form.reset();
          if (labelEl) labelEl.textContent = originalText || 'Begin Conversation';
          if (arrowEl) arrowEl.textContent = '→';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          if (note) note.textContent = 'We reply within 24 hours.';
        }, 4000);
      }, 1200);
    });
  }

  /* ── Set viewport height var (iOS safari address bar fix) ───── */
  function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);

  /* ── Mark page as loaded for any post-load CSS hooks ─────────── */
  window.addEventListener('load', () => {
    document.documentElement.classList.add('is-loaded');
  });
})();
