// Conector genérico entre la página de Justina MPD y una plataforma de consulta sobre documentos (RAG).
//
// Es el «intermediario»: la única pieza que conoce la clave de la plataforma. La página le envía la
// conversación a /api/chat y recibe { reply, sources }. También informa en /api/estado si el chat debe
// mostrarse y si está conectado, para ocultarlo o dejarlo visible sin tocar el sitio.
//
// No tiene dependencias: Node.js 18 o superior.   Uso:  node conector/servidor.mjs
// Toda la configuración va en variables de entorno (ver conector/.env.ejemplo). Sin RAG_URL, RAG_CLAVE
// y CHAT_OPERATIVO=1 el conector queda apagado: /api/estado responde «demostracion» y /api/chat, 503.
import http from 'node:http';

const env = process.env;
const num = (v, d) => (Number.isFinite(Number(v)) && v !== undefined && v !== '' ? Number(v) : d);
const cfg = {
  puerto: num(env.PUERTO, 8787),
  visible: env.CHAT_VISIBLE !== '0',
  operativo: env.CHAT_OPERATIVO === '1',
  url: env.RAG_URL || '',
  clave: env.RAG_CLAVE || '',
  cabecera: env.RAG_CABECERA || 'Authorization',
  prefijo: env.RAG_PREFIJO ?? 'Bearer ',
  formato: (env.RAG_FORMATO || 'json').toLowerCase(),          // json | sse | ndjson
  cuerpo: (env.RAG_CUERPO || 'mensajes').toLowerCase(),        // mensajes | pregunta
  campoMensajes: env.RAG_CAMPO_MENSAJES || 'messages',
  campoPregunta: env.RAG_CAMPO_PREGUNTA || 'question',
  campoRespuesta: env.RAG_CAMPO_RESPUESTA || 'reply',          // ruta con puntos, por ejemplo choices.0.message.content
  campoFragmento: env.RAG_CAMPO_FRAGMENTO || 'content',        // en sse/ndjson: dónde viene cada fragmento de texto
  campoFuentes: env.RAG_CAMPO_FUENTES || 'sources',
  extra: env.RAG_CUERPO_EXTRA ? JSON.parse(env.RAG_CUERPO_EXTRA) : {},
  origenes: (env.ORIGENES_PERMITIDOS || '').split(',').map((s) => s.trim()).filter(Boolean),
  esperaMs: num(env.ESPERA_MS, 55000),
  porMinuto: num(env.LIMITE_POR_MINUTO, 20),
  maxMensajes: num(env.MAX_MENSAJES, 10),
  maxCaracteres: num(env.MAX_CARACTERES, 2000)
};
const conectado = () => cfg.operativo && !!cfg.url && !!cfg.clave;

const leer = (obj, ruta) => ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

// Límite de pedidos por dirección, en memoria (alcanza para una sola instancia).
const pedidos = new Map();
function excedido(ip) {
  const ahora = Date.now(), lista = (pedidos.get(ip) || []).filter((t) => ahora - t < 60000);
  lista.push(ahora);
  pedidos.set(ip, lista);
  if (pedidos.size > 5000) for (const [k, v] of pedidos) if (!v.some((t) => ahora - t < 60000)) pedidos.delete(k);
  return lista.length > cfg.porMinuto;
}

function cabeceras(req) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
  const origen = req.headers.origin;
  if (origen && cfg.origenes.includes(origen)) { h['Access-Control-Allow-Origin'] = origen; h.Vary = 'Origin'; h['Access-Control-Allow-Headers'] = 'Content-Type'; h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'; }
  return h;
}
const responder = (req, res, estado, datos) => { res.writeHead(estado, cabeceras(req)); res.end(JSON.stringify(datos)); };

function validar(cuerpo) {
  const m = cuerpo && cuerpo.messages;
  if (!Array.isArray(m) || !m.length || m.length > cfg.maxMensajes) return null;
  for (const x of m) {
    if (!x || (x.role !== 'user' && x.role !== 'assistant') || typeof x.content !== 'string') return null;
    if (!x.content.trim() || x.content.length > cfg.maxCaracteres) return null;
  }
  if (m[m.length - 1].role !== 'user') return null;
  return m.map((x) => ({ role: x.role, content: x.content }));
}

// Une la respuesta de la plataforma en un solo texto, sea completa o por fragmentos.
function normalizar(texto) {
  if (cfg.formato === 'json') {
    const datos = JSON.parse(texto);
    return { reply: leer(datos, cfg.campoRespuesta), sources: leer(datos, cfg.campoFuentes) };
  }
  let reply = '', sources;
  for (let linea of texto.split(/\r?\n/)) {
    linea = linea.trim();
    if (cfg.formato === 'sse') { if (!linea.startsWith('data:')) continue; linea = linea.slice(5).trim(); }
    if (!linea || linea === '[DONE]') continue;
    try {
      const parte = JSON.parse(linea);
      const trozo = leer(parte, cfg.campoFragmento);
      if (typeof trozo === 'string') reply += trozo;
      const f = leer(parte, cfg.campoFuentes);
      if (Array.isArray(f)) sources = f;
    } catch { /* línea que no es JSON: se ignora */ }
  }
  return { reply, sources };
}

async function consultar(mensajes) {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), cfg.esperaMs);
  try {
    const cuerpo = cfg.cuerpo === 'pregunta'
      ? { ...cfg.extra, [cfg.campoPregunta]: mensajes[mensajes.length - 1].content, history: mensajes.slice(0, -1) }
      : { ...cfg.extra, [cfg.campoMensajes]: mensajes };
    const r = await fetch(cfg.url, { method: 'POST', signal: control.signal, headers: { 'Content-Type': 'application/json', [cfg.cabecera]: cfg.prefijo + cfg.clave }, body: JSON.stringify(cuerpo) });
    if (!r.ok) throw Object.assign(new Error('La plataforma respondió ' + r.status), { estado: 502 });
    const { reply, sources } = normalizar(await r.text());
    if (typeof reply !== 'string' || !reply.trim()) throw Object.assign(new Error('Respuesta sin texto o con un formato no previsto'), { estado: 502 });
    const fuentes = Array.isArray(sources) ? sources.map((f) => ({ label: String(f.label ?? f.title ?? f.titulo ?? '').slice(0, 160), url: String(f.url ?? f.link ?? '') })).filter((f) => f.label && /^https:\/\//.test(f.url)).slice(0, 6) : [];
    return { reply: reply.trim(), sources: fuentes };
  } catch (e) {
    if (e.name === 'AbortError') throw Object.assign(new Error('Tiempo de espera agotado'), { estado: 504 });
    throw e.estado ? e : Object.assign(e, { estado: 502 });
  } finally { clearTimeout(reloj); }
}

const servidor = http.createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'OPTIONS') { res.writeHead(204, cabeceras(req)); return res.end(); }

  if (ruta === '/api/estado') {
    if (req.method !== 'GET') return responder(req, res, 405, { error: 'Método no permitido.' });
    return responder(req, res, 200, { visible: cfg.visible, modo: conectado() ? 'conectado' : 'demostracion' });
  }
  if (ruta !== '/api/chat') return responder(req, res, 404, { error: 'No encontrado.' });
  if (req.method !== 'POST') return responder(req, res, 405, { error: 'Método no permitido: usar POST.' });
  if (!cfg.visible || !conectado()) return responder(req, res, 503, { error: 'La conversación todavía no está habilitada.' });
  const ip = req.socket.remoteAddress || '';
  if (excedido(ip)) return responder(req, res, 429, { error: 'Demasiadas consultas. Probá de nuevo en un minuto.' });

  let texto = '';
  try {
    for await (const trozo of req) { texto += trozo; if (texto.length > 64 * 1024) throw new Error('grande'); }
  } catch { return responder(req, res, 400, { error: 'Consulta inválida.' }); }
  let mensajes = null;
  try { mensajes = validar(JSON.parse(texto)); } catch { /* JSON inválido */ }
  if (!mensajes) return responder(req, res, 400, { error: 'Consulta inválida.' });

  try {
    responder(req, res, 200, await consultar(mensajes));
  } catch (e) {
    // El detalle queda en el registro del servidor, sin el texto de la pregunta. Al navegador va un mensaje genérico.
    console.error(new Date().toISOString(), 'chat', e.estado || 502, e.message);
    responder(req, res, e.estado || 502, { error: e.estado === 504 ? 'El servicio tardó demasiado en responder.' : 'No se pudo obtener una respuesta.' });
  }
});

servidor.listen(cfg.puerto, () => {
  console.log(`Conector de Justina MPD en el puerto ${cfg.puerto} · chat ${cfg.visible ? 'visible' : 'oculto'} · ${conectado() ? 'conectado' : 'en demostración (conector apagado)'}`);
  if (conectado() && !cfg.origenes.length) console.log('Aviso: ORIGENES_PERMITIDOS está vacío. Solo funcionará desde el mismo dominio.');
});
