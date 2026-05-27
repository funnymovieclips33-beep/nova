/* ===================================================================
   NOVA · tour.js
   Universal controller for any number of .tour sections on the page.
   Each section is set up independently — its data-active-type and
   data-active-room are scoped to itself.

   • If the section has type tabs ([data-tour-type].tour__type-tab),
     they're treated as the apartment-type switcher and the rooms are
     scoped per type (CSS hides the ones that don't match).
   • If no type tabs, the section behaves as a flat list of rooms
     (Common-Areas tour). The first room is activated initially.
   • Click-to-enter overlay fades on first interaction.
   =================================================================== */

(() => {
  document.querySelectorAll('.tour').forEach(setupTour);

  function setupTour(root) {
    const iframe   = root.querySelector('[data-tour-iframe]');
    const overlay  = root.querySelector('[data-tour-enter]');
    const typeTabs = root.querySelectorAll('[data-tour-type].tour__type-tab');
    const roomTabs = root.querySelectorAll('[data-tour-room]');
    if (!iframe) return;

    const hasTypes = typeTabs.length > 0;

    /* ── Sync visual active state on a set of buttons ─────────────── */
    function syncActive(buttons, attr, value) {
      buttons.forEach(btn => {
        const isActive = btn.dataset[attr] === value;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('role', 'tab');
      });
    }

    /* ── Resolve & load the current room's URL ────────────────────── */
    function loadActiveRoomUrl() {
      const room = root.getAttribute('data-active-room');
      if (!room) return;
      let btn;
      if (hasTypes) {
        const type = root.getAttribute('data-active-type');
        btn = root.querySelector(
          `[data-tour-room="${room}"][data-tour-type="${type}"]`
        );
      } else {
        btn = root.querySelector(`[data-tour-room="${room}"]`);
      }
      const url = btn?.dataset.tourUrl;
      if (url && iframe.src !== url) iframe.src = url;
    }

    /* ── Room activation ──────────────────────────────────────────── */
    function activateRoom(room) {
      root.setAttribute('data-active-room', room);
      syncActive(roomTabs, 'tourRoom', room);
      loadActiveRoomUrl();
      /* New tour loaded → re-show the overlay for fresh engagement */
      root.classList.remove('is-entered');
    }

    /* ── Type activation (only when type-tabs exist) ──────────────── */
    function activateType(type) {
      root.setAttribute('data-active-type', type);
      syncActive(typeTabs, 'tourType', type);
      /* Keep the current room if it exists in the new type;
         otherwise fall back to the new type's first room. */
      const currentRoom = root.getAttribute('data-active-room');
      const stillExists = root.querySelector(
        `[data-tour-type="${type}"][data-tour-room="${currentRoom}"]`
      );
      if (stillExists) {
        activateRoom(currentRoom);
      } else {
        const firstBtn = root.querySelector(`[data-tour-type="${type}"][data-tour-room]`);
        if (firstBtn) activateRoom(firstBtn.dataset.tourRoom);
      }
    }

    /* ── Initial state from markup ────────────────────────────────── */
    if (hasTypes) {
      syncActive(typeTabs, 'tourType',
        root.getAttribute('data-active-type') || typeTabs[0].dataset.tourType);
    }
    syncActive(roomTabs, 'tourRoom',
      root.getAttribute('data-active-room') ||
      (roomTabs[0] && roomTabs[0].dataset.tourRoom));
    loadActiveRoomUrl();

    /* ── Wire the tab buttons ─────────────────────────────────────── */
    if (hasTypes) {
      typeTabs.forEach(btn => {
        btn.addEventListener('click', () => activateType(btn.dataset.tourType));
      });
      /* Keyboard ←/→ on the type-tabs row */
      root.querySelector('.tour__type-tabs')?.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const TYPES = Array.from(typeTabs).map(t => t.dataset.tourType);
        const current = root.getAttribute('data-active-type') || TYPES[0];
        const i = TYPES.indexOf(current);
        const next = e.key === 'ArrowRight'
          ? TYPES[(i + 1) % TYPES.length]
          : TYPES[(i - 1 + TYPES.length) % TYPES.length];
        activateType(next);
        root.querySelector(`[data-tour-type="${next}"].tour__type-tab`)?.focus();
      });
    }

    roomTabs.forEach(btn => {
      btn.addEventListener('click', () => activateRoom(btn.dataset.tourRoom));
    });

    /* ── Click-to-enter overlay ───────────────────────────────────── */
    if (overlay) {
      overlay.addEventListener('click', () => {
        root.classList.add('is-entered');
        try { iframe.focus({ preventScroll: true }); } catch (_) {}
      });
    }
  }
})();
