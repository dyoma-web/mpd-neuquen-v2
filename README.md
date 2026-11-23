# Justina MPD · Prototipo 2

Segunda versión del prototipo del **asistente de orientación de la Defensa Pública de Neuquén** (Ministerio Público de la Defensa). Suma la página pública de Justina MPD, con su ventana de conversación, y aplica ese diseño a las pantallas de la versión 1, que se conservan.

> ⚠️ **Prototipo.** No es un servicio oficial ni está conectado a los sistemas del Poder Judicial. No usa inteligencia artificial: el chat responde con textos predefinidos. Las direcciones, horarios y teléfonos salen del directorio publicado por el MPD y deben validarse. Las cifras del panel son ficticias. El sitio se publica con `noindex`.

La versión 1 sigue en [mpd-neuquen](https://github.com/dyoma-web/mpd-neuquen).

## Qué incluye

| Página | Qué hace |
|---|---|
| **Guía de la sesión** (`index.html`) | Cómo comentar y qué revisar en cada pantalla |
| **Página de Justina MPD** (`asistente.html`) | Nueva. Portada, áreas de consulta, guía para leer una notificación, derechos en lenguaje claro, mapa de defensorías, preguntas frecuentes, accesibilidad y privacidad |
| **Ventana flotante** (`ventana.html`) | La ventana de Justina MPD sobre un esquema del sitio actual del MPD, con la línea de instalación |
| **Conversación guiada** (`chat.html`) | El chat con fichas de la versión 1, a pantalla completa |
| **Estados de la conversación** | Nueve momentos de la conversación guiada |
| **Cómo funciona** | Qué hace y qué no, datos, urgencias, accesibilidad y términos |
| **Mapa de temas** | Árboles guiados, señales de urgencia, localidades y circunscripciones |
| **Panel: Resumen, Fichas y Banco de pruebas** | Panel interno de la Defensa, sobre la conversación guiada |

## Dos conversaciones

En esta versión conviven dos motores, que nunca se cargan en la misma página porque ambos usan el atributo `data-chat`:

- **`justina`** (`assets/js/justina-ventana.js`): la ventana flotante nueva. Es un componente aislado (`<mpd-justina>`) con sus rutas, su directorio de oficinas y su clasificador por palabras clave. La usan la página de Justina MPD y la ventana flotante.
- **`guiada`** (`assets/js/data.js` + `chat.js`): el chat con fichas de la versión 1. Lo usan los estados, la pantalla completa y el panel. El banco de pruebas corre sobre este motor.

Cada página elige el suyo con `motor:` en el front-matter. Queda pendiente decidir cómo se unifican.

## Instalación de la ventana en otro sitio

```html
<script src="https://[dominio]/assets/js/justina-ventana.js" defer></script>
```

No modifica la página anfitriona, no usa cookies y no se conecta a ningún servidor. Cualquier botón con `data-chat` (o `data-chat="alimentos"`, por ejemplo) abre una consulta.

## Modo revisión (comentarios en vivo)

Se activa abriendo cualquier página con `?revision=CÓDIGO` (o `?revision` para escribirlo). Usa el [hub de revisión](https://github.com/dyoma-web/review-hub): este sitio es `mpd-neuquen-v2` en la tabla `rv_sites`. `assets/js/review.js` y `assets/css/review.css` se copian del hub con `scripts/sync-client.mjs`; no se editan aquí. El código de sesión no está en este repositorio.

Límites conocidos:

- Dentro de la ventana de Justina MPD no se pueden anclar comentarios a un mensaje o botón: el comentario queda sobre la ventana completa. Para opinar sobre una respuesta, conviene citarla en el comentario.
- En modo revisión, la ventana sube para no quedar bajo la barra de comentarios y los diálogos de accesibilidad y privacidad se abren sin bloquear la página.

## Estructura

```
src/
  layout.html            plantilla de las pantallas de documentación y del panel
  layout-justina.html    plantilla de la página de Justina MPD
  partials/panel-side    menú lateral del panel
  pages/*.html           cada pantalla (con front-matter: layout, motor, scripts)
assets/
  css/justina.css        estilos de la página de Justina MPD
  css/tema.css           barra del prototipo, cabecera y pie comunes
  css/proto.css · site.css   pantallas de la versión 1, con la paleta y las fuentes nuevas
  css/review.css         modo revisión (copiado del hub)
  js/justina-ventana.js  ventana de conversación (instalable en otro sitio)
  js/justina-pagina.js   menú, accesibilidad, leyes, mapa y fotos de la página
  js/data.js · chat.js   conversación guiada y su base de conocimiento
  js/app.js · panel.js · fichas.js · pruebas.js
  js/review.js           modo revisión (copiado del hub)
  fonts/                 Roboto y Open Sans (sin dependencias externas)
  img/justina/           logo del MPD y fotos de notas publicadas por el MPD
test/chat.test.mjs       banco de pruebas de la conversación guiada (corre en cada publicación)
```

## Uso

Requiere Node.js 18 o superior. No hay dependencias que instalar.

```bash
npm test           # banco de pruebas de la conversación guiada
npm run build      # genera dist/
npm run preview    # genera y sirve dist/ en http://localhost:3000
```

Cada push a `main` ejecuta `.github/workflows/pages.yml`: corre el banco de pruebas, compila y publica en GitHub Pages.

## Pendiente

- Validar con el MPD las direcciones, horarios y teléfonos del directorio, y el uso del logo y de las fotos.
- Confirmar con el MPD y PNUD el uso del nombre «Justina MPD» en una página que todavía no se conecta con el sistema del Poder Judicial.
- Unificar los dos motores de conversación y definir qué alimenta el panel.
- Agregar pruebas automáticas del clasificador de la ventana nueva.
- Reemplazar el mapa incrustado de Google Maps por un enlace, si la Defensa prefiere no cargar servicios externos.
- Completar los datos entre corchetes de las pantallas de la versión 1.
