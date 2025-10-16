// desktop+mobile carousel with background luminance detection to invert contact nav
(function () {
  const carousel = document.querySelector('.about-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  if (!slides.length) return;

  let idx = 0;
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));

  // show slide and update body theme based on its brightness
  async function show(index) {
    idx = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    const src = slides[idx].getAttribute('data-src') || extractUrlFromBg(slides[idx].style.backgroundImage);
    const isDark = await isImageDark(src).catch(() => false);
    document.body.classList.toggle('about-dark', !!isDark);
    document.body.classList.toggle('about-light', !isDark);
  }

  function extractUrlFromBg(bg) {
    if (!bg) return '';
    const m = bg.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : '';
  }

  // determine whether image is dark by sampling a small canvas
  function isImageDark(src, sample = 40, threshold = 140) {
    return new Promise((resolve, reject) => {
      if (!src) return resolve(false);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = sample;
          const h = sample;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          // draw scaled image to sample
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let total = 0;
          const len = data.length / 4;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            // luminance (Rec. 709)
            total += 0.2126 * r + 0.7152 * g + 0.0722 * b;
          }
          const avg = total / len;
          resolve(avg < threshold); // dark if avg luminance below threshold
        } catch (err) {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = src;
      // if cached, onload fires synchronously in some engines
    });
  }

  const btnPrev = document.getElementById('about-prev');
  const btnNext = document.getElementById('about-next');
  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });

  // keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // preload images
  slides.forEach(s => {
    const src = s.getAttribute('data-src') || extractUrlFromBg(s.style.backgroundImage);
    if (src) {
      const i = new Image();
      i.src = src;
    }
  });

  // init theme based on initial slide
  show(idx);

  // re-init on resize if needed (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { show(idx); }, 150);
  });
})();