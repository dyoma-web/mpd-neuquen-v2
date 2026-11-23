/* Mapa de recorridos: se dibuja con el contenido real del chat (JustinaMPD). */
(function () {
  'use strict';
  const J = window.JustinaMPD, R = J.routes;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tipo = (id) => J.esUrgencia(id) ? ['Urgencia', 't-u'] : /^(oficina-|lugar-|mapa)/.test(id) || id === 'sedes' ? ['Oficina', 't-f'] : ['persona', 'asignada'].includes(id) ? ['Persona', 't-h'] : ['denuncia', 'laboral', 'fiscal', 'juzgado', 'deudas'].includes(id) ? ['Derivación', 't-d'] : ['Respuesta', 't-f'];
  const corto = (t) => { const s = String(t || '').split('\n')[0]; return s.length > 150 ? s.slice(0, 147) + '…' : s; };

  function rama(id, etiqueta, vistos, nivel) {
    const r = R[id];
    if (!r) return '';
    const [t, c] = tipo(id);
    const hijos = nivel < 2 && !vistos.has(id) ? (r.choices || []) : [];
    vistos.add(id);
    return `<li style="margin:6px 0"><span class="t ${c}">${t}</span> <b>${esc(etiqueta)}</b>${nivel === 0 ? `<br><span class="small muted">${esc(corto(r.text))}</span>` : ''}${hijos.length ? `<ul style="margin:4px 0 0;padding-left:18px;list-style:none;border-left:2px solid #d8e1e5">${hijos.map((h) => rama(h.id, h.label, vistos, nivel + 1)).join('')}</ul>` : ''}</li>`;
  }
  $('[data-arboles]').innerHTML = J.hello.map((h) => `<div class="card"><ul style="margin:0;padding:0;list-style:none">${rama(h.id, h.label, new Set(), 0)}</ul></div>`).join('');

  const ejemplos = {
    'urgente-ninez': '«Tengo 14 años y un hombre me escribe por Instagram»',
    'urgente-silencio': '«No puedo hablar», «me está escuchando», «me revisa el celular»',
    'urgente-violencia': '«Me quiere matar», «me está pegando», «tengo miedo», «me amenaza»',
    'urgente-salud': '«Me quiero matar», «no aguanto más», «hacerme daño»',
    urgente: '«Estoy en peligro», «es una emergencia»'
  };
  $('[data-urgencias]').innerHTML = Object.keys(ejemplos).map((id, i) => `<tr><td>${i + 1}</td><td><b>${esc(R[id].question)}</b></td><td>${esc(ejemplos[id])}</td><td>${(R[id].links || []).map((l) => esc(l.label.replace('Llamar al ', ''))).join('<br>')}</td></tr>`).join('');

  $('[data-localidades]').innerHTML = J.cities.map((c) => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.circuit || '')}</td><td>${[...new Set(c.offices.map((o) => J.labels[o.topic] || o.topic))].map(esc).join(' · ')}</td><td>${c.offices.length}</td></tr>`).join('');

  const total = Object.keys(R).length, oficinas = J.cities.reduce((n, c) => n + c.offices.length, 0);
  $('[data-resumen]').textContent = `Hoy el chat tiene ${total} respuestas (contando una ficha por oficina y tema), ${oficinas} oficinas en ${J.cities.length} localidades y ${J.rights.length} explicaciones de derechos.`;
})();
