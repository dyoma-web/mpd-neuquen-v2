/* Panel de la Defensa · banco de pruebas
   Cada pregunta pasa por el clasificador real del chat (JustinaMPD.classify)
   y se compara con el recorrido esperado. */
(function () {
  'use strict';
  const J = window.JustinaMPD, etiqueta = window.JUSTINA_ETIQUETA;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = { 'Crítica': 'background:#8F3A1C;color:#fff', 'Alta': 'background:#c5e8ee;color:#1c3643', 'Media': 'background:#eaf1f3;color:#173947' };
  const pruebas = window.JUSTINA_PRUEBAS.map((p) => Object.assign({}, p));
  let corrida = false;

  function evaluar(p) {
    const r = J.classify(p.q);
    if (!p.espera) return { res: 'Revisar', r, motivo: 'Pregunta nueva: una persona confirma si la respuesta es la esperada.' };
    const ok = r === p.espera;
    return { res: ok ? 'Aprobada' : 'Falla', r, motivo: ok ? '' : (J.routes[p.espera] ? 'Se esperaba: ' + etiqueta(p.espera) + '.' : 'Falta crear la respuesta esperada (' + p.espera + ').') };
  }

  function render() {
    const out = pruebas.map((p) => Object.assign({ p }, corrida ? evaluar(p) : {}));
    $('[data-total]').textContent = pruebas.length;
    $('[data-pruebas]').innerHTML = out.map((o) => {
      const st = !corrida ? 'background:#fff;color:#4c606b;border:1px solid #9FB1B6' : o.res === 'Aprobada' ? 'background:#145e77;color:#fff' : o.res === 'Falla' ? 'background:#8F3A1C;color:#fff' : 'background:#f3f6f7;color:#5d4514';
      return `<tr><td style="font-weight:700">«${esc(o.p.q)}»</td><td>${esc(o.p.e)}</td><td><span class="tag" style="${P[o.p.prio]}">${esc(o.p.prio)}</span></td>
        <td><span class="tag" style="${st}">${corrida ? esc(o.res) : 'Sin ejecutar'}</span>${corrida ? `<span class="got">Respondió: ${esc(etiqueta(o.r))}</span>` : ''}${o.motivo ? `<span class="why">${esc(o.motivo)}</span>` : ''}</td></tr>`;
    }).join('');
    if (!corrida) return;
    const fallas = out.filter((o) => o.res === 'Falla');
    const bloquean = fallas.filter((o) => o.p.prio !== 'Media');
    const aprobadas = out.filter((o) => o.res === 'Aprobada').length;
    $('[data-aprobadas]').textContent = aprobadas + ' de ' + pruebas.length;
    $('[data-cuando]').textContent = 'Ejecutadas recién sobre el chat del prototipo';
    const puerta = $('[data-puerta]'), pub = $('[data-publicar]');
    if (bloquean.length) {
      puerta.style.cssText += ';background:#fffaf0;border-color:#d4bf90';
      $('[data-puerta-t]').textContent = 'No se puede publicar';
      $('[data-puerta-p]').textContent = bloquean.length + ' pruebas críticas o altas fallan. Hay que corregir las respuestas antes de publicar.';
      pub.setAttribute('aria-disabled', 'true');
    } else {
      puerta.style.cssText += ';background:#eaf1f3;border-color:#c6d9dc';
      $('[data-puerta-t]').textContent = 'Se puede publicar';
      $('[data-puerta-p]').textContent = fallas.length ? 'Pasan todas las pruebas críticas y altas. Quedan ' + fallas.length + ' de prioridad media para revisar.' : 'Pasan todas las pruebas.';
      pub.removeAttribute('aria-disabled');
    }
  }

  $('[data-ejecutar]').addEventListener('click', () => { corrida = true; render(); $('[data-puerta]').focus && $('[data-puerta-t]').scrollIntoView({ block: 'nearest' }); });
  $('[data-publicar]').addEventListener('click', (e) => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') return;
    window.MPDToast && window.MPDToast('En la versión final, la publicación crea una versión nueva que puede restaurarse. En el prototipo no se publica nada.');
  });
  const form = $('[data-form]');
  $('[data-agregar]').addEventListener('click', () => { form.hidden = false; $('#np-q').focus(); });
  $('[data-cancelar]').addEventListener('click', () => { form.hidden = true; form.reset(); $('[data-agregar]').focus(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    pruebas.push({ q: $('#np-q').value.trim(), e: $('#np-e').value.trim(), prio: 'Media', espera: null });
    form.reset(); form.hidden = true; corrida = true; render();
  });
  render();
})();
