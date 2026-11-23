/* Configuración de Justina MPD en este sitio.
   Es el único archivo que hay que tocar para mostrar u ocultar el chat o para conectarlo.

   visible      true muestra el chat. false lo oculta junto con los botones que lo abren:
                el resto de la página (guía, derechos y mapa) sigue funcionando.
   modo         'demostracion' responde con textos predefinidos y muestra el aviso.
                'conectado' envía las preguntas escritas al conector.
   conector     url: dirección del intermediario en el propio dominio (por ejemplo, '/api/chat').
                estadoUrl: si se indica, la visibilidad y el modo se leen del servidor ('/api/estado')
                y lo que diga el servidor reemplaza a este archivo.
   aviso        Texto que se muestra dentro de la ventana mientras el chat está en demostración.
   vistaPrevia  Solo para el prototipo: habilita ?chat=oculto y el interruptor del panel,
                que cambian la visibilidad en el navegador de quien revisa. En producción va en false. */
window.JUSTINA_CONFIG = {
  visible: true,
  modo: 'demostracion',
  conector: { url: '', estadoUrl: '' },
  aviso: 'Versión de demostración. La conversación con Justina MPD estará disponible cuando el Ministerio cuente con las herramientas y las autorizaciones necesarias. Mientras tanto, responde con textos predefinidos.',
  vistaPrevia: true
};
