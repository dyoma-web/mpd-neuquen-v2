/* Panel de la Defensa · respuestas y directorio
   Trabaja sobre las respuestas reales del chat (JustinaMPD.routes) y su directorio de oficinas.
   Los cambios se aplican en esta pestaña: la vista previa es el chat de verdad. */
(function () {
  'use strict';
  const J = window.JustinaMPD, R = J.routes;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Las fichas de oficina, los alias y los equipos se generan desde el directorio: no se editan a mano.
  const generada = (id) => /^(oficina-|lugar-|mapa-)/.test(id) || J.cities.some((c) => c.id === id) || ['sedes', 'leycuota', 'leyvoz', 'leydefensa', 'provincia'].includes(id);
  const ids = Object.keys(R).filter((id) => !generada(id) && !J.esUrgencia(id));
  const editadas = new Set();
  const grupo = (id) => id.startsWith('ley-') ? 'Derechos' : id.startsWith('papel-') || ['cedula', 'mirar', 'organismo', 'fiscal', 'defensa', 'juzgado', 'ilegible'].includes(id) ? 'Documentos y avisos'
    : ['datos', 'desconocido', 'limite', 'privacidad', 'primera', 'prueba'].includes(id) ? 'Mensajes del servicio'
    : ['denuncia', 'laboral', 'deudas', 'salud'].includes(id) ? 'Derivaciones' : 'Temas y atención';
  const estado = (id) => editadas.has(id) ? ['Borrador', 'background:#fff7e6;color:#5d4514'] : R[id].pendiente || /\[[^\]]+\]/.test(R[id].text) ? ['Pendiente de aprobación', 'background:#8F3A1C;color:#fff'] : ['Vigente', 'background:#eaf1f3;color:#173947'];
  const titulo = (id) => R[id].question || ({ datos: 'Mensaje con datos personales', desconocido: 'No hay información para la pregunta' }[id]) || id;
  let sel = ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'alimentos';
  const preview = J.mount($('[data-preview]'), { start: sel });

  function lista() {
    const q = $('#buscar-ficha').value.trim().toLowerCase(), solo = $('[data-solo-pendientes]').checked;
    const vis = ids.filter((id) => (!q || (titulo(id) + ' ' + R[id].text).toLowerCase().includes(q)) && (!solo || estado(id)[0] !== 'Vigente'));
    let actual = '', html = '';
    for (const id of vis.sort((a, b) => grupo(a).localeCompare(grupo(b)))) {
      if (grupo(id) !== actual) { actual = grupo(id); html += `<p class="small" style="margin:0;padding:10px 16px 4px;font-weight:700;color:#145e77;background:#f3f6f7">${esc(actual)}</p>`; }
      const [e, st] = estado(id);
      html += `<button type="button" data-sel="${esc(id)}" aria-pressed="${id === sel}" style="display:flex;width:100%;justify-content:space-between;align-items:center;gap:10px;padding:11px 16px;border:0;border-top:1px solid #e4eef0;background:${id === sel ? '#eaf1f3' : '#fff'};text-align:left;font:inherit;cursor:pointer"><span style="min-width:0;font-weight:${id === sel ? 700 : 400}">${esc(titulo(id))}</span>${e === 'Vigente' ? '' : `<span class="tag" style="flex:none;${st}">${esc(e)}</span>`}</button>`;
    }
    $('[data-lista]').innerHTML = html;
    $('[data-count]').textContent = '(' + vis.length + ' de ' + ids.length + ')';
    $('[data-sin-res]').hidden = vis.length > 0;
  }

  function editor() {
    const r = R[sel], [e, st] = estado(sel);
    $('#f-pregunta').value = r.question || '';
    $('#f-texto').value = r.text;
    $('[data-estado]').textContent = e; $('[data-estado]').style.cssText = st;
    $('[data-enlaces]').innerHTML = (r.links || []).map((l) => `<li>${esc(l.label)}${l.place ? ' <span class="muted">(abre el mapa de defensorías)</span>' : /^tel:/.test(l.url) ? ' <span class="muted">(llamada)</span>' : ` · <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">ver fuente</a>`}</li>`).join('') || '<li class="muted">Sin enlaces.</li>';
    $('[data-opciones]').innerHTML = (r.choices || []).map((c) => `<button type="button" class="chip" data-ir="${esc(c.id)}">${esc(c.label)}</button>`).join('') || '<span class="small muted">Esta respuesta no ofrece botones.</span>';
    const origenes = ids.filter((id) => (R[id].choices || []).some((c) => c.id === sel));
    $('[data-origenes]').innerHTML = (J.hello.some((c) => c.id === sel) ? '<span class="tag" style="background:#eaf1f3;color:#173947">Saludo inicial</span>' : '') + origenes.map((id) => `<button type="button" class="chip" data-ir="${esc(id)}">${esc(titulo(id))}</button>`).join('') || '<span class="small muted">Solo se llega escribiendo la pregunta.</span>';
    $('[data-ok]').textContent = '';
  }

  function elegir(id, foco) {
    if (!ids.includes(id)) { preview.reiniciar(id); return; }
    sel = id; history.replaceState(null, '', '#' + id); lista(); editor(); preview.reiniciar(sel);
    if (foco) { const b = document.querySelector(`[data-sel="${CSS.escape(sel)}"]`); if (b) { b.scrollIntoView({ block: 'nearest' }); b.focus(); } }
  }

  document.addEventListener('input', (e) => {
    const campo = e.target.dataset && e.target.dataset.campo;
    if (campo) { R[sel][campo] = e.target.value; editadas.add(sel); const [x, st] = estado(sel); $('[data-estado]').textContent = x; $('[data-estado]').style.cssText = st; }
    if (e.target.id === 'buscar-ficha' || e.target.matches('[data-solo-pendientes]')) lista();
  });
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-sel]');
    if (s) return elegir(s.dataset.sel, true);
    const ir = e.target.closest('[data-ir]');
    if (ir) return elegir(ir.dataset.ir, true);
    if (e.target.closest('[data-probar]')) { lista(); preview.reiniciar(sel); $('[data-ok]').textContent = 'La vista previa muestra el texto nuevo.'; }
  });

  // Mensajes de urgencia
  $('[data-urgencias]').innerHTML = Object.keys(R).filter(J.esUrgencia).map((id) => { const u = R[id]; return `<div style="padding:16px;border-radius:10px;border:1px solid #d4bf90;background:#fffaf0;display:flex;flex-direction:column;gap:8px">
    <span class="h3">${esc(u.question)}</span><span class="small" style="white-space:pre-line">${esc(u.text)}</span>
    <span class="small muted">Líneas: ${(u.links || []).map((l) => esc(l.label.replace('Llamar al ', ''))).join(' · ')}</span>
    <span style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span class="tag" style="background:${u.pendiente ? '#8F3A1C;color:#fff' : '#eaf1f3;color:#173947'}">${u.pendiente ? 'Pendiente de aprobación' : 'Vigente'}</span><button type="button" class="chip" data-ir="${esc(id)}">Ver en el chat</button></span></div>`; }).join('');

  // Directorio de oficinas
  const filas = [];
  for (const c of J.cities) for (const o of c.offices) filas.push(`<tr><td><b>${esc(c.name)}</b></td><td>${esc(o.name)}</td><td>${esc(J.labels[o.topic] || o.topic)}</td><td>${esc(o.address || 'Sin dirección publicada')}${o.hours ? '<br><span class="small muted">' + esc(o.hours) + '</span>' : ''}</td><td>${esc(o.phone ? o.phone + (o.extension ? ' (int. ' + o.extension + ')' : '') : '—')}</td><td>${Number.isFinite(o.lat) ? '<span class="tag" style="background:#eaf1f3;color:#173947">Ubicada</span>' : '<span class="tag" style="background:#fff7e6;color:#5d4514">Falta ubicar</span>'}</td></tr>`);
  $('[data-directorio]').innerHTML = filas.join('');
  $('[data-dir-count]').textContent = '(' + filas.length + ' oficinas en ' + J.cities.length + ' localidades)';

  lista(); editor();
})();
