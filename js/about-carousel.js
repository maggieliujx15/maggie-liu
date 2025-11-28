// Simple about page carousel (brightness detection removed)
(function () {
  const carousel = document.querySelector('.about-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  if (!slides.length) return;

  let idx = 0;
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));

  function extractUrlFromBg(bg) {
    if (!bg) return '';
    const m = bg.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : '';
  }

  function show(index) {
    idx = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  }

  const btnPrev = document.getElementById('about-prev');
  const btnNext = document.getElementById('about-next');
  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // preload images
  slides.forEach(s => {
    const src = s.getAttribute('data-src') || extractUrlFromBg(s.style.backgroundImage);
    if (src) { const i = new Image(); i.src = src; }
  });

  // init
  show(idx);

  // re-init on resize (debounced) to keep visibility behavior consistent
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { show(idx); }, 150);
  });
})();