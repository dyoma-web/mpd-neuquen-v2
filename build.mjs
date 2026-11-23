// Generador estático mínimo, sin dependencias.
// Lee src/pages/*.html (con front-matter), los envuelve en su plantilla (src/layout*.html)
// con la navegación del prototipo y el menú del panel, y escribe el sitio en dist/.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');

// Páginas del prototipo, en el orden del menú «Páginas del prototipo».
const PAGES = [
  ['index', 'Guía de la sesión de revisión', 'Para empezar'],
  ['asistente', 'Página de Justina MPD', 'Experiencia ciudadana'],
  ['ventana', 'Ventana flotante en el sitio del MPD', 'Experiencia ciudadana'],
  ['chat', 'Conversación guiada a pantalla completa (celular)', 'Experiencia ciudadana'],
  ['estados', 'Estados de la conversación', 'Experiencia ciudadana'],
  ['como-funciona', 'Cómo funciona este asistente', 'Experiencia ciudadana'],
  ['temas', 'Mapa de temas y árboles guiados', 'Temas y flujos'],
  ['panel', 'Resumen y revisión', 'Panel de la Defensa'],
  ['fichas', 'Fichas y derivaciones', 'Panel de la Defensa'],
  ['pruebas', 'Banco de pruebas y publicación', 'Panel de la Defensa']
];

// Menú lateral del panel de la Defensa (igual en las tres pantallas).
const PANEL_NAV = [
  { id: 'resumen', t: 'Resumen', href: 'panel.html' },
  { id: 'revision', t: 'Conversaciones para revisar', href: 'panel.html#revision', badge: true },
  { id: 'fichas', t: 'Fichas y derivaciones', href: 'fichas.html' },
  { id: 'temas', t: 'Árboles guiados', href: 'temas.html' },
  { id: 'pruebas', t: 'Banco de pruebas', href: 'pruebas.html' },
  { id: 'historial', t: 'Publicaciones', href: 'pruebas.html#historial' },
  { id: 'instalacion', t: 'Instalación', href: 'panel.html#instalacion' }
];

const REVIEW = JSON.parse(readFileSync(join(ROOT, 'review.config.json'), 'utf8'));

const read = (p) => readFileSync(p, 'utf8');
// Dos plantillas: la de la página de Justina MPD (diseño nuevo, con su propia hoja de estilos)
// y la de las pantallas de documentación y del panel.
const LAYOUTS = { base: read(join(SRC, 'layout.html')), justina: read(join(SRC, 'layout-justina.html')) };
// Dos motores de conversación que no deben cargarse juntos (los dos usan el atributo data-chat):
// «justina» es la ventana flotante nueva; «guiada» es el chat con fichas que alimenta el panel.
const MOTORES = { justina: ['justina-ventana.js', 'app.js'], guiada: ['data.js', 'chat.js', 'app.js'] };

const ICONO = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
// Cabecera y pie institucionales (los mismos elementos de la página de Justina MPD).
const siteHead = (kicker) => `<div class="mpd-utility"><div class="mpd-in"><span>${ICONO('<path d="m2 8 10-5 10 5H2Zm2 12h16M3 23h18M6 10v7m4-7v7m4-7v7m4-7v7"></path>')} Poder Judicial de Neuquén</span><span>${ICONO('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.4"></circle>')} Provincia del Neuquén</span></div></div>
<header class="mpd-head"><div class="mpd-in"><a class="mpd-brand" href="asistente.html" aria-label="Ministerio Público de la Defensa. Ir a la página de Justina MPD"><img src="assets/img/justina/logo-mpd.png" alt="Ministerio Público de la Defensa · Provincia del Neuquén" width="171" height="52"></a><span class="mpd-head-t"><strong>Justina MPD</strong>${kicker || 'Prototipo 2 · en revisión'}</span><a class="mpd-head-link" href="asistente.html">Ir a Justina MPD</a></div></header>`;
const siteFoot = (version) => `<footer class="mpd-foot"><div class="mpd-in"><div><strong>Ministerio Público de la Defensa</strong>Provincia del Neuquén</div><div>Prototipo para validación con la Defensa Pública de Neuquén y PNUD<br>Versión ${version}</div></div></footer>`;
const panelSide = read(join(SRC, 'partials', 'panel-side.html'));

