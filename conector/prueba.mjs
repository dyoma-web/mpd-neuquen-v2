// Prueba de aceptación del conector, sin servicios externos:
// levanta una plataforma simulada y el conector, y comprueba los casos mínimos.
//   node conector/prueba.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLAVE = 'clave-de-prueba';
let ultimoPedido = null;
// Plataforma simulada: responde completa en /json y por fragmentos en /sse.
const plataforma = http.createServer(async (req, res) => {
  let texto = ''; for await (const t of req) texto += t;
  if (req.headers.authorization !== 'Bearer ' + CLAVE) { res.writeHead(401); return res.end('{}'); }
  ultimoPedido = JSON.parse(texto);
  if (req.url === '/sse') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    return res.end('data: {"content":"La defensoría "}\n\ndata: {"content":"atiende de 8 a 14."}\n\ndata: [DONE]\n\n');
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: { answer: 'Respuesta de control: Zapala.' }, sources: [{ title: 'Directorio', url: 'https://example.org/directorio' }, { title: 'Inseguro', url: 'http://example.org' }] }));
});
await new Promise((r) => plataforma.listen(0, r));
const base = 'http://127.0.0.1:' + plataforma.address().port;

const archivo = fileURLToPath(new URL('./servidor.mjs', import.meta.url));
function levantar(puerto, extra) {
  const p = spawn(process.execPath, [archivo], { env: { ...process.env, PUERTO: String(puerto), ...extra }, stdio: ['ignore', 'pipe', 'inherit'] });
  return new Promise((ok) => p.stdout.once('data', () => ok(p)));
}
const pedir = (puerto, ruta, opciones) => fetch(`http://127.0.0.1:${puerto}${ruta}`, opciones).then(async (r) => ({ estado: r.status, cache: r.headers.get('cache-control'), datos: await r.json().catch(() => null) }));
const post = (puerto, cuerpo) => pedir(puerto, '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
const pregunta = { messages: [{ role: 'user', content: '¿Dónde queda la defensoría?' }] };

let fallas = 0;
const comprobar = (nombre, ok) => { console.log((ok ? '✓ ' : '✗ ') + nombre); if (!ok) fallas++; };

const apagado = await levantar(8791, { CHAT_VISIBLE: '0' });
const conJson = await levantar(8792, { CHAT_OPERATIVO: '1', RAG_URL: base + '/json', RAG_CLAVE: CLAVE, RAG_CAMPO_RESPUESTA: 'data.answer', LIMITE_POR_MINUTO: '8' });
const conSse = await levantar(8793, { CHAT_OPERATIVO: '1', RAG_URL: base + '/sse', RAG_CLAVE: CLAVE, RAG_FORMATO: 'sse', RAG_CUERPO: 'pregunta' });
const claveMala = await levantar(8794, { CHAT_OPERATIVO: '1', RAG_URL: base + '/json', RAG_CLAVE: 'otra' });

try {
  let r = await pedir(8791, '/api/estado');
  comprobar('Apagado y oculto: /api/estado informa visible=false y modo demostración', r.estado === 200 && r.datos.visible === false && r.datos.modo === 'demostracion');
  r = await post(8791, pregunta);
  comprobar('Apagado: /api/chat responde 503', r.estado === 503);

  r = await pedir(8792, '/api/estado');
  comprobar('Encendido: /api/estado informa visible=true y modo conectado', r.datos.visible === true && r.datos.modo === 'conectado');
  r = await pedir(8792, '/api/chat');
  comprobar('GET /api/chat responde 405', r.estado === 405);
  r = await post(8792, pregunta);
  comprobar('POST con la pregunta de control: 200 y el texto esperado', r.estado === 200 && r.datos.reply.includes('Zapala'));
  comprobar('La respuesta lleva Cache-Control: no-store', r.cache === 'no-store');
  comprobar('Solo pasan las fuentes con dirección https', r.datos.sources.length === 1 && r.datos.sources[0].label === 'Directorio');
  comprobar('La clave no aparece en la respuesta', !JSON.stringify(r.datos).includes(CLAVE));
  comprobar('La plataforma recibió el historial como «messages»', Array.isArray(ultimoPedido.messages) && ultimoPedido.messages.length === 1);
  for (const [nombre, cuerpo] of [['vacío', { messages: [] }], ['con rol inválido', { messages: [{ role: 'system', content: 'x' }] }], ['de más de 2.000 caracteres', { messages: [{ role: 'user', content: 'a'.repeat(2001) }] }], ['que termina en el asistente', { messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] }]]) {
    r = await post(8792, cuerpo);
    comprobar(`Mensaje ${nombre}: 400`, r.estado === 400);
  }
  let limite = 0;
  for (let i = 0; i < 10; i++) { r = await post(8792, pregunta); if (r.estado === 429) limite++; }
  comprobar('Límite de pedidos por minuto: responde 429 al superarlo', limite > 0);

  r = await post(8793, pregunta);
  comprobar('Respuesta por fragmentos (SSE): se une en un solo texto', r.estado === 200 && r.datos.reply === 'La defensoría atiende de 8 a 14.');
  comprobar('Formato «pregunta»: la plataforma recibió el campo question', typeof ultimoPedido.question === 'string');

  r = await post(8794, pregunta);
  comprobar('Clave rechazada por la plataforma: 502 con mensaje genérico', r.estado === 502 && !/401/.test(JSON.stringify(r.datos)));
} finally {
  for (const p of [apagado, conJson, conSse, claveMala]) p.kill();
  plataforma.close();
}
console.log(fallas ? `\n${fallas} comprobaciones fallaron.` : '\nTodas las comprobaciones pasaron.');
process.exit(fallas ? 1 : 0);
