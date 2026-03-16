// scripts.js
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  let activeListeners = new Map();

  const isSmallScreen = () => window.matchMedia('(max-width:520px)').matches;
  const isTouch = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const supportsPointer = window.PointerEvent != null;

  function clearListeners(card) {
    const data = activeListeners.get(card);
    if (!data) return;
    if (data.move) card.removeEventListener(data.move.type, data.move.handler, data.move.opts);
    if (data.leave) card.removeEventListener('mouseleave', data.leave);
    if (data.blur) card.removeEventListener('blur', data.blur);
    if (data.focus) card.removeEventListener('focus', data.focus);
    activeListeners.delete(card);
    card.style.transform = '';
  }

  function attachTilt(card) {
    clearListeners(card);

    function rect() { return card.getBoundingClientRect(); }

    function handleMove(e) {
      const r = rect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
      if (clientX == null || clientY == null) return;
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      const rotateY = (px - 0.5) * 18;
      const rotateX = (0.5 - py) * 14;
      const scale = parseFloat(card.dataset.scale) || 1.02;
      card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    }

    function handleLeave() { card.style.transform = ''; }

    function handleFocus() {
      const scale = parseFloat(card.dataset.scale) || 1.02;
      card.style.transform = `translateY(-10px) scale(${scale})`;
    }

    // Prefer pointer events when available
    if (supportsPointer) {
      card.addEventListener('pointermove', handleMove);
      card.addEventListener('pointerleave', handleLeave);
      card.addEventListener('focus', handleFocus);
      card.addEventListener('blur', handleLeave);
      activeListeners.set(card, {
        move: { type: 'pointermove', handler: handleMove, opts: { passive: true } },
        leave: handleLeave,
        blur: handleLeave,
        focus: handleFocus
      });
    } else {
      // fallback to mouse/touch
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('touchmove', handleMove, { passive: true });
      card.addEventListener('mouseleave', handleLeave);
      card.addEventListener('focus', handleFocus);
      card.addEventListener('blur', handleLeave);
      activeListeners.set(card, {
        move: { type: 'mousemove', handler: handleMove, opts: { passive: true } },
        leave: handleLeave,
        blur: handleLeave,
        focus: handleFocus
      });
    }
  }

  function attachSimpleFocus(card) {
    clearListeners(card);
    function onFocus() {
      const scale = parseFloat(card.dataset.scale) || 1;
      card.style.transform = `translateY(-8px) scale(${scale})`;
    }
    function onBlur() { card.style.transform = ''; }
    card.addEventListener('focus', onFocus);
    card.addEventListener('blur', onBlur);
    activeListeners.set(card, { focus: onFocus, blur: onBlur });
  }

  function init() {
    const small = isSmallScreen();
    const touch = isTouch();
    cards.forEach(card => {
      clearListeners(card);
      if (small || touch) {
        attachSimpleFocus(card);
      } else {
        attachTilt(card);
      }
    });
  }

  // Inicializar
  init();

  // Re-evaluar al redimensionar (debounced)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // limpiar transform inline y re-inicializar listeners según nuevo tamaño
      cards.forEach(c => c.style.transform = '');
      init();
    }, 120);
  });
});

