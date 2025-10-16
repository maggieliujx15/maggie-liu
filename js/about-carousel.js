// Simple desktop-only carousel for about page background images
(function () {
  const isDesktop = () => window.matchMedia && window.matchMedia('(min-width:1024px)').matches;
  if (!isDesktop()) return;

  const carousel = document.querySelector('.about-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  if (!slides.length) return;

  let idx = 0;
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));

  function show(index) {
    idx = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  }

  const btnPrev = document.getElementById('about-prev');
  const btnNext = document.getElementById('about-next');

  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });

  // keyboard support (left / right)
  document.addEventListener('keydown', (e) => {
    if (!isDesktop()) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // preload images (so transitions are smooth)
  slides.forEach(s => {
    const src = s.getAttribute('data-src') || '';
    if (src) {
      const img = new Image();
      img.src = src;
    }
  });

  // re-init on resize if breakpoint changes
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!isDesktop()) {
        // hide carousel if leaving desktop
        carousel.style.display = 'none';
      } else {
        carousel.style.display = '';
      }
    }, 150);
  });
})();