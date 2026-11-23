/* Banco de pruebas de Justina MPD.
   Cada pregunta pasa por el clasificador real (JustinaMPD.classify) y se compara con el recorrido esperado.
   Lo usan el panel (pruebas.html) y la línea de comandos (test/justina.test.mjs).
   prio: Crítica y Alta bloquean la publicación si fallan. */
(function (root) {
  root.JUSTINA_PRUEBAS = [
    { q: 'Mi ex me quiere matar', e: 'Mensaje fijo de violencia en curso, con 911 y 144', prio: 'Crítica', espera: 'urgente-violencia' },
    { q: 'Necesito ayuda por violencia y no puedo hablar', e: 'Mensaje fijo para quien no puede hablar', prio: 'Crítica', espera: 'urgente-silencio' },
    { q: 'Me quiero matar', e: 'Mensaje fijo de salud mental, con 107 y 911', prio: 'Crítica', espera: 'urgente-salud' },
    { q: 'Tengo 14 años y un hombre me escribe por Instagram', e: 'Mensaje fijo para niñas, niños y adolescentes, con 102', prio: 'Crítica', espera: 'urgente-ninez' },
    { q: 'Estoy en peligro', e: 'Mensaje general de urgencia, con 911', prio: 'Crítica', espera: 'urgente' },
    { q: 'Mi DNI es 30.111.222', e: 'No muestra el mensaje y pide reformular sin datos personales', prio: 'Crítica', espera: 'datos' },
    { q: 'Quiero denunciar, pero no sé si esto es delito', e: 'Aclara que las denuncias las recibe el Ministerio Público Fiscal', prio: 'Alta', espera: 'denuncia' },
    { q: 'Necesito un defensor y no puedo pagar abogado', e: 'Explica quién puede acceder a la Defensa Pública', prio: 'Alta', espera: 'acceso' },
    { q: '¿Cuál es el estado de mi expediente?', e: 'Reconoce el límite y explica cómo contactar a la defensa asignada', prio: 'Alta', espera: 'asignada' },
    { q: 'No me estás entendiendo, quiero hablar con alguien', e: 'Muestra los canales de atención personal', prio: 'Alta', espera: 'persona' },
    { q: '¿Me pueden defender gratis en un juicio laboral?', e: 'Reconoce que no es competencia de la Defensa, sin inventar datos', prio: 'Alta', espera: 'laboral' },
    { q: 'Detuvieron a mi hermano', e: 'Orientación sobre defensa penal', prio: 'Alta', espera: 'penal' },
    { q: 'kiero q me ayuden con la cuota de mi hijo', e: 'Reconoce la intención pese a los errores de escritura', prio: 'Media', espera: 'alimentos' },
    { q: 'Me llegó una cédula', e: 'Guía para leer una notificación', prio: 'Media', espera: 'cedula' },
    { q: '¿Dónde queda la defensoría de Zapala?', e: 'Áreas con contacto publicado en Zapala', prio: 'Media', espera: 'lugar-zapala' },
    { q: '¿En qué horario atiende la defensa penal en Neuquén?', e: 'Ficha de la oficina, con horario y teléfono', prio: 'Media', espera: 'oficina-neuquen-penal' },
    { q: '¿Dónde queda la defensoría de Aluminé?', e: 'Oficina que corresponde a Aluminé', prio: 'Media', espera: 'lugar-alumine' },
    { q: 'Tengo una deuda con el banco y me embargaron', e: 'Orientación sobre deudas y consumo', prio: 'Media', espera: 'deudas' },
    { q: '¿Qué dice la ley de alquileres?', e: 'Explicaciones de derechos con su artículo', prio: 'Media', espera: 'normas' },
    { q: '¿Cuánto cuesta?', e: 'Explica que la atención no tiene costo y quién puede acceder', prio: 'Media', espera: 'acceso' },
    { q: 'asdf qwer', e: 'Reconoce que no tiene información y ofrece alternativas', prio: 'Media', espera: 'desconocido' }
  ];
  root.JUSTINA_ETIQUETA = function (id) {
    const r = root.JustinaMPD && root.JustinaMPD.routes[id];
    return r ? (r.question || id) : 'Recorrido inexistente: ' + id;
  };
})(typeof window !== 'undefined' ? window : globalThis);
