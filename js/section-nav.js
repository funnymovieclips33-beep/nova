/* ===================================================================
   NOVA · section-nav.js
   Right-side floating section indicator.

   Desktop
   • Numbers 01-08 stacked. IntersectionObserver-free: on scroll we
     find the section whose center is nearest the viewport center,
     and mark its link .is-active.
   • The nav itself is semi-transparent by default — hovering it
     turns it into a glass card (CSS-driven).

   Mobile (≤720px)
   • Nav collapses to a fullscreen overlay opened by [data-section-nav-toggle].
   • The toggle morphs hamburger ↔ X via .is-open class.
   • Clicking any link closes the overlay + smooth-scrolls.
   • ESC closes the overlay too.
   =================================================================== */

(() => {
  const nav    = document.querySelector('[data-section-nav]');
  const toggle = document.querySelector('[data-section-nav-toggle]');
  if (!nav) return;

  const links    = Array.from(nav.querySelectorAll('[data-section-link]'));
  const sections = links
    .map(link => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);
  if (!sections.length) return;

  /* ── Active state tracking ────────────────────────────────────── */
  function setActive(id) {
    links.forEach(link => {
      const isActive = link.dataset.sectionLink === id;
      link.classList.toggle('is-active', isActive);
      link.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function pickActiveSection() {
    const center = window.innerHeight / 2;
    let bestId = null;
    let bestDist = Infinity;
    sections.forEach(sec => {
      const r = sec.getBoundingClientRect();
      const c = r.top + r.height / 2;
      const dist = Math.abs(c - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = sec.id;
      }
    });
    if (bestId) setActive(bestId);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      pickActiveSection();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  pickActiveSection();

  /* ── Mobile open / close ──────────────────────────────────────── */
  function openMenu() {
    nav.classList.add('is-open');
    if (toggle) {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close section menu');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('is-open');
    if (toggle) {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open section menu');
    }
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (nav.classList.contains('is-open')) closeMenu();
    else openMenu();
  }

  if (toggle) {
    toggle.addEventListener('click', toggleMenu);
  }

  /* ESC closes the overlay (mobile) */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* Resizing past the mobile breakpoint while open → close */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ── Smooth-scroll on click + auto-close on mobile ───────────── */
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.dataset.sectionLink;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      /* Close the menu first so the body-overflow lock is lifted
         before we ask the browser to scroll. */
      const wasOpen = nav.classList.contains('is-open');
      if (wasOpen) closeMenu();
      /* Slight delay so the overlay fades out cleanly before scroll */
      const scrollFn = () => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(targetId);
      };
      if (wasOpen) {
        setTimeout(scrollFn, 280);
      } else {
        scrollFn();
      }
    });
  });
})();
