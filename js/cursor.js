/* ===================================================================
   NOVA · cursor.js
   Custom luxury cursor — desktop only, gated by hover capability
   =================================================================== */
(function () {
  'use strict';

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsHover) return;

  const cursor = document.querySelector('.nova-cursor');
  if (!cursor) return;

  const dot  = cursor.querySelector('.nova-cursor__dot');
  const ring = cursor.querySelector('.nova-cursor__ring');

  document.body.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot follows immediately for snappy precision
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  // Ring eases toward the cursor for organic feel
  function tick() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  // Hover targets
  const hoverTargets = document.querySelectorAll(
    '[data-cursor-hover], a, button, input, textarea, select, [role="button"]'
  );

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '';
    ring.style.opacity = '';
  });
})();
