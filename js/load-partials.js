async function includePartial(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load partial: ' + url);
    const html = await res.text();
    container.innerHTML = html;

    // Execute inline scripts inside the injected fragment
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(old => {
      const s = document.createElement('script');
      if (old.src) {
        s.src = old.src;
        s.async = false;
      } else {
        s.textContent = old.textContent;
      }
      document.body.appendChild(s);
      old.remove();
    });
  } catch (err) {
    console.error('includePartial error', err);
  }
}

// call on DOMContentLoaded for the header
document.addEventListener('DOMContentLoaded', () => {
  includePartial('#site-header', '/partials/header.html');
});