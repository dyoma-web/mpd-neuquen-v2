// Ejecuta el banco de pruebas de Justina MPD contra el clasificador real.
// Igual que la «puerta» del panel: falla si no aprueba alguna prueba crítica o alta.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['assets/js/justina-ventana.js', 'assets/js/justina-pruebas.js']) vm.runInContext(readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx);
const { JustinaMPD: J, JUSTINA_PRUEBAS: pruebas, JUSTINA_ETIQUETA: etiqueta } = ctx;

let fallas = 0, bloquean = 0;
for (const p of pruebas) {
  const r = J.classify(p.q);
  const ok = r === p.espera;
  if (!ok) { fallas++; if (p.prio !== 'Media') bloquean++; }
  console.log(`${ok ? '✓' : '✗'} [${p.prio}] ${p.q} → ${etiqueta(r)}${ok ? '' : ' (se esperaba: ' + p.espera + ')'}`);
}

// Ningún botón puede llevar a un recorrido que no existe.
const rotas = [];
for (const [id, r] of Object.entries(J.routes)) for (const c of r.choices || []) if (!J.routes[c.id]) rotas.push(`${id} → ${c.id}`);
if (rotas.length) { console.log('✗ Opciones que llevan a recorridos inexistentes: ' + rotas.join(', ')); bloquean++; }

console.log(`\n${pruebas.length - fallas} de ${pruebas.length} pruebas aprobadas.`);
if (bloquean) { console.error(`${bloquean} fallas críticas o altas: no se publica.`); process.exit(1); }