function parse(file) {
  const raw = read(file);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error('Falta front-matter en ' + file);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ''));

function protoNav(current) {
  let group = null, items = '';
  for (const [f, t, g] of PAGES) {
    if (g !== group) { group = g; items += `<p class="proto-group">${g}</p>\n`; }
    items += `<a href="${f}.html"${f === current ? ' aria-current="page"' : ''}>${t}</a>\n`;
  }
  return `<div class="proto-bar" role="region" aria-label="Aviso del prototipo">
<p class="proto-bar-t" style="margin:0"><strong>Prototipo 2 · en revisión</strong><span>No es un servicio oficial ni está conectado a los sistemas del Poder Judicial.</span></p>
<button type="button" class="proto-btn" aria-expanded="false" aria-controls="proto-panel">${ICONO('<path d="M3 6h18M3 12h18M3 18h18"></path>')}Pantallas del prototipo</button>
<nav id="proto-panel" class="proto-panel" aria-label="Pantallas del prototipo" hidden>
<div class="proto-head"><div><p class="proto-title">Prototipo 2 · Justina MPD</p><p class="proto-note">Textos provisionales. Las respuestas del chat son predefinidas, los datos entre corchetes están por completar y las cifras del panel son ficticias.</p></div><button type="button" class="proto-close" aria-label="Cerrar">×</button></div>
<div class="proto-list">
${items}</div>
</nav>
</div>`;
}

function panelNav(active, who) {
  const nav = PANEL_NAV.map((i) => {
    const on = i.id === active;
    return `<a class="nav${on ? ' nav-on' : ''}" href="${i.href}"${on ? ' aria-current="page"' : ''}>${i.t}${i.badge ? '<span class="badge" data-pendientes>6</span>' : ''}</a>`;
  }).join('\n');
  return fill(panelSide, { nav, who: who || '[Persona responsable]<br>Acceso con usuario institucional' });
}

// Versión publicada: commit corto + fecha, para saber sobre qué versión se hizo cada comentario.
let version = new Date().toISOString().slice(0, 10);
try {
  const sha = execSync('git rev-parse --short HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  if (sha) version = `${sha} · ${version}`;
} catch (e) { /* sin git */ }

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });
if (existsSync(join(ROOT, 'public'))) cpSync(join(ROOT, 'public'), OUT, { recursive: true });

const pages = readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html'));
for (const f of pages) {
  const name = basename(f, '.html');
  const { meta, body } = parse(join(SRC, 'pages', f));
  const motor = MOTORES[meta.motor || 'guiada'];
  if (!motor) throw new Error(`Motor desconocido en ${f}: ${meta.motor}`);
  const layout = LAYOUTS[meta.layout || 'base'];
  if (!layout) throw new Error(`Plantilla desconocida en ${f}: ${meta.layout}`);
  const scripts = [...motor, ...(meta.scripts || '').split(',').map((s) => s.trim()).filter(Boolean)]
    .map((s) => `<script src="assets/js/${s}" defer></script>`).join('\n');
  const main = fill(body, {
    panelSide: meta.panel ? panelNav(meta.panel, meta.who) : '',
    siteHead: siteHead(meta.kicker),
    siteFoot: siteFoot(version)
  });
  const html = fill(layout, {
    title: name === 'asistente' ? 'Justina MPD | Ministerio Público de la Defensa de Neuquén · Prototipo' : `${meta.title} · Justina MPD · Defensa Pública de Neuquén · Prototipo`,
    description: meta.description || '',
    page: meta.page || name,
    bodyClass: meta.bodyClass || '',
    version,
    main,
    protoNav: meta.noNav === 'true' ? '' : protoNav(name),
    reviewConfig: JSON.stringify(REVIEW),
    scripts
  });
  writeFileSync(join(OUT, f), html);
  console.log('  ✓', f);
}
console.log(`Sitio generado en dist/ (${pages.length} páginas).`);
