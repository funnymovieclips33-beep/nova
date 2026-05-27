/* ===================================================================
   NOVA · access.js
   "Private Access" modal.
   • Triggered by .reality__cta (the View Live Feed button)
   • Closed by × button, backdrop click, or Escape — always available
   • Any submission resolves to "Access denied"; empty submission
     just shakes the field
   • Restores focus to the trigger on close
   =================================================================== */

(() => {
  const modal     = document.querySelector('[data-access-modal]');
  const trigger   = document.querySelector('.reality__cta');
  if (!modal || !trigger) return;

  const panel     = modal.querySelector('.access-modal__panel');
  const form      = modal.querySelector('[data-access-form]');
  const input     = modal.querySelector('[data-access-input]');
  const errorEl   = modal.querySelector('[data-access-error]');
  const closeBtns = modal.querySelectorAll('[data-access-close]');

  let lastFocused = null;

  /* ── Open / close ─────────────────────────────────────────────── */
  function open() {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-access-open');
    /* Focus the input once the panel has settled — feels less jarring */
    setTimeout(() => input?.focus({ preventScroll: true }), 360);
  }

  function close() {
    modal.classList.remove('is-open', 'is-denied');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-access-open');
    if (errorEl) errorEl.setAttribute('aria-hidden', 'true');
    if (input)   { input.value = ''; input.classList.remove('is-shake'); }
    /* Send focus back to whatever opened the modal */
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  /* ── Wire the trigger button ──────────────────────────────────── */
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });

  /* ── Wire all close affordances (× button + backdrop) ──────────── */
  closeBtns.forEach(el => el.addEventListener('click', close));

  /* ── "Request a viewing" — close modal, then smooth-scroll to #cta ── */
  const jumpLink = modal.querySelector('[data-access-jump]');
  if (jumpLink) {
    jumpLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#cta');
      close();
      /* Let the closing animation finish before scrolling so the
         scroll happens on a fully-unlocked body. */
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 320);
      }
    });
  }

  /* ── Escape key always closes (even from inside the input) ─────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      e.preventDefault();
      close();
    }
  });

  /* ── Submission: any input → access denied; empty → shake ──────── */
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();

      if (!value) {
        /* Empty — nudge the field but don't show denial copy */
        input.classList.remove('is-shake');
        /* Reflow so the animation can restart if user submits twice */
        void input.offsetWidth;
        input.classList.add('is-shake');
        input.focus({ preventScroll: true });
        return;
      }

      /* Any non-empty value → access denied */
      modal.classList.add('is-denied');
      errorEl?.setAttribute('aria-hidden', 'false');
      input.classList.remove('is-shake');
      void input.offsetWidth;
      input.classList.add('is-shake');
    });

    /* Typing after a denial clears the red state so the user can retry */
    input.addEventListener('input', () => {
      if (modal.classList.contains('is-denied')) {
        modal.classList.remove('is-denied');
        errorEl?.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ── Light focus trap: Tab cycles between focusable elements ───── */
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    const focusables = panel?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables || !focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
