// scripts.js
// Efecto tilt 3D por card (mouse + keyboard focus handling)
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    function rect() { return card.getBoundingClientRect(); }

    function handleMove(e) {
      const r = rect();
      const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
      if (clientX == null || clientY == null) return;

      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      const rotateY = (px - 0.5) * 18;
      const rotateX = (0.5 - py) * 14;
      const scale = card.dataset.scale || 1.02;
      card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    }

    function handleLeave() {
      card.style.transform = '';
    }

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('touchmove', handleMove, {passive:true});
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('blur', handleLeave);

    // Soporte para focus (teclado): aplica una ligera elevación
    card.addEventListener('focus', () => {
      card.style.transform = `translateY(-10px) scale(${card.dataset.scale || 1.02})`;
    });
    card.addEventListener('focusout', handleLeave);
  });
});

