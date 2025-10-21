// Free 2D drag using CSS transform (translate) to avoid layout/top constraints
if (!window.__aboutParagraphDragInitialized) {
  window.__aboutParagraphDragInitialized = true;

  (function () {
    const SELECTOR = '.about-paragraph';
    let el = null;
    let dragging = false;
    let startClientX = 0, startClientY = 0;
    let startTX = 0, startTY = 0;
    let pointerId = null;

    function getEl() {
      if (!el) el = document.querySelector(SELECTOR);
      return el;
    }

    function parseTranslate(transform) {
      if (!transform || transform === 'none') return { x: 0, y: 0 };
      const m = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
      if (!m) return { x: 0, y: 0 };
      const vals = m[1].split(',').map(n => parseFloat(n));
      // matrix(a, b, c, d, tx, ty) or 3d where tx = vals[12], ty = vals[13]
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
          // ensure element participates in document flow (absolute/fixed optional)
          if (getComputedStyle(e).position === 'static') e.style.position = 'absolute';
        }
      } catch (err) {}
    }

    // init
    document.addEventListener('DOMContentLoaded', () => {
      const e = getEl();
      if (!e) return;
      e.style.willChange = 'transform';
      e.style.touchAction = 'none';
      restorePositionFromStorage();
    });

    document.addEventListener('pointerdown', (ev) => {
      const target = ev.target && ev.target.closest && ev.target.closest(SELECTOR);
      if (!target) return;
      if (ev.button && ev.button !== 0) return;
      ev.preventDefault();

      el = target;
      // ensure element can be moved visually without layout constraints
      if (getComputedStyle(el).position === 'static') el.style.position = 'absolute';

      // read current translate
      const cur = parseTranslate(getComputedStyle(el).transform);
      startTX = cur.x;
      startTY = cur.y;

      // but if dataset saved values exist prefer them
      if (el.dataset._tx) startTX = parseFloat(el.dataset._tx) || startTX;
      if (el.dataset._ty) startTY = parseFloat(el.dataset._ty) || startTY;

      startClientX = ev.clientX;
      startClientY = ev.clientY;

      dragging = true;
      pointerId = ev.pointerId;
      el.classList.add('dragging');
      try { el.setPointerCapture && el.setPointerCapture(pointerId); } catch (_) {}
    }, { passive: false });

    document.addEventListener('pointermove', (ev) => {
      if (!dragging || ev.pointerId !== pointerId) return;
      ev.preventDefault();

      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;

      const tx = Math.round(startTX + dx);
      const ty = Math.round(startTY + dy);

      el.style.transform = `translate(${tx}px, ${ty}px)`;
      el.dataset._tx = tx;
      el.dataset._ty = ty;
    }, { passive: false });

    function endDrag(ev) {
      if (!dragging) return;
      if (ev && ev.pointerId && ev.pointerId !== pointerId) return;
      dragging = false;
      try { el.releasePointerCapture && el.releasePointerCapture(pointerId); } catch (_) {}
      el.classList.remove('dragging');
      pointerId = null;
      // persist translate
      try {
        const tx = parseFloat(el.dataset._tx || 0) || 0;
        const ty = parseFloat(el.dataset._ty || 0) || 0;
        localStorage.setItem('aboutParagraphTranslate', JSON.stringify({ x: tx, y: ty }));
      } catch (err) {}
    }

    document.addEventListener('pointerup', endDrag, { passive: false });
    document.addEventListener('pointercancel', endDrag, { passive: false });
  })();
}