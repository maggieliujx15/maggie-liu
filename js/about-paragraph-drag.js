// Free 2D drag using CSS transform (translate) to avoid layout/top constraints
if (!window.__aboutParagraphDragInitialized) {
  window.__aboutParagraphDragInitialized = true;

  (function () {
    const SELECTOR = '.about-paragraph';
    let el = null;
    let dragging = false;
    let moved = false;
    let startClientX = 0, startClientY = 0;
    let startTX = 0, startTY = 0;
    let pointerId = null;
    const DRAG_THRESHOLD = 5; // pixels

    function getEl() {
      if (!el) el = document.querySelector(SELECTOR);
      return el;
    }

    function parseTranslate(transform) {
      if (!transform || transform === 'none') return { x: 0, y: 0 };
      const m = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
      if (!m) return { x: 0, y: 0 };
      const vals = m[1].split(',').map(n => parseFloat(n));
      if (vals.length === 6) return { x: vals[4] || 0, y: vals[5] || 0 };
      if (vals.length >= 14) return { x: vals[12] || 0, y: vals[13] || 0 };
      return { x: 0, y: 0 };
    }

    function restorePositionFromStorage() {
      const e = getEl();
      if (!e) return;
      try {
        const saved = localStorage.getItem('aboutParagraphTranslate');
        if (saved) {
          const { x, y } = JSON.parse(saved);
          e.style.transform = `translate(${x}px, ${y}px)`;
          e.dataset._tx = x;
          e.dataset._ty = y;
          if (getComputedStyle(e).position === 'static') e.style.position = 'absolute';
        }
      } catch (err) {}
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      const e = getEl();
      if (!e) return;
      e.style.willChange = 'transform';
      e.style.touchAction = 'none';
    });

    document.addEventListener('pointerdown', (ev) => {
      const target = ev.target.closest && ev.target.closest(SELECTOR);
      if (!target) return;
      if (ev.button && ev.button !== 0) return;

      el = target;
      if (getComputedStyle(el).position === 'static') el.style.position = 'absolute';

      const cur = parseTranslate(getComputedStyle(el).transform);
      startTX = el.dataset._tx ? parseFloat(el.dataset._tx) : cur.x;
      startTY = el.dataset._ty ? parseFloat(el.dataset._ty) : cur.y;

      startClientX = ev.clientX;
      startClientY = ev.clientY;

      dragging = false;
      moved = false;
      pointerId = ev.pointerId;
      el.classList.add('dragging');
      
      // Only prevent default if NOT clicking a link
      if (!ev.target.closest('a')) ev.preventDefault();
    }, { passive: false });

    document.addEventListener('pointermove', (ev) => {
      if (!el || ev.pointerId !== pointerId) return;

      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;

      if (!dragging && Math.abs(dx) + Math.abs(dy) >= DRAG_THRESHOLD) {
        dragging = true;
      }

      if (!dragging) return;

      ev.preventDefault();
      const tx = Math.round(startTX + dx);
      const ty = Math.round(startTY + dy);

      el.style.transform = `translate(${tx}px, ${ty}px)`;
      el.dataset._tx = tx;
      el.dataset._ty = ty;
      moved = true;
    }, { passive: false });

    function endDrag(ev) {
      if (!el) return;

      if (moved) {
        const tx = parseFloat(el.dataset._tx || 0);
        const ty = parseFloat(el.dataset._ty || 0);
        localStorage.setItem('aboutParagraphTranslate', JSON.stringify({ x: tx, y: ty }));
        el.style.transform = `translate(${tx}px, ${ty}px)`;
        el.style.position = 'absolute';
      }

      // Prevent click on links if dragging
      if (moved && ev.target.closest('a')) ev.preventDefault();

      dragging = false;
      moved = false;
      pointerId = null;
      if (el) el.classList.remove('dragging');
      el = null;
    }

    document.addEventListener('pointerup', endDrag, { passive: false });
    document.addEventListener('pointercancel', endDrag, { passive: false });

    // Prevent link clicks **only** if a real drag happened
    document.addEventListener('click', (ev) => {
      if (moved && ev.target.closest(SELECTOR + ' a')) {
        ev.preventDefault();
      }
      moved = false; // reset after click
    }, true);

  })();

  
}

const slides = document.querySelectorAll('.about-carousel .slide');
const captionEl = document.querySelector('.about-carousel .caption');
let currentIndex = 0;

function showSlide(index) {
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });

  const caption = slides[index].dataset.caption || '';
  captionEl.textContent = caption;
  captionEl.classList.add('active');
}

document.getElementById('about-prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
});

document.getElementById('about-next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
});

// Initialize
showSlide(currentIndex);