/* Panel de la Defensa · banco de pruebas
   Cada pregunta pasa por el clasificador real del chat (MPDChat.classify)
   y se compara con el resultado esperado. */
(function () {
  'use strict';
  const D = window.MPD_DATA, C = window.MPDChat;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = { 'Crítica': 'background:#8F3A1C;color:#fff', 'Alta': 'background:#c5e8ee;color:#1c3643', 'Media': 'background:#eaf1f3;color:#173947' };
  const pruebas = D.pruebas.map((p) => Object.assign({}, p));
  let corrida = false;

  function evaluar(p) {
    const r = C.classify(p.q);
    if (!p.espera) return { res: 'Revisar', r, motivo: 'Pregunta nueva: una persona confirma si la respuesta es la esperada.' };
    const e = p.espera;
    const ok = r.k === e.k && (!e.f || (r.a && r.a.f === e.f)) && (!e.loc || (r.a && r.a.loc));
    let motivo = '';
    if (!ok) {
      if (e.loc && r.k === e.k) motivo = 'No reconoce la localidad: falta en la lista de localidades.';
      else motivo = 'Se esperaba: ' + C.label({ k: e.k, a: { f: e.f, loc: e.loc ? 'la localidad' : null } }) + '.';
    }
    return { res: ok ? 'Aprobada' : 'Falla', r, motivo };
  }

  function render() {
    const out = pruebas.map((p) => Object.assign({ p }, corrida ? evaluar(p) : {}));
    $('[data-total]').textContent = pruebas.length;
    $('[data-pruebas]').innerHTML = out.map((o) => {
      const st = !corrida ? 'background:#fff;color:#4c606b;border:1px solid #9FB1B6' : o.res === 'Aprobada' ? 'background:#145e77;color:#fff' : o.res === 'Falla' ? 'background:#8F3A1C;color:#fff' : 'background:#f3f6f7;color:#5d4514';
      return `<tr><td style="font-weight:700">«${esc(o.p.q)}»</td><td>${esc(o.p.e)}</td><td><span class="tag" style="${P[o.p.prio]}">${esc(o.p.prio)}</span></td>
        <td><span class="tag" style="${st}">${corrida ? esc(o.res) : 'Sin ejecutar'}</span>${corrida ? `<span class="got">Respondió: ${esc(C.label(o.r))}</span>` : ''}${o.motivo ? `<span class="why">${esc(o.motivo)}</span>` : ''}</td></tr>`;
    }).join('');
    if (!corrida) return;
    const ok = out.filter((o) => o.res === 'Aprobada').length;
    const bloquea = out.filter((o) => o.res !== 'Aprobada' && (o.p.prio === 'Crítica' || o.p.prio === 'Alta'));
    $('[data-aprobadas]').textContent = ok + ' de ' + out.length;
    $('[data-cuando]').textContent = 'Ejecutada recién, sobre los cambios pendientes';
    const puerta = $('[data-puerta]');
    const pub = $('[data-publicar]');
    if (bloquea.length) {
      $('[data-puerta-t]').textContent = 'Publicación bloqueada';
      $('[data-puerta-p]').textContent = 'Falla ' + (bloquea.length === 1 ? 'una prueba' : bloquea.length + ' pruebas') + ' de prioridad crítica o alta. Los cambios se publican cuando todas las pruebas críticas y altas aprueban.';
      puerta.style.cssText += ';background:#fffaf0;border-color:#a9d8e2';
      pub.setAttribute('aria-disabled', 'true');
    } else {
      $('[data-puerta-t]').textContent = 'Listo para publicar';
      $('[data-puerta-p]').textContent = 'Todas las pruebas críticas y altas aprueban.' + (ok < out.length ? ' Las de prioridad media que fallan quedan registradas para corregir.' : '');
      puerta.style.cssText += ';background:#eff5f7;border-color:#9bb6c3';
      pub.removeAttribute('aria-disabled');
    }
  }

  $('[data-ejecutar]').addEventListener('click', (e) => { corrida = true; e.currentTarget.textContent = 'Volver a ejecutar'; render(); });
  $('[data-publicar]').addEventListener('click', (e) => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') return;
    $('[data-puerta-p]').textContent = 'En la versión final, esto publica la versión 0.4 y la registra en el historial. En el prototipo no se publica nada.';
  });
  const form = $('[data-form]');
  $('[data-agregar]').addEventListener('click', () => { form.hidden = false; $('#np-q').focus(); });
  $('[data-cancelar]').addEventListener('click', () => { form.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    pruebas.push({ q: $('#np-q').value.trim(), e: $('#np-e').value.trim(), prio: 'Media' });
    form.reset(); form.hidden = true; corrida = true; $('[data-ejecutar]').textContent = 'Volver a ejecutar';
    render();
  });
  render();
})();
