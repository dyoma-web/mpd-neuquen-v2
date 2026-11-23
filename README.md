# Justina MPD · Prototipo 2

Segunda versión del prototipo del **asistente de orientación de la Defensa Pública de Neuquén** (Ministerio Público de la Defensa): la página pública de Justina MPD, su ventana de conversación y el panel interno.

> ⚠️ **Prototipo.** No es un servicio oficial ni está conectado a los sistemas del Poder Judicial. No usa inteligencia artificial: el chat responde con textos predefinidos. La conversación con Justina MPD estará disponible cuando el Ministerio cuente con las herramientas y las autorizaciones necesarias. Las direcciones, horarios y teléfonos salen del directorio publicado por el MPD y deben validarse. Las cifras del panel son ficticias. El sitio se publica con `noindex`.

La versión 1 sigue en [mpd-neuquen](https://github.com/dyoma-web/mpd-neuquen).

## Qué incluye

| Página | Qué hace |
|---|---|
| **Guía de la sesión** (`index.html`) | Cómo comentar y qué revisar en cada pantalla |
| **Página de Justina MPD** (`asistente.html`) | Portada con el aviso de demostración, áreas de consulta, guía para leer una notificación, derechos en lenguaje claro, mapa de defensorías, preguntas frecuentes, accesibilidad y privacidad |
| **Ventana flotante** (`ventana.html`) | La ventana sobre un esquema del sitio actual del MPD, con la línea de instalación |
| **Pantalla completa** (`chat.html`) | La misma conversación, como en un celular |
| **Estados de la conversación** | Nueve momentos, cada uno con un chat que funciona desde ese punto |
| **Cómo funciona** | Qué hace y qué no, estado actual, datos, urgencias, accesibilidad y términos |
| **Mapa de recorridos** | Se arma solo con el contenido real del chat: recorridos, señales de urgencia y localidades |
| **Panel: Resumen** | Métricas ficticias, conversaciones para revisar y **Conexión y visibilidad** |
| **Panel: Respuestas y directorio** | Editor de las respuestas reales del chat con vista previa, mensajes de urgencia y directorio de oficinas |
| **Panel: Banco de pruebas** | Ejecuta las preguntas de prueba contra el clasificador real y bloquea la publicación si falla una crítica o alta |

## Una sola conversación

Todo el prototipo usa el mismo motor, `assets/js/justina-ventana.js`, que tiene tres partes:

1. **Contenido:** recorridos por botones, directorio de oficinas, derechos y guía de documentos.
2. **Clasificador de preguntas escritas**, por palabras clave. Revisa primero las señales de urgencia (niñez en riesgo, violencia sin poder hablar, violencia en curso, salud mental), después los datos personales y por último el tema.
3. **Interfaz**, como ventana flotante (`<mpd-justina>`) o incrustada en una página (`data-justina-inline`).

Cada página elige cómo cargarlo con `motor:` en el front-matter: `justina` (con ventana flotante) o `justina-incrustada` (solo conversaciones dentro de la página).

## Mostrar u ocultar el chat

`assets/js/justina-config.js` es el único archivo que hay que tocar:

```js
window.JUSTINA_CONFIG = {
  visible: true,              // false oculta el chat y los botones que lo abren
  modo: 'demostracion',       // 'conectado' envía las preguntas escritas al conector
  conector: { url: '', estadoUrl: '' },
  aviso: 'Versión de demostración. …',
  vistaPrevia: true           // solo para el prototipo
};
```

Con el chat oculto, la guía de documentos, los derechos y el mapa siguen funcionando: los botones con `data-chat` desaparecen y aparecen los marcados con `data-sin-chat`.

En el prototipo (`vistaPrevia: true`) se puede probar sin tocar archivos: con `?chat=oculto` o `?chat=visible` en la dirección, o con el interruptor de **Panel › Conexión y visibilidad**, que cambia solo el navegador de quien lo usa. En producción, `vistaPrevia` va en `false` y la visibilidad la decide el servidor.

## Conector genérico para plataformas de consulta (RAG)

Queda construido y apagado en [`conector/`](conector/). Es un servidor pequeño de Node.js, sin dependencias, que actúa de intermediario: es la única pieza que conoce la clave de la plataforma.

```
navegador ──POST /api/chat──▶ conector (clave en el servidor) ──▶ plataforma de consulta
          ◀── { reply, sources } ──
navegador ──GET /api/estado──▶ { visible, modo }
```

- **Configurable sin tocar el código** (`conector/.env.ejemplo`): dirección y clave de la plataforma, cabecera de autenticación, forma del pedido (`messages` o `question`), formato de la respuesta (`json`, `sse` o `ndjson`) y el campo donde viene el texto.
- **Apagado por defecto:** sin `RAG_URL`, `RAG_CLAVE` y `CHAT_OPERATIVO=1`, `/api/chat` responde 503 y el chat sigue en demostración.
- **`CHAT_VISIBLE`** muestra u oculta el chat para todas las personas, sin volver a publicar el sitio.
- **Protecciones:** solo POST con JSON, validación de roles, cantidad y largo de los mensajes, tiempo de espera, límite de pedidos por minuto, orígenes permitidos, `Cache-Control: no-store` y errores genéricos hacia el navegador.
- **En la página:** las señales de urgencia y los mensajes con datos personales nunca se envían. Si el conector falla, el chat vuelve a la respuesta predefinida.

```bash
node conector/prueba.mjs      # comprobaciones contra una plataforma simulada
node conector/servidor.mjs    # levanta el conector con las variables de entorno
```

Para conectar el sitio: publicar el conector en el mismo dominio y poner `conector: { url: '/api/chat', estadoUrl: '/api/estado' }` en `justina-config.js`. Si la plataforma responde con una estructura que estas opciones no cubren, hay que agregar un adaptador en `normalizar()`.

## Mapa de defensorías

Usa [Leaflet](https://leafletjs.com/) con la cartografía oficial del Instituto Geográfico Nacional (Argenmap) y, si no responde, OpenStreetMap. La librería y las imágenes se piden recién cuando la sección está por verse. Si no se pueden cargar, queda el esquema de la provincia y todo sigue funcionando.

Hoy Leaflet se carga desde `unpkg.com` con verificación de integridad. Para la entrega conviene copiarla dentro del sitio.

## Modo revisión (comentarios en vivo)

Se activa abriendo cualquier página con `?revision=CÓDIGO` (o `?revision` para escribirlo). Usa el [hub de revisión](https://github.com/dyoma-web/review-hub): este sitio es `mpd-neuquen-v2` en la tabla `rv_sites`. `assets/js/review.js` y `assets/css/review.css` se copian del hub con `scripts/sync-client.mjs`; no se editan aquí. El código de sesión no está en este repositorio.

Dentro de la ventana del chat no se pueden anclar comentarios a un mensaje o botón: el comentario queda sobre la ventana completa.

## Estructura

```
src/
  layout.html · layout-justina.html   plantillas
  partials/panel-side                 menú lateral del panel
  pages/*.html                        cada pantalla (front-matter: layout, motor, scripts)
assets/
  css/justina.css        página de Justina MPD
  css/tema.css           barra del prototipo, cabecera y pie comunes
  css/proto.css · site.css   pantallas de documentación y panel
  js/justina-config.js   visibilidad, modo y conector
  js/justina-ventana.js  motor de la conversación (instalable en otro sitio)
  js/justina-pagina.js   menú, accesibilidad, leyes, mapa y fotos de la página
  js/justina-pruebas.js  banco de pruebas
  js/app.js · panel.js · fichas.js · pruebas.js · temas.js
  js/review.js · css/review.css   modo revisión (copiados del hub)
conector/                intermediario para plataformas de consulta
test/justina.test.mjs    banco de pruebas en la línea de comandos (corre en cada publicación)
```

## Uso

Requiere Node.js 18 o superior. No hay dependencias que instalar.

```bash
npm test           # banco de pruebas del chat
npm run build      # genera dist/
npm run preview    # genera y sirve dist/ en http://localhost:3000
```

Cada push a `main` ejecuta `.github/workflows/pages.yml`: corre el banco de pruebas, compila y publica en GitHub Pages. La prueba de Aluminé falla a propósito (prioridad media) hasta que la Defensa defina qué oficina le corresponde.

## Pendiente

- Validar con el MPD las direcciones, horarios y teléfonos del directorio, y el uso del logo y de las fotos.
- Aprobar con la Defensa y PNUD los cuatro mensajes de urgencia y las respuestas marcadas como pendientes.
- Confirmar el uso del nombre «Justina MPD» en una página que todavía no se conecta con el sistema del Poder Judicial.
- Ubicar en el mapa las oficinas que no tienen coordenadas (Andacollo, Añelo, Rincón de los Sauces y San Martín de los Andes).
- Decidir si la versión final lleva «salida rápida», que estaba en la versión 1 y no está en este diseño.
- Copiar Leaflet dentro del sitio antes de la entrega.
