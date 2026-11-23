/* Panel de la Defensa · conversaciones para revisar */
(function () {
  'use strict';
  // Datos ficticios para el taller: en el sitio real salen del registro anónimo de uso.
  const D = { revision: [
    { id: 1, tipo: 'No supo responder', texto: '«¿La Defensa me puede ayudar con la herencia de mi papá?»', detalle: 'Civil y familia · No existe una respuesta sobre sucesiones', cuando: 'Hoy, 10:42', accion: 'Ver respuestas', href: 'fichas.html#civil' },
    { id: 2, tipo: 'Situación crítica', texto: 'Se mostró el mensaje de violencia en curso', detalle: 'El contenido no se registra · Revisión obligatoria', cuando: 'Hoy, 02:15', accion: 'Ver mensaje', href: 'fichas.html#urgencias' },
    { id: 3, tipo: 'Valoración negativa', texto: '«¿Dónde queda la defensoría de Aluminé?»', detalle: 'Localidades · Aluminé no figura en el directorio', cuando: 'Ayer, 18:03', accion: 'Ver localidades', href: 'temas.html#localidades' },
    { id: 4, tipo: 'No supo responder', texto: '«¿Puedo pedir un defensor para un juicio laboral?»', detalle: 'Derivaciones · Falta el contacto del organismo laboral', cuando: 'Ayer, 09:27', accion: 'Editar respuesta', href: 'fichas.html#laboral' },
    { id: 5, tipo: 'Informe de error', texto: '«Me dio un horario que ya no es»', detalle: 'Directorio · Defensa penal en Cutral Có', cuando: '12/11, 21:50', accion: 'Ver directorio', href: 'fichas.html#directorio' },
    { id: 6, tipo: 'Situación crítica', texto: 'Se mostró el mensaje de salud mental', detalle: 'El contenido no se registra · Revisión obligatoria', cuando: '11/11, 23:12', accion: 'Ver mensaje', href: 'fichas.html#urgencias' }
  ] };
  const ESTILO = {
    'No supo responder': 'background:#eaf1f3;color:#173947',
    'Situación crítica': 'background:#8F3A1C;color:#fff',
    'Valoración negativa': 'background:#f3f6f7;color:#5d4514',
    'Informe de error': 'background:#fff;color:#8F3A1C;border:1px solid #8F3A1C'
  };
  const FILTROS = ['Todas'].concat(Object.keys(ESTILO));
  const S = { filtro: 'Todas', hechos: [] };
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render() {
    const vivos = D.revision.filter((d) => S.hechos.indexOf(d.id) < 0);
    const vis = vivos.filter((d) => S.filtro === 'Todas' || d.tipo === S.filtro);
    document.querySelectorAll('[data-pendientes]').forEach((el) => { el.textContent = vivos.length; });
    $('[data-filtros]').innerHTML = FILTROS.map((t) => {
      const n = t === 'Todas' ? vivos.length : vivos.filter((d) => d.tipo === t).length;
      return `<button type="button" class="chip${t === S.filtro ? ' chip-on' : ''}" aria-pressed="${t === S.filtro}" data-f="${esc(t)}">${esc(t)} (${n})</button>`;
    }).join('');
    $('[data-items]').innerHTML = vis.map((d) => `<li id="rev-${d.id}" style="display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:14px 0;border-top:1px solid #e4eef0">
      <span class="tag" style="${ESTILO[d.tipo]}">${esc(d.tipo)}</span>
      <span style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-weight:700">${esc(d.texto)}</span><span class="small muted">${esc(d.detalle)}</span></span>
      <span class="small muted" style="min-width:110px">${esc(d.cuando)}</span>
      <span style="display:flex;flex-wrap:wrap;gap:8px"><a class="btn" href="${d.href}">${esc(d.accion)}</a><button type="button" class="btn btn-p" data-hecho="${d.id}">Marcar como revisada</button></span>
    </li>`).join('');
    $('[data-vacio]').hidden = vis.length > 0;
  }
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]');
    if (f) { S.filtro = f.dataset.f; render(); document.querySelector(`[data-f="${CSS.escape(S.filtro)}"]`).focus(); return; }
    const h = e.target.closest('[data-hecho]');
    if (h) {
      S.hechos.push(Number(h.dataset.hecho));
      render();
      $('[data-live]').textContent = 'Conversación marcada como revisada.';
      const first = document.querySelector('[data-hecho]') || document.querySelector('[data-f]');
      if (first) first.focus();
    }
  });
  const src = document.querySelector('[data-ventana-src]');
  if (src) src.textContent = new URL('assets/js/justina-ventana.js', location.href).href;
  render();

  // Conexión y visibilidad: en el prototipo el interruptor vale solo para este navegador.
  const J = window.JustinaMPD, sw = $('[data-interruptor]');
  if (J && sw) {
    const pintar = () => {
      const v = J.isVisible();
      sw.checked = v;
      $('[data-interruptor-t]').textContent = v ? 'El chat está visible' : 'El chat está oculto';
      const e = $('[data-estado-chat]');
      e.textContent = !v ? 'Oculto' : J.config.modo === 'conectado' && J.config.conector.url ? 'Conectado' : 'Demostración';
      e.style.cssText = !v ? 'background:#f3f6f7;color:#4c606b' : 'background:#fff7e6;color:#5d4514';
    };
    sw.addEventListener('change', () => {
      try { localStorage.setItem('justina-mpd:visible', sw.checked ? '1' : '0'); } catch (e) { /* sin almacenamiento local */ }
      J.setVisible(sw.checked);
      pintar();
      $('[data-live]').textContent = sw.checked ? 'El chat quedó visible en este navegador.' : 'El chat quedó oculto en este navegador.';
    });
    $('[data-aviso]').textContent = J.config.aviso;
    pintar();
  }
})();
