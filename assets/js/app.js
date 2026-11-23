/* Comportamiento común del prototipo */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Menú «Páginas del prototipo» */
  const btn = document.querySelector('.proto-btn');
  const panel = document.getElementById('proto-panel');
  if (btn && panel) {
    const toggle = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open) { const a = panel.querySelector('[aria-current]') || panel.querySelector('a'); a && a.focus(); } };
    btn.addEventListener('click', () => toggle(panel.hidden));
    panel.querySelector('.proto-close').addEventListener('click', () => { toggle(false); btn.focus(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); btn.focus(); } });
    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) toggle(false); });
  }

  /* Botones de demostración: explican qué haría la versión final */
  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'demo-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('is-on'), 4200);
  }
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-demo]');
    if (d) toast(d.dataset.demo);
  });
  window.MPDToast = toast;
})();
