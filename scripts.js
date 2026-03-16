// scripts.js — tilt 3D seguro y responsive
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  const POINTER_SUPPORTED = window.PointerEvent != null;

  function isSmallScreen() {
    return window.matchMedia('(max-width:920px)').matches;
  }
  function isTouchDevice() {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  }

  // Limpia transform inline y listeners previos
  function resetCard(card) {
    card.style.transform = '';
    card.style.transition = '';
    // no asumimos listeners previos; los manejamos por referencia en map
  }

  // Map para guardar handlers y poder removerlos
  const handlersMap = new WeakMap();

  function removeHandlers(card) {
    const h = handlersMap.get(card);
    if (!h) return;
    if (h.move) card.removeEventListener(h.move.event, h.move.fn, h.move.opts);
    if (h.leave) card.removeEventListener('mouseleave', h.leave);
    if (h.pointerleave) card.removeEventListener('pointerleave', h.pointerleave);
    if (h.focus) card.removeEventListener('focus', h.focus);
    if (h.blur) card.removeEventListener('blur', h.blur);
    if (h.touchmove) card.removeEventListener('touchmove', h.touchmove, { passive: true });
    handlersMap.delete(card);
    resetCard(card);
  }

  function attachTilt(card) {
    removeHandlers(card);

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
      // usar requestAnimationFrame para suavizar
      if (card._raf) cancelAnimationFrame(card._raf);
      card._raf = requestAnimationFrame(() => {
        card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      });
    }

    function handleLeave() {
      if (card._raf) cancelAnimationFrame(card._raf);
      card.style.transform = '';
    }

    function handleFocus() {
      const scale = parseFloat(card.dataset.scale) || 1.02;
      card.style.transform = `translateY(-10px) scale(${scale})`;
    }

    if (POINTER_SUPPORTED) {
      card.addEventListener('pointermove', handleMove, { passive: true });
      card.addEventListener('pointerleave', handleLeave);
      card.addEventListener('focus', handleFocus);
      card.addEventListener('blur', handleLeave);
      handlersMap.set(card, {
        move: { event: 'pointermove', fn: handleMove, opts: { passive: true } },
        pointerleave: handleLeave,
        focus: handleFocus,
        blur: handleLeave
      });
    } else {
      card.addEventListener('mousemove', handleMove, { passive: true });
      card.addEventListener('mouseleave', handleLeave);
      card.addEventListener('touchmove', handleMove, { passive: true });
      card.addEventListener('focus', handleFocus);
      card.addEventListener('blur', handleLeave);
      handlersMap.set(card, {
        move: { event: 'mousemove', fn: handleMove, opts: { passive: true } },
        leave: handleLeave,
        touchmove: handleMove,
        focus: handleFocus,
        blur: handleLeave
      });
    }
  }

  function attachSimpleFocus(card) {
    removeHandlers(card);
    function onFocus() {
      const scale = parseFloat(card.dataset.scale) || 1;
      card.style.transform = `translateY(-8px) scale(${scale})`;
    }
    function onBlur() { card.style.transform = ''; }
    card.addEventListener('focus', onFocus);
    card.addEventListener('blur', onBlur);
    handlersMap.set(card, { focus: onFocus, blur: onBlur });
  }

  function init() {
    const disableTilt = isSmallScreen() || isTouchDevice();
    cards.forEach(card => {
      removeHandlers(card);
      resetCard(card);
      if (disableTilt) attachSimpleFocus(card);
      else attachTilt(card);
    });
  }

  // Inicializar y re-evaluar en resize (debounced)
  init();
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // limpiar transforms y re-inicializar
      cards.forEach(c => { c.style.transform = ''; });
      init();
    }, 120);
  });
});
