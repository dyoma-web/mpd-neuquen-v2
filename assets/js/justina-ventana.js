/* ==========================================================================
   Justina MPD · ventana de conversación autónoma
   Instalación en cualquier sitio con una sola línea:
     <script src="https://…/assets/js/justina-ventana.js" defer></script>
   Agrega el botón flotante y la ventana dentro de un componente aislado
   (<mpd-justina>), sin modificar el resto de la página ni usar cookies.
   Los botones de la página anfitriona con data-chat abren una consulta.
   Las respuestas son predefinidas: no se conecta a ningún servidor.
   ========================================================================== */
(() => {
  if (document.querySelector('mpd-justina')) return;
  const base = 'https://www.mpdneuquen.gob.ar/';
  const soj = base + 'index.php/civil/soj';
  const penal = base + 'index.php/penal/servicio-de-gestion-penal';
  const ninez = base + 'index.php/ninez-y-adolescencia/33';
  const civil = base + 'index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion';
  const funciones = base + 'index.php/institucional/que-es-el-mpd';
  const fiscalia = 'https://www.mpfneuquen.gob.ar/mpf/index.php/es/contacto';
  const infoleg = 'https://www.infoleg.gob.ar/index/';
  const buscador = 'https://www.argentina.gob.ar/normativa';
  const choice = (id, label) => ({id,label});
  const source = (url, label) => ({url,label});
  const areas = [choice('civil','Civil y familia'),choice('ninez','Niñez y adolescencia'),choice('penal','Defensa penal')];
  const hello = [choice('cedula','Me llegó un papel'),choice('temas','Orientarme por tema'),choice('normas','Conocer mis derechos'),choice('mapa','Encontrar una defensoría'),choice('asignada','Ya tengo defensa')];

  // Las respuestas reproducibles permiten que las mesas de entrada revisen cada recorrido.
  const routes = {
    funciones:{question:'¿Qué hace la Defensa Pública?',text:'La Defensa Pública puede asesorarte y representarte. Si hace falta presentar un pedido, la defensoría puede hacerlo en tu nombre. Quien decide es el juzgado o el tribunal. ¿Sobre qué tema querés consultar?',links:[source(funciones,'Funciones del MPD')],choices:areas},
    civil:{question:'Quisiera orientación en materia civil o de familia.',text:'Para una primera consulta sobre familia o un asunto civil, podés acudir al Servicio de Orientación Jurídica (SOJ). Allí escuchan lo que te pasa, te explican las opciones y evalúan si corresponde asignarte una defensa. ¿Qué necesitás saber?',links:[source(soj,'Servicio de Orientación Jurídica')],choices:[choice('alimentos','Cuota alimentaria'),choice('requisitos','Documentación para el SOJ'),choice('sedes','Ubicar el SOJ'),choice('asignada','Ya tengo defensa')]},
    alimentos:{question:'¿Dónde consulto por la cuota alimentaria?',text:'Si querés pedir o cambiar una cuota alimentaria, el primer contacto es el Servicio de Orientación Jurídica de tu localidad. Si ya te acompaña una defensora o un defensor, consultá con ese equipo. También podés leer qué gastos comprende la cuota.',links:[source(soj,'Información oficial del SOJ')],choices:[choice('sedes','Buscar mi oficina'),choice('leycuota','Qué dice el artículo 659'),choice('asignada','Contactar a mi defensa')]},
    requisitos:{question:'¿Qué documentación preparo para la primera consulta?',text:'Antes de ir, revisá la lista de documentos que publica el Servicio de Orientación Jurídica. Allí también está el formulario sobre bienes e ingresos. Si te falta algo o no sabés qué llevar, llamá a la sede y consultá por tu situación.',links:[source(soj,'Ver requisitos y formularios del SOJ')],choices:[choice('sedes','Consultar con mi oficina')]},
    otra:{question:'Necesito atención en otra localidad.',text:'Si tu localidad no aparece, podés abrir el directorio provincial o llamar a la Defensoría General. Preguntá qué oficina te corresponde y cómo pedir la primera entrevista.',links:[source(soj,'Directorio provincial del SOJ'),source('tel:+542995255042','Llamar a la Defensoría General · (0299) 525 5042')]},
    ninez:{question:'Quisiera consultar por derechos de niñas, niños o adolescentes.',text:'Si te preocupa algo que le pasa a una niña, a un niño o a un adolescente, podés hablar con la defensoría de niñez. Si sos adolescente, también podés consultar por tu cuenta. Reservá los nombres y los datos familiares para esa conversación.',links:[source(ninez,'Sedes y contactos de niñez')],choices:[choice('adolescente','Soy adolescente'),choice('escuela','Consulto desde una escuela'),choice('leyvoz','Conocer el derecho a ser escuchado'),choice('persona','Atención personal')]},
    adolescente:{question:'Soy adolescente. ¿Puedo consultar personalmente?',text:'Sí. Podés llamar o acercarte a la defensoría de niñez y pedir hablar con alguien de su equipo. Para encontrar la oficina, alcanza con saber tu localidad. Guardá lo que quieras contar para esa conversación.',links:[source(ninez,'Ver dónde consultar')]},
    escuela:{question:'Trabajo en una escuela. ¿Dónde consulto?',text:'Consultá a la mesa de entrada de la defensoría de niñez sobre cómo presentar un informe desde tu escuela. Compartí los nombres de estudiantes y el informe únicamente por el canal que te indique el equipo.',links:[source(ninez,'Contactos de la defensoría de niñez')]},
    penal:{question:'Necesito orientación sobre defensa penal.',text:'Si ya tenés defensa, ese equipo puede explicarte qué ocurrió en una audiencia y qué paso sigue. Si necesitás ubicar a quien puede atenderte, consultá al Servicio de Gestión Penal. ¿Qué querés hacer?',links:[source(penal,'Servicio de Gestión Penal')],choices:[choice('asignada','Ya tengo defensa'),choice('cedula','Recibí una cédula'),choice('audiencia','No entendí la audiencia'),choice('leydefensa','Qué dice la Constitución')]},
    audiencia:{question:'No comprendí lo que sucedió en la audiencia.',text:'Podés decirle a tu defensa: «No entendí qué decidió el tribunal. ¿Qué tengo que hacer ahora?». Si te cuesta acercarte, preguntá si pueden hablar por teléfono o videollamada.',links:[source(penal,'Consultar el Servicio de Gestión Penal')],choices:[choice('asignada','Necesito ubicar a mi equipo')]},
    asignada:{question:'Ya tengo defensa. ¿Cómo continúo una consulta?',text:'Buscá el teléfono o el correo que te dio tu defensoría. Ese equipo puede consultar tu expediente y explicarte cómo sigue. Si perdiste el contacto, podés localizar la oficina en los directorios o llamar a la Defensoría General.',links:[source(civil,'Directorio de defensorías civiles'),source(penal,'Servicio de Gestión Penal'),source(ninez,'Defensorías de niñez'),source('tel:+542995255042','Defensoría General · (0299) 525 5042')]},
    fiscal:{question:'En el encabezado dice Fiscalía.',text:'Buscá en el directorio de la Fiscalía la oficina y la localidad que aparecen en el papel. Ahí tenés el contacto para preguntar por la comunicación. Si tenés defensa, también podés pedirle que te explique qué significa.',links:[source(fiscalia,'Directorio del Ministerio Público Fiscal')],choices:[choice('asignada','Contactar a mi defensa')]},
    defensa:{question:'El documento menciona una defensoría.',text:'Fijate si la defensoría firma el aviso o si aparece como lugar donde pedir orientación. Si dice «Servicio de Orientación Jurídica» o «SOJ», podés buscar el teléfono de tu sede en este directorio.',links:[source(soj,'Contactos del SOJ'),source(base,'Portal del MPD')],choices:[choice('persona','Necesito ayuda para ubicarla')]},
    juzgado:{question:'En el encabezado dice Juzgado.',text:'Buscá el nombre del juzgado, la localidad y los datos de contacto que figuran en el aviso. Si tenés defensa, pedile ayuda para entender el documento. También podés consultar directamente con el juzgado que lo envió.',links:[source('https://www.jusneuquen.gob.ar/','Portal del Poder Judicial')],choices:[choice('asignada','Ya tengo defensa'),choice('persona','Buscar atención personal')]},
    ilegible:{question:'No logro identificar la oficina en el documento.',text:'Guardá el papel para mostrárselo a tu defensa o a la mesa de entrada. Si distinguís una fecha o un plazo, llamá cuanto antes. No subas el documento al chat. El equipo que te atienda podrá revisarlo con vos.',choices:[choice('persona','Ver canales de atención')]},
    persona:{question:'Prefiero hablar con una persona.',text:'Si es tu primera consulta por un tema de familia, elegí el Servicio de Orientación Jurídica. Para derechos de niñas, niños o adolescentes y para defensa penal, usá el contacto del área. Si dudás, llamá a la Defensoría General. El contacto con la oficina lo iniciás vos.',links:[source(soj,'SOJ · atención civil y de familia'),source(ninez,'Mesa de entrada de niñez'),source(penal,'Servicio de Gestión Penal'),source('tel:+542995255042','Defensoría General · (0299) 525 5042')]},
    salud:{question:'Busco orientación sobre derechos en salud mental.',text:'Podés comunicarte con el Órgano Provincial de Revisión de Salud Mental para consultar por derechos de las personas que usan servicios de salud mental. Guardá los datos personales y de salud para hablar directamente con su equipo.',links:[source(base+'index.php/salud-mental','Órgano Provincial de Revisión de Salud Mental')]},
    limite:{question:'¿Cómo me puede ayudar Justina MPD?',text:'Podés encontrar una oficina, leer sobre tus derechos y preparar preguntas para una entrevista. Si necesitás que alguien revise tu caso, un documento o un plazo, comunicate con tu equipo de defensa.',choices:[choice('persona','Atención personal'),choice('primera','Explorar una consulta')]},
    urgente:{text:'Si hay peligro inmediato, pedí ayuda ahora al servicio local de emergencias. El chat ofrece orientación automática y no recibe pedidos de emergencia. Si recibiste un aviso con una fecha próxima o un plazo, contactá cuanto antes a la oficina que lo envió o a tu defensa.',choices:[choice('persona','Ver canales del MPD'),choice('cedula','Identificar la oficina emisora')]},
    privacidad:{question:'¿Cómo se cuidan mis datos?',text:'Podés usar Justina MPD sin identificarte. La pregunta se procesa en esta pestaña. Tus mensajes no se envían al MPD ni a otros servicios. Para borrar la conversación, elegí «Finalizar y borrar» y confirmá. También se borra al recargar la página.\n\nLa Ley 25.326 reconoce tu derecho a conocer los datos que un organismo guarda sobre vos y a pedir que se corrijan, se actualicen o se eliminen cuando corresponda. Si necesitás hablar de tu caso, el personal del MPD debe mantener la confidencialidad de la información que le confiás.',links:[source('https://www.argentina.gob.ar/normativa/nacional/norma-64790/actualizacion','Ley nacional de Protección de los Datos Personales'),source('https://boficial.neuquen.gov.ar/Boletines/2788%2013-09-02.pdf#page=14','Adhesión de Neuquén (Ley 2399, PDF)'),source('https://www.mpdneuquen.gob.ar/images/defensoria_gral/Leyorgmpd.pdf#page=2','Confidencialidad en la Defensa Pública (art. 5, inc. c, PDF)')],choices:[choice('persona','Contactar a una defensoría')]},
    datos:{text:'Podés volver a escribir la pregunta sin datos que identifiquen a alguien. Dejá afuera nombres, teléfonos, correos, DNI, domicilios y números de expediente.',choices:hello},
    desconocido:{text:'No encontré información para esa pregunta. Podés elegir un tema, consultar una fuente oficial o buscar el contacto de una persona que pueda orientarte.',choices:[...areas,choice('normas','Leer una ley'),choice('persona','Atención personal')]},
  };
  const cities = [
  {
    "id": "andacollo",
    "name": "Andacollo",
    "circuit": "Alto Neuquén",
    "lat": -37.179745,
    "lon": -70.66996,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58077010",
    "offices": [
      {
        "id": "andacollo-comunidad",
        "name": "Justicia en tu Comunidad",
        "topic": "comunidad",
        "address": "Av. Gobernador Felipe Sapag 303 (Juzgado de Paz)",
        "street": "Av. Gobernador Felipe Sapag 303",
        "hours": "Jueves de 9 a 13:30 h",
        "phone": "0299 6375960",
        "phoneLabel": "Información y Asistencia provincial",
        "note": "Orientación sin turno. Los equipos especializados se alternan en el interior. El teléfono corresponde a Información y Asistencia provincial.",
        "source": "https://www.jusneuquen.gov.ar/red-de-acceso/",
        "moreSource": "https://www.noticiasjusneuquen.gob.ar/red-de-justicia-y-acceso-comunitario/",
        "tel": "+542996375960"
      }
    ]
  },
  {
    "id": "anelo",
    "name": "Añelo",
    "circuit": "Vaca Muerta",
    "lat": -38.354256,
    "lon": -68.787543,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58014010",
    "offices": [
      {
        "id": "anelo-comunidad",
        "name": "Justicia en tu Comunidad",
        "topic": "comunidad",
        "address": "Bajada de las Patrias y Carlos Pellegrini",
        "street": "Bajada de las Patrias y Carlos Pellegrini",
        "hours": "Miércoles de 9 a 13:30 h",
        "phone": "0299 6375960",
        "phoneLabel": "Información y Asistencia provincial",
        "note": "Orientación sin turno. Los equipos especializados se alternan en el interior. El teléfono corresponde a Información y Asistencia provincial.",
        "source": "https://www.jusneuquen.gov.ar/red-de-acceso/",
        "moreSource": "https://www.noticiasjusneuquen.gob.ar/red-de-justicia-y-acceso-comunitario/",
        "tel": "+542996375960"
      }
    ]
  },
  {
    "id": "chos",
    "name": "Chos Malal",
    "circuit": "Alto Neuquén",
    "lat": -37.374828,
    "lon": -70.276331,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58042010",
    "offices": [
      {
        "id": "chos-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Sarmiento y 9 de Julio, planta baja",
        "street": "Sarmiento y 9 de Julio",
        "phone": "02948 421386",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "extension": "136",
        "floor": "planta baja",
        "lat": -37.380757,
        "lon": -70.268342,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Sarmiento+y+9+de+Julio&provincia=58&localidad=Chos+Malal&max=2",
        "tel": "+542948421386"
      },
      {
        "id": "chos-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "Sarmiento y 9 de Julio",
        "street": "Sarmiento y 9 de Julio",
        "phone": "02948 421386",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "extension": "136",
        "lat": -37.380757,
        "lon": -70.268342,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Sarmiento+y+9+de+Julio&provincia=58&localidad=Chos+Malal&max=2",
        "tel": "+542948421386",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "02948 421386",
            "extension": "136"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "02948 421386",
            "extension": "136"
          }
        ]
      },
      {
        "id": "chos-ninez",
        "name": "Defensoría de los Derechos del Niño, Niña y Adolescente",
        "topic": "ninez",
        "address": "Sarmiento y 9 de Julio",
        "street": "Sarmiento y 9 de Julio",
        "phone": "02948 421386",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/ninez-y-adolescencia/33",
        "extension": "144",
        "lat": -37.380757,
        "lon": -70.268342,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Sarmiento+y+9+de+Julio&provincia=58&localidad=Chos+Malal&max=2",
        "tel": "+542948421386"
      },
      {
        "id": "chos-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "Sarmiento y 9 de Julio",
        "street": "Sarmiento y 9 de Julio",
        "phone": "02948 421386",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "extension": "122",
        "lat": -37.380757,
        "lon": -70.268342,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Sarmiento+y+9+de+Julio&provincia=58&localidad=Chos+Malal&max=2",
        "tel": "+542948421386"
      }
    ]
  },
  {
    "id": "cutral",
    "name": "Cutral Có",
    "circuit": "de la Comarca",
    "lat": -38.937911,
    "lon": -69.229366,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58035040",
    "offices": [
      {
        "id": "cutral-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Misiones 551, planta baja",
        "street": "Misiones 551",
        "phone": "0299 6575185",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "floor": "planta baja",
        "lat": -38.933808,
        "lon": -69.215473,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Misiones+551&provincia=58&localidad=Cutral+Co&max=2",
        "tel": "+542996575185"
      },
      {
        "id": "cutral-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "",
        "street": "",
        "phone": "0299 4969698",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "note": "Las publicaciones del MPD indican dos direcciones para este servicio. Confirmá el edificio por teléfono antes de ir.",
        "tel": "+542994969698",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "0299 4969698"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "0299 4969698"
          }
        ]
      },
      {
        "id": "cutral-ninez",
        "name": "Defensoría de los Derechos del Niño, Niña y Adolescente",
        "topic": "ninez",
        "address": "J. J. Valle 510, planta baja",
        "street": "J. J. Valle 510",
        "phone": "0299 4969697",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/ninez-y-adolescencia/33",
        "floor": "planta baja",
        "lat": -38.933176,
        "lon": -69.214239,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Juan+Jos%C3%A9+Valle+510&provincia=58&localidad=Cutral+Co&max=2",
        "tel": "+542994969697"
      },
      {
        "id": "cutral-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "J. J. Valle 510",
        "street": "J. J. Valle 510",
        "phone": "0299 4969698",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "lat": -38.933176,
        "lon": -69.214239,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Juan+Jos%C3%A9+Valle+510&provincia=58&localidad=Cutral+Co&max=2",
        "tel": "+542994969698"
      }
    ]
  },
  {
    "id": "junin",
    "name": "Junín de los Andes",
    "circuit": "de los Lagos del Sur",
    "lat": -39.950885,
    "lon": -71.070864,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58049010",
    "offices": [
      {
        "id": "junin-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Lamadrid 130",
        "street": "Lamadrid 130",
        "phone": "02972 430189",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "lat": -39.949692,
        "lon": -71.073681,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Lamadrid+130&provincia=58&localidad=Jun%C3%ADn+de+los+Andes&max=2",
        "tel": "+542972430189"
      },
      {
        "id": "junin-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "Lamadrid 130",
        "street": "Lamadrid 130",
        "phone": "02972 491307",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "lat": -39.949692,
        "lon": -71.073681,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Lamadrid+130&provincia=58&localidad=Jun%C3%ADn+de+los+Andes&max=2",
        "tel": "+542972491307",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "02972 491307"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "02972 491307"
          }
        ]
      },
      {
        "id": "junin-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "Lamadrid 130",
        "street": "Lamadrid 130",
        "phone": "02972 492870",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "lat": -39.949692,
        "lon": -71.073681,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Lamadrid+130&provincia=58&localidad=Jun%C3%ADn+de+los+Andes&max=2",
        "tel": "+542972492870"
      }
    ]
  },
  {
    "id": "neuquen",
    "name": "Neuquén",
    "circuit": "Confluencia",
    "lat": -38.951829,
    "lon": -68.059181,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58035070",
    "offices": [
      {
        "id": "neuquen-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Leloir y Entre Ríos",
        "street": "Leloir y Entre Ríos",
        "phone": "0299 5255078",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "note": "En la recepción del edificio te indican el piso del servicio.",
        "lat": -38.941829,
        "lon": -68.050644,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Doctor+Luis+Federico+Leloir+y+Entre+R%C3%ADos&provincia=58&localidad=Neuqu%C3%A9n&max=2",
        "tel": "+542995255078"
      },
      {
        "id": "neuquen-civil",
        "name": "Defensorías Públicas Civiles",
        "topic": "civil",
        "address": "Leloir y Entre Ríos, planta baja",
        "street": "Leloir y Entre Ríos",
        "phone": "0299 5255079",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "floor": "planta baja",
        "note": "Si ya tenés una defensoría asignada, verificá su número en el directorio civil del MPD.",
        "lat": -38.941829,
        "lon": -68.050644,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Doctor+Luis+Federico+Leloir+y+Entre+R%C3%ADos&provincia=58&localidad=Neuqu%C3%A9n&max=2",
        "tel": "+542995255079",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "0299 5255079"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "0299 5255080"
          },
          {
            "name": "Defensoría Pública Civil N.º 3",
            "phone": "0299 5255081"
          },
          {
            "name": "Defensoría Pública Civil N.º 4",
            "phone": "0299 5255082"
          },
          {
            "name": "Defensoría Pública Civil N.º 5",
            "phone": "0299 5255083"
          },
          {
            "name": "Defensoría Pública Civil N.º 6",
            "phone": "0299 5255084"
          },
          {
            "name": "Defensoría Pública Civil N.º 7",
            "phone": "0299 5255085"
          },
          {
            "name": "Defensoría Pública Civil N.º 8",
            "phone": "0299 5255086"
          },
          {
            "name": "Defensoría Pública Civil N.º 9",
            "phone": "0299 5255085"
          },
          {
            "name": "Defensoría Pública Civil N.º 10",
            "phone": "0299 5255086"
          },
          {
            "name": "Defensoría Civil Patrimonial (primer piso)",
            "phone": "0299 5255052"
          }
        ],
        "phoneLabel": "Defensoría N.º 1"
      },
      {
        "id": "neuquen-ninez",
        "name": "Mesa de entradas de las defensorías de niñez y adolescencia",
        "topic": "ninez",
        "address": "Leloir y Entre Ríos, primer piso",
        "street": "Leloir y Entre Ríos",
        "phone": "0299 5255000",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/ninez-y-adolescencia/33",
        "extension": "5626",
        "floor": "primer piso",
        "lat": -38.941829,
        "lon": -68.050644,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Doctor+Luis+Federico+Leloir+y+Entre+R%C3%ADos&provincia=58&localidad=Neuqu%C3%A9n&max=2",
        "tel": "+542995255000",
        "units": [
          {
            "name": "Defensoría de Niñez y Adolescencia N.º 1 (planta baja)",
            "phone": "0299 5255076"
          },
          {
            "name": "Defensoría de Niñez y Adolescencia N.º 2 (planta baja)",
            "phone": "0299 5255077"
          },
          {
            "name": "Defensoría de Niñez y Adolescencia N.º 3 (planta baja)",
            "phone": "0299 5469309"
          }
        ]
      },
      {
        "id": "neuquen-penal",
        "name": "Equipos de la Defensa Pública Penal",
        "topic": "penal",
        "address": "Leloir y Entre Ríos, primer piso, ala norte",
        "street": "Leloir y Entre Ríos",
        "phone": "0299 5255033",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "floor": "primer piso, ala norte",
        "note": "La agenda del MPD identifica los teléfonos de los demás equipos.",
        "lat": -38.941829,
        "lon": -68.050644,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Doctor+Luis+Federico+Leloir+y+Entre+R%C3%ADos&provincia=58&localidad=Neuqu%C3%A9n&max=2",
        "tel": "+542995255033",
        "units": [
          {
            "name": "Equipo Operativo N.º 1",
            "phone": "0299 5255033"
          },
          {
            "name": "Equipo Operativo N.º 2",
            "phone": "0299 5255034"
          },
          {
            "name": "Equipo Operativo N.º 3",
            "phone": "0299 5255035"
          },
          {
            "name": "Equipo Operativo N.º 4",
            "phone": "0299 5255036"
          }
        ],
        "phoneLabel": "Equipo N.º 1"
      },
      {
        "id": "neuquen-comunidad",
        "name": "Justicia en tu Comunidad",
        "topic": "comunidad",
        "address": "CPC El Nido, Barrio 7 de Mayo",
        "street": "CPC El Nido, Barrio 7 de Mayo",
        "hours": "Jueves de 8 a 14 h",
        "phone": "0299 6375960",
        "phoneLabel": "Información y Asistencia provincial",
        "note": "Orientación sin turno. Los equipos especializados se alternan en el interior. El teléfono corresponde a Información y Asistencia provincial.",
        "source": "https://www.jusneuquen.gov.ar/red-de-acceso/",
        "moreSource": "https://www.noticiasjusneuquen.gob.ar/red-de-justicia-y-acceso-comunitario/",
        "tel": "+542996375960"
      }
    ]
  },
  {
    "id": "picun",
    "name": "Picún Leufú",
    "circuit": "del Limay",
    "lat": -39.518628,
    "lon": -69.291061,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58098020",
    "offices": [
      {
        "id": "picun-comunidad",
        "name": "Justicia en tu Comunidad",
        "topic": "comunidad",
        "address": "Buenos Aires y Pasaje Blanco (Concejo Deliberante, barrio Progreso)",
        "street": "Buenos Aires y Pasaje Blanco",
        "hours": "Jueves desde las 9 h. Confirmá la hora de cierre.",
        "phone": "0299 6375960",
        "phoneLabel": "Información y Asistencia provincial",
        "note": "Orientación sin turno. Los equipos especializados se alternan en el interior. El teléfono corresponde a Información y Asistencia provincial.",
        "source": "https://www.jusneuquen.gov.ar/red-de-acceso/",
        "moreSource": "https://www.noticiasjusneuquen.gob.ar/red-de-justicia-y-acceso-comunitario/",
        "lat": -39.516268,
        "lon": -69.292679,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Buenos+Aires+y+Pasaje+Blanco&provincia=58&localidad=Pic%C3%BAn+Leuf%C3%BA&max=2",
        "tel": "+542996375960"
      }
    ]
  },
  {
    "id": "piedra",
    "name": "Piedra del Águila",
    "circuit": "del Limay",
    "lat": -40.048479,
    "lon": -70.075016,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58028010",
    "offices": [
      {
        "id": "piedra-comunidad",
        "name": "Justicia en tu Comunidad",
        "topic": "comunidad",
        "address": "Excombatientes de Malvinas 27 (Juzgado de Paz)",
        "street": "Excombatientes de Malvinas 27",
        "hours": "Jueves de 8 a 14 h",
        "phone": "0299 6375960",
        "phoneLabel": "Información y Asistencia provincial",
        "note": "Orientación sin turno. Los equipos especializados se alternan en el interior. El teléfono corresponde a Información y Asistencia provincial.",
        "source": "https://www.jusneuquen.gov.ar/red-de-acceso/",
        "moreSource": "https://www.noticiasjusneuquen.gob.ar/red-de-justicia-y-acceso-comunitario/",
        "lat": -40.048829,
        "lon": -70.075922,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Excombatientes+de+Malvinas+27&provincia=58&localidad=Piedra+del+%C3%81guila&max=2",
        "tel": "+542996375960"
      }
    ]
  },
  {
    "id": "rincon",
    "name": "Rincón de los Sauces",
    "circuit": "Vaca Muerta",
    "lat": -37.390179,
    "lon": -68.925188,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58091040",
    "offices": [
      {
        "id": "rincon-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "",
        "street": "",
        "phone": "0299 4566891",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "note": "El directorio del servicio publica el teléfono. Llamá para confirmar el lugar de atención.",
        "tel": "+542994566891"
      },
      {
        "id": "rincon-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "Mendoza 273",
        "street": "Mendoza 273",
        "phone": "0299 4886822",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "tel": "+542994886822",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "0299 4886822"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "0299 4886822"
          }
        ]
      },
      {
        "id": "rincon-ninez",
        "name": "Defensoría de los Derechos del Niño, Niña y Adolescente",
        "topic": "ninez",
        "address": "Hipólito Yrigoyen 618",
        "street": "Hipólito Yrigoyen 618",
        "phone": "0299 4886157",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/ninez-y-adolescencia/33",
        "tel": "+542994886157"
      },
      {
        "id": "rincon-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "Hipólito Yrigoyen 618",
        "street": "Hipólito Yrigoyen 618",
        "phone": "0299 4886822",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "moreSource": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/682-nuevo-edificio-de-rdls",
        "tel": "+542994886822"
      }
    ]
  },
  {
    "id": "sanmartin",
    "name": "San Martín de los Andes",
    "circuit": "de los Lagos del Sur",
    "lat": -40.156938,
    "lon": -71.352714,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58056010",
    "offices": [
      {
        "id": "sanmartin-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Carlos Weber 531",
        "street": "Carlos Weber 531",
        "phone": "02972 530622",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "tel": "+542972530622"
      },
      {
        "id": "sanmartin-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "Carlos Weber 531",
        "street": "Carlos Weber 531",
        "phone": "02972 429858",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "tel": "+542972429858"
      },
      {
        "id": "sanmartin-ninez",
        "name": "Defensoría de los Derechos del Niño, Niña y Adolescente",
        "topic": "ninez",
        "address": "Carlos Weber 531",
        "street": "Carlos Weber 531",
        "phone": "02972 491915",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "tel": "+542972491915"
      },
      {
        "id": "sanmartin-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "Eduardo Elordi 485",
        "street": "Eduardo Elordi 485",
        "phone": "02972 410706",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "tel": "+542972410706"
      }
    ]
  },
  {
    "id": "villa",
    "name": "Villa La Angostura",
    "circuit": "de los Lagos del Sur",
    "lat": -40.762996,
    "lon": -71.641002,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58070010",
    "offices": [
      {
        "id": "villa-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Bulevar Pascotto y Saihueque",
        "street": "Bulevar Pascotto y Saihueque",
        "phone": "0294 4965143",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "lat": -40.759274,
        "lon": -71.641347,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Pascotto+y+Saihueque&provincia=58&localidad=Villa+La+Angostura&max=2",
        "tel": "+542944965143"
      },
      {
        "id": "villa-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "Bulevar Pascotto y Saihueque",
        "street": "Bulevar Pascotto y Saihueque",
        "phone": "0299 5691151",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "lat": -40.759274,
        "lon": -71.641347,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Pascotto+y+Saihueque&provincia=58&localidad=Villa+La+Angostura&max=2",
        "tel": "+542995691151",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "0299 5691151"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "0299 5691151"
          }
        ]
      },
      {
        "id": "villa-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "Bulevar Pascotto y Saihueque",
        "street": "Bulevar Pascotto y Saihueque",
        "phone": "0294 4488078",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "lat": -40.759274,
        "lon": -71.641347,
        "precision": "esquina",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Pascotto+y+Saihueque&provincia=58&localidad=Villa+La+Angostura&max=2",
        "tel": "+542944488078"
      }
    ]
  },
  {
    "id": "zapala",
    "name": "Zapala",
    "circuit": "Pehuén",
    "lat": -38.902934,
    "lon": -70.064211,
    "precision": "localidad",
    "geoSource": "https://apis.datos.gob.ar/georef/api/localidades?id=58112040",
    "offices": [
      {
        "id": "zapala-soj",
        "name": "Servicio de Orientación Jurídica",
        "topic": "soj",
        "address": "Chaneton 655, planta baja",
        "street": "Chaneton 655",
        "phone": "02942 556032",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/civil/soj",
        "floor": "planta baja",
        "lat": -38.902971,
        "lon": -70.062958,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Chaneton+655&provincia=58&localidad=Zapala&max=2",
        "tel": "+542942556032"
      },
      {
        "id": "zapala-civil",
        "name": "Defensoría Pública Civil",
        "topic": "civil",
        "address": "Chaneton 655",
        "street": "Chaneton 655",
        "phone": "02942 424154",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/1593-dpc-donde-estamos-como-nos-contactas-y-cual-es-nuestro-horario-de-atencion",
        "lat": -38.902971,
        "lon": -70.062958,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Chaneton+655&provincia=58&localidad=Zapala&max=2",
        "tel": "+542942424154",
        "units": [
          {
            "name": "Defensoría Pública Civil N.º 1",
            "phone": "02942 424154"
          },
          {
            "name": "Defensoría Pública Civil N.º 2",
            "phone": "02942 424154"
          }
        ]
      },
      {
        "id": "zapala-ninez",
        "name": "Defensoría de los Derechos del Niño, Niña y Adolescente",
        "topic": "ninez",
        "address": "Luis Monti 258",
        "street": "Luis Monti 258",
        "phone": "02942 423840",
        "hours": "Lunes a viernes de 8 a 14 h",
        "source": "https://www.mpdneuquen.gob.ar/index.php/ninez-y-adolescencia/33",
        "lat": -38.902836,
        "lon": -70.0638,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Luis+Monti+258&provincia=58&localidad=Zapala&max=2",
        "tel": "+542942423840"
      },
      {
        "id": "zapala-penal",
        "name": "Defensa Pública Penal",
        "topic": "penal",
        "address": "Zeballos 186",
        "street": "Zeballos 186",
        "phone": "02942 622940",
        "hours": "Consultá el horario antes de ir.",
        "source": "https://www.mpdneuquen.gob.ar/images/agenda_telefonica_230226.pdf",
        "lat": -38.903602,
        "lon": -70.067378,
        "precision": "dirección",
        "geoSource": "https://apis.datos.gob.ar/georef/api/direcciones?direccion=Zeballos+186&provincia=58&localidad=Zapala&max=2",
        "tel": "+542942622940"
      }
    ]
  }
];
  const rights = [
  {
    "id": "alimentos",
    "topic": "Familia",
    "scope": "Nacional",
    "question": "¿Qué gastos abarca la cuota alimentaria?",
    "keywords": [
      "alimentos",
      "cuota alimentaria",
      "alimentaria",
      "manutención",
      "659"
    ],
    "summary": "Incluye lo que necesitan hijas e hijos para vivir y crecer: comida, vivienda, ropa, educación, salud y recreación, entre otros gastos. Los aportes pueden hacerse en dinero o en especie, según sus necesidades y las posibilidades económicas de quienes deben contribuir.",
    "law": "Código Civil y Comercial de la Nación",
    "article": "art. 659",
    "url": "https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion#:~:text=ARTICULO%20659.-%20Contenido.",
    "action": "Si necesitás orientación sobre alimentos, el Servicio de Orientación Jurídica puede explicarte cómo pedir una entrevista.",
    "route": "civil",
    "actionLabel": "Consultar al Servicio de Orientación Jurídica",
    "actionUrl": "https://www.mpdneuquen.gob.ar/index.php/civil/soj"
  },
  {
    "id": "escucha",
    "topic": "Niñez y adolescencia",
    "scope": "Nacional",
    "question": "¿Tengo derecho a que escuchen mi opinión?",
    "keywords": [
      "ser oído",
      "me escuchen",
      "opinión",
      "26061",
      "26.061",
      "artículo 24"
    ],
    "summary": "Si sos niña, niño o adolescente, podés participar y expresar lo que pensás sobre los asuntos que te interesan o te afectan. En la familia, la escuela y otros espacios, tu opinión debe tenerse en cuenta según tu madurez y desarrollo.",
    "law": "Ley 26.061 de protección integral de niñas, niños y adolescentes",
    "article": "art. 24",
    "url": "https://www.argentina.gob.ar/normativa/nacional/ley-26061-110778/actualizacion#:~:text=DERECHO%20A%20OPINAR%20Y%20A%20SER%20OIDO.",
    "action": "Podés hablar con la Defensoría de los Derechos del Niño y Adolescente de tu zona.",
    "route": "ninez",
    "actionLabel": "Contactar con una defensoría de niñez",
    "actionUrl": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/33-como-contactarnos-ninez"
  },
  {
    "id": "defensa",
    "topic": "Defensa en juicio",
    "scope": "Nacional",
    "question": "¿Qué significa tener derecho a la defensa?",
    "keywords": [
      "defensa en juicio",
      "derecho a la defensa",
      "constitución",
      "artículo 18",
      "defenderme"
    ],
    "summary": "La Constitución protege el derecho de toda persona a ser escuchada y defender sus derechos en un juicio. En materia penal, también garantiza que nadie pueda ser obligado a declarar contra sí mismo.",
    "law": "Constitución Nacional",
    "article": "art. 18",
    "url": "https://www.argentina.gob.ar/normativa/nacional/804/texto#:~:text=Es%20inviolable%20la%20defensa%20en%20juicio%20de%20la%20persona%20y%20de%20los%20derechos.",
    "action": "Si ya tenés una defensa asignada, hablá con ese equipo. Si te citaron en una causa penal y necesitás orientación, podés consultar a la Defensa Penal.",
    "route": "penal"
  },
  {
    "id": "alquiler",
    "topic": "Vivienda",
    "scope": "Nacional",
    "question": "¿El contrato de alquiler de una vivienda debe hacerse por escrito?",
    "keywords": [
      "alquiler",
      "alquilo",
      "contrato de locación",
      "vivienda",
      "1188"
    ],
    "summary": "Sí. Si alquilás una vivienda, el contrato debe quedar por escrito. La misma regla se aplica cuando se extiende su duración o se cambian sus condiciones.",
    "law": "Código Civil y Comercial de la Nación",
    "article": "art. 1188",
    "url": "https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion#:~:text=ARTICULO%201188.-%20Forma.%20Oponibilidad.",
    "action": "Si tenés dudas sobre tu contrato o una comunicación de quien te alquila, podés consultar al Servicio de Orientación Jurídica. Guardá el documento para esa conversación.",
    "route": "civil",
    "actionLabel": "Buscar el Servicio de Orientación Jurídica",
    "actionUrl": "https://www.mpdneuquen.gob.ar/index.php/civil/soj"
  },
  {
    "id": "credito",
    "topic": "Deudas y consumo",
    "scope": "Nacional",
    "question": "¿Qué información tiene que figurar en un crédito para consumo?",
    "keywords": [
      "crédito",
      "cuotas de un préstamo",
      "compra en cuotas",
      "préstamo",
      "deuda",
      "24.240",
      "24240"
    ],
    "summary": "Si financiás una compra para uso personal o contratás un crédito para consumo, deben informarte el monto financiado, la tasa de interés efectiva anual y cuánto y con qué frecuencia vas a pagar. También deben indicar el total de intereses o el costo financiero total y los cargos adicionales que correspondan.",
    "law": "Ley 24.240 de Defensa del Consumidor",
    "article": "art. 36",
    "url": "https://www.argentina.gob.ar/normativa/nacional/ley-24240-638/actualizacion#:~:text=ARTICULO%2036.%20%E2%80%94%20Requisitos.",
    "action": "Si tenés una diferencia con el comercio o la entidad que otorgó el crédito, podés consultar a Protección al Consumidor de Neuquén. Si recibiste una notificación judicial, pedí orientación profesional cuanto antes.",
    "route": "civil",
    "actionLabel": "Consultar las delegaciones de Protección al Consumidor",
    "actionUrl": "https://proteccionalconsumidor.neuquen.gob.ar/delegaciones/"
  },
  {
    "id": "educacion",
    "topic": "Niñez y adolescencia",
    "scope": "Provincial · Neuquén",
    "question": "¿Qué derecho tengo a volver a la escuela?",
    "keywords": [
      "escuela",
      "volver a estudiar",
      "escolar",
      "educación",
      "2302",
      "2.302"
    ],
    "summary": "En Neuquén, si sos niña, niño o adolescente, tenés derecho a entrar a la escuela, seguir estudiando y retomar los estudios si los interrumpiste. La provincia debe garantizar que puedas hacerlo con igualdad de oportunidades y sin discriminación.",
    "law": "Ley provincial 2302 de protección integral del niño y del adolescente",
    "article": "art. 23",
    "url": "https://legislaturaneuquen.gob.ar/Archivos/Publicaciones/LEY-2302.pdf#page=8",
    "action": "Si encontrás dificultades para ingresar o volver a la escuela, podés hablar con la Defensoría de los Derechos del Niño y Adolescente.",
    "route": "ninez",
    "actionLabel": "Contactar con una defensoría de niñez",
    "actionUrl": "https://www.mpdneuquen.gob.ar/index.php/2-sin-clasificar/33-como-contactarnos-ninez"
  }
];
  const documents = {
  "intro": "Tené el papel a mano para mirarlo por tu cuenta. Guardá el original y las hojas que lo acompañan. Podés consultar esta guía sin copiar el texto ni compartir fotos.",
  "types": [
    {
      "id": "cedula",
      "label": "Cédula de notificación",
      "text": "Comunica formalmente una decisión o una actuación. Fijate qué organismo aparece y qué se te comunica. Una cédula también puede incluir una citación o una intimación."
    },
    {
      "id": "citacion",
      "label": "Citación a una audiencia",
      "text": "Es un pedido para que te presentes ante una autoridad. Buscá el día, la hora y el lugar, o las indicaciones para participar a distancia. Si no entendés para qué te convocan, consultá al organismo que te citó."
    },
    {
      "id": "intimacion",
      "label": "Intimación",
      "text": "Es un requerimiento formal para que hagas algo o dejes de hacerlo. Fijate quién lo envió, qué pide y si menciona un plazo. Si necesitás saber cómo responder, pedí que tu defensa revise el aviso con vos."
    }
  ],
  "checks": [
    {
      "label": "Quién lo envió",
      "text": "Buscá el nombre del juzgado, fiscalía, defensoría u otra entidad. Ese nombre te ayuda a encontrar el canal correcto."
    },
    {
      "label": "Qué te están comunicando",
      "text": "Fijate si el papel anuncia una decisión, pide una respuesta o te convoca a presentarte."
    },
    {
      "label": "Fechas y lugar",
      "text": "Anotá para vos cuándo lo recibiste y si figura una fecha de audiencia o un plazo. Si tenés dudas sobre un vencimiento, consultá cuanto antes con tu defensa o el organismo que lo emitió."
    }
  ],
  "routes": [
    {
      "label": "Ya tengo abogada, abogado o defensoría",
      "text": "Comunicate directamente con ese equipo para que revise el documento con vos."
    },
    {
      "label": "Es una consulta civil o familiar",
      "text": "El Servicio de Orientación Jurídica puede orientarte sobre la atención que corresponde."
    },
    {
      "label": "Me citaron en una causa penal",
      "text": "Usá los datos oficiales del organismo que figure en la citación. Si necesitás defensa penal, buscá la defensoría penal de tu zona."
    },
    {
      "label": "No reconozco el documento",
      "text": "Buscá el nombre de la entidad que lo envió y comprobá sus datos en el directorio oficial. Podés consultar allí sin enviar el documento por este chat."
    }
  ],
  "sources": [
    {
      "label": "Poder Judicial de Neuquén · Consultas frecuentes del fuero civil",
      "url": "https://www.jusneuquen.gov.ar/fuero-civil/"
    },
    {
      "label": "MPD · Servicio de Orientación Jurídica",
      "url": "https://www.mpdneuquen.gob.ar/index.php/civil/soj"
    },
    {
      "label": "MPD · Documentación para una consulta por cobro",
      "url": "https://www.mpdneuquen.gob.ar/images/civil/cobrossumult.pdf"
    }
  ]
};
  const labels = {soj:'Primera orientación', civil:'Defensa civil', ninez:'Niñez y adolescencia', penal:'Defensa penal',comunidad:'Orientación en la comunidad'};
  const subjects = {soj:'Primera consulta civil o de familia',civil:'Defensa civil y de familia',ninez:labels.ninez,penal:labels.penal,comunidad:labels.comunidad};
  const mapOfficial = base+'index.php/institucional/mapas-de-defensorias';
  function mapUrl(city,office) {
    if (!office.street) return '';
    const query = Number.isFinite(office.lat) && Number.isFinite(office.lon) ? office.lat+','+office.lon : office.street+', '+city.name+', Neuquén, Argentina';
    return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
  }
  window.JustinaMPD = Object.freeze({cities,rights,labels,mapUrl});
  const fold = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const mapLink = (city='',topic='') => ({url:mapOfficial,label:'Ver en el mapa de defensorías',place:{city,topic}});
  const topics = [choice('alimentos','Familia e hijos'),choice('ninez','Niñez y adolescencia'),choice('vivienda','Vivienda y alquiler'),choice('deudas','Deudas y consumo'),choice('penal','Defensa penal')];
  const papers = documents.types.map(doc=>choice('papel-'+doc.id,doc.label));
  const emitters = [choice('fiscal','Dice Fiscalía'),choice('defensa','Dice Defensoría'),choice('juzgado','Dice Juzgado'),choice('ilegible','No sé qué oficina es')];
  Object.assign(routes,{
    temas:{question:'Quiero orientarme por tema.',text:'Podés elegir un tema para ver qué servicio recibe estas consultas. Alcanza con tocar un botón. Si preferís hablar con alguien, podés pasar directamente al mapa.',choices:topics,links:[mapLink()]},
    primera:{question:'Es mi primera consulta.',text:'¿Por dónde querés empezar? Elegí un tema, revisá una palabra que aparezca en un papel o buscá una oficina de atención.',choices:[choice('temas','Elegir un tema'),choice('cedula','Me llegó un papel'),choice('mapa','Buscar una oficina')]},
    vivienda:{question:'Quisiera orientación sobre vivienda.',text:'Si tenés dudas sobre un alquiler o recibiste un aviso relacionado con tu vivienda, podés consultar al Servicio de Orientación Jurídica. Si te llegó un documento, guardalo para hablar con ese equipo.',choices:[choice('ley-alquiler','Leer sobre contratos de alquiler'),choice('cedula','Me llegó una notificación'),choice('mapa-soj','Encontrar primera orientación')]},
    deudas:{question:'Necesito orientación sobre deudas o consumo.',text:'Si tu consulta es sobre un préstamo o una compra en cuotas, podés empezar por la información de Protección al Consumidor. Si te llegó una comunicación judicial, guardala y consultá cuanto antes con el organismo que la envió o con tu defensa.',links:[source('https://proteccionalconsumidor.neuquen.gob.ar/delegaciones/','Delegaciones de Protección al Consumidor')],choices:[choice('ley-credito','Qué debe informar un crédito'),choice('cedula','Recibí un aviso'),choice('mapa-soj','Hablar con el Servicio de Orientación Jurídica')]},
    cedula:{question:'Me llegó un papel. ¿Cómo me oriento?',text:'Tené el aviso a mano. ¿Reconocés alguna de estas palabras? Podés elegirla sin copiar el documento ni enviar una foto.',choices:[...papers,choice('mirar','Qué partes conviene mirar'),choice('organismo','Cómo ubico a quien lo envió'),choice('mapa-comunidad','Buscar orientación en mi comunidad')]},
    mirar:{question:'¿Qué partes del aviso conviene mirar?',text:documents.checks.map(part=>part.label+'. '+part.text).join('\n\n'),choices:[choice('organismo','Identificar la oficina'),choice('mapa','Buscar atención personal')]},
    organismo:{question:'¿A quién puedo consultar por el aviso?',text:'Fijate qué organismo firma la comunicación. Elegí el tipo de oficina para ver cómo contactarla. Guardá nombres, fechas y números del expediente para la conversación con el equipo.',choices:emitters},
    mapa:{question:'¿Dónde hay una defensoría?',text:'Elegí el servicio que necesitás. Después podés elegir la localidad que te quede mejor. También podés abrir el mapa directamente.',choices:Object.entries(subjects).map(([id,label])=>choice('mapa-'+id,label)),links:[mapLink()]},
    prueba:{question:'¿Se puede consultar por un documento o por un tema?',text:'Podés reconocer palabras de un aviso o explorar un tema sin compartir información de tu situación. La interpretación de un documento y la valoración de un caso requieren atención profesional.',choices:[choice('cedula','Ver la guía de documentos'),choice('temas','Orientarme por tema'),choice('mapa','Hablar con una persona')]},
    normas:{question:'¿Qué dice la ley?',text:'Elegí una pregunta para consultar una explicación y el artículo que la respalda. Las fichas indican si la norma es nacional o de Neuquén. También podés buscar otra ley en las fuentes oficiales.',links:[source(infoleg,'InfoLEG · legislación nacional'),source(buscador,'Buscador de normativa')],choices:rights.map(r=>choice('ley-'+r.id,r.question))}
  });
  for (const doc of documents.types) {
    routes['papel-'+doc.id]={question:'¿Qué significa «'+doc.label+'»?',text:doc.text,choices:[choice('mirar','Qué mirar en el aviso'),choice('organismo','Ubicar a la oficina'),choice('asignada','Ya tengo defensa')]};
  }
  for (const r of rights) {
    const topic=r.route==='civil'?'soj':r.route;
    const links=[source(r.url,r.scope+' · '+r.law+', '+r.article)];
    if(r.actionUrl) links.push(source(r.actionUrl,r.actionLabel));
    routes['ley-'+r.id]={question:r.question,text:r.summary+'\n\n'+r.action,links,choices:[choice('mapa-'+topic,'Buscar una oficina del MPD'),choice('normas','Ver otras preguntas sobre derechos')]};
  }
  for (const [legacy,id] of Object.entries({leycuota:'alimentos',leyvoz:'escucha',leydefensa:'defensa',provincia:'educacion'})) routes[legacy]=routes['ley-'+id];
  for (const [topic,label] of Object.entries(subjects)) {
    const available=cities.filter(city=>city.offices.some(o=>o.topic===topic));
    routes['mapa-'+topic]={question:'Buscar una sede · '+label,text:'Elegí una localidad con atención publicada para este tema. Si no ves la tuya, podés consultar a la Defensoría General.',links:[mapLink('',topic)],choices:[...available.map(city=>choice('oficina-'+city.id+'-'+topic,city.name)),choice('otra','Mi localidad no figura')]};
  }
  routes.sedes=routes['mapa-soj'];
  for (const city of cities) {
    const topics=[...new Set(city.offices.map(o=>o.topic))];
    routes['lugar-'+city.id]={question:'Quiero consultar en '+city.name+'.', text:'Estas son las áreas con un contacto publicado en '+city.name+'. Elegí una para ver su dirección, horario y teléfono.',links:[mapLink(city.id)],choices:topics.map(id=>choice('oficina-'+city.id+'-'+id,subjects[id]))};
    for (const topic of Object.keys(subjects)) {
      const office=city.offices.find(o=>o.topic===topic);
      const id='oficina-'+city.id+'-'+topic;
      if(!office) {routes[id]={question:subjects[topic]+' en '+city.name,text:'El directorio no registra una sede para esa localidad y ese tema. Podés ver otras localidades que atienden el tema o preguntar a la Defensoría General.',links:[source('tel:+542995255042','Llamar a la Defensoría General')],choices:[choice('mapa-'+topic,'Ver otras localidades')]};continue}
      const text=[office.name+' · '+city.name,office.address,office.hours,office.phone?(office.phoneLabel?office.phoneLabel+' · ':'Teléfono: ')+office.phone+(office.extension?' (interno '+office.extension+')':''):'',office.note].filter(Boolean).join('\n');
      const links=[mapLink(city.id,topic)];
      if(office.tel) links.push(source('tel:'+office.tel,office.phoneLabel?'Llamar · '+office.phoneLabel:'Llamar a la oficina'));
      if(mapUrl(city,office)) links.push(source(mapUrl(city,office),'Cómo llegar'));
      links.push(source(office.source,'Consultar el directorio oficial'));
      const choices=[choice('mapa-'+topic,'Elegir otra localidad')];
      if (office.units?.length) {
        const unitOptions=[];
        for(const [index,unit] of office.units.entries()) {
          const unitId=id+'-equipo-'+index;
          const dial='+54'+unit.phone.replace(/\D/g,'').replace(/^0/,'');
          const phone=unit.phone+(unit.extension?' (interno '+unit.extension+')':'');
          routes[unitId]={question:unit.name+' · '+city.name,text:unit.name+' · '+city.name+'\nTeléfono: '+phone+'\n'+(office.street||office.address),links:[source('tel:'+dial,'Llamar al equipo'),mapLink(city.id,topic),source(office.source,'Consultar el directorio oficial')]};
          unitOptions.push(choice(unitId,unit.name));
        }
        routes[id+'-equipos']={question:'Ya sé qué equipo me atiende.',text:'Elegí el número o el nombre de tu equipo para ver el teléfono publicado en el directorio.',choices:unitOptions};
        choices.unshift(choice(id+'-equipos','Buscar mi equipo por número'));
      }
      routes[id]={question:subjects[topic]+' en '+city.name,text,links,choices};
    }
    routes[city.id]=routes['oficina-'+city.id+'-soj'];
  }
  routes.persona.choices=[choice('mapa','Encontrar una defensoría'),choice('temas','Orientarme por tema')];
  routes.asignada.choices=[choice('mapa-civil','Ubicar mi defensoría civil'),choice('mapa-ninez','Ubicar niñez'),choice('mapa-penal','Ubicar defensa penal')];
  for(const [id,topic] of Object.entries({civil:'soj',alimentos:'soj',ninez:'ninez',adolescente:'ninez',escuela:'ninez',penal:'penal'})) {
    const r=routes[id];
    r.choices=[choice('mapa-'+topic,'Encontrar una oficina'),...(r.choices||[]).filter(ch=>ch.id!=='sedes')];
  }
  routes.ilegible.choices=[choice('mapa','Buscar una oficina'),choice('asignada','Ya tengo defensa')];
  routes.otra.links.unshift(mapLink());
  routes.desconocido.choices=[choice('temas','Elegir un tema'),choice('normas','Leer una ley'),choice('cedula','Entender un aviso'),choice('mapa','Encontrar una oficina')];
  function directoryIntent(t) {
    const town=cities.find(city=>new RegExp('\\b'+fold(city.name)+'\\b').test(t));
    const onMap= /\b(?:mapa|sede|sedes|direccion|horarios?|ubicacion|telefono|oficinas?)\b|donde (?:queda|esta|atiend)|como (?:llegar|llego)/.test(t);
    const fromChoice=previousRoute.startsWith('mapa-') ? previousRoute.slice(5) : '';
    const category=/comunitari|comunidad/.test(t)?'comunidad':/penal/.test(t)?'penal':/ninez|adolescen|infancia/.test(t)?'ninez':/soj|primera (consulta|orientacion)|orientacion juridica/.test(t)?'soj':/civil|familia/.test(t)?'civil':'';
    if(town && (onMap || category || fromChoice || t.trim()===fold(town.name) || previousRoute==='mapa' || /\b(?:estoy en|vivo en|soy de|atencion en|quiero ir a)\s+/.test(t))) {
      return category || fromChoice ? 'oficina-'+town.id+'-'+(category||fromChoice) : 'lugar-'+town.id;
    }
    if(onMap) return category?'mapa-'+category:'mapa';
    return '';
  }
  const actionIcon = {
    chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/><path d="M7.5 11h.1m4.4 0h.1m4.4 0h.1" stroke-width="2.6"/>',
    minus:'<path d="M5 12h14"/>',send:'<path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>',shield:'<path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5Z"/><path d="m8.5 12 2.5 2.5 5-5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',user:'<circle cx="12" cy="8" r="3.3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>'
  };
  const icon = key => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+actionIcon[key]+'</svg>';
  const host = document.createElement('mpd-justina');
  document.body.append(host);
  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = `<style>
    :host{--jw:#174e63;--paper:white;--ink:#1c3643;--muted:#465e6a;--edge:#c8d7de;color:var(--ink);font:1rem/1.5 "Open Sans",Arial,sans-serif}*{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer;color:inherit}button,a,input{outline-offset:3px}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #bd7117}svg{width:1.3em;height:1.3em;flex-shrink:0}button{border:0}a{color:#0e5470;text-underline-offset:3px}button:hover{filter:brightness(.95)}[hidden]{display:none!important}
    .launch{position:fixed;z-index:105;bottom:calc(20px + var(--mpd-lift,0px));right:23px;display:flex;align-items:center;gap:10px;border-radius:30px;padding:12px 20px;background:var(--jw);color:white;border:1px solid #ffffff75;box-shadow:0 4px 16px #173d342d;font-weight:700;min-height:49px;font-size:.96rem}.launch svg{width:22px;height:22px}
    .panel{position:fixed;right:23px;bottom:calc(83px + var(--mpd-lift,0px));width:min(399px,calc(100vw - 28px));height:min(595px,calc(100dvh - 110px - var(--mpd-lift,0px)));max-height:100dvh;border:1px solid var(--edge);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;z-index:106;background:var(--paper);box-shadow:0 10px 45px #133b3038;font-size:.925rem;line-height:1.5;overflow-wrap:anywhere}
    header{display:flex;gap:11px;align-items:center;padding:15px 16px;color:white;background:var(--jw)}.mark{width:39px;height:39px;display:grid;place-items:center;border:1px solid #80a8bb;border-radius:12px;background:#245d74}.mark svg{width:24px;height:24px}header strong{font:700 1.25rem/1.2 Roboto,Arial,sans-serif;display:block}header small{font-size:.76rem;display:block;color:#f3f7f3;margin-top:3px}.row-icons{display:flex;gap:2px;margin-left:auto}.ib{width:33px;height:34px;display:grid;place-items:center;background:transparent;color:white;border-radius:6px}.ib:hover{background:#276880}
    .tools{display:flex;align-items:center;justify-content:space-between;gap:4px;padding:7px 14px;border-bottom:1px solid var(--edge);background:#f3f7f9}.tools button,.end button{background:none;border:0;padding:5px 3px;color:var(--jw);font-weight:600;font-size:.8rem}.tools button{display:flex;align-items:center;gap:5px}.tools svg{width:16px}.history{overflow-y:auto;flex:1;min-height:40px;padding:17px 14px;overscroll-behavior:contain}.msg{max-width:96%;margin-bottom:14px}.speaker{display:block;font-size:.71rem;font-weight:700;letter-spacing:.035em;color:var(--muted);margin:0 4px 4px}.bubble{padding:12px 14px;border:1px solid #dfe9e3;border-radius:0 12px 12px;background:#eff5f7}.msg.mine{margin-left:auto;width:fit-content}.mine .speaker{text-align:right}.mine .bubble{background:var(--jw);color:white;border:0;border-radius:12px 0 12px 12px}.bubble{white-space:pre-line}.map-action{justify-self:start;text-align:left;padding:0;color:#0e5470;background:none;text-decoration:underline;font-size:.88rem;font-weight:600}.refs{display:grid;gap:8px;margin-top:10px}.refs a{font-size:.88rem;font-weight:600}.picks{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.picks button{min-height:35px;text-align:left;background:#fff;border:1px solid #9bb6c3;color:#124e67;border-radius:13px;padding:5px 11px;font-weight:600;font-size:.84rem}.picks button:hover{background:#e1edf3}
    .entry{padding:10px 14px 11px;border-top:1px solid var(--edge)}.compose{display:flex;gap:7px}input{width:100%;min-width:0;flex:1;height:42px;border:1px solid #a1b6c0;border-radius:8px;background:#fff;color:#1c3947;padding:7px 11px;font-size:1rem}input::placeholder{color:#4f6370}.send{width:42px;display:grid;place-items:center;border-radius:8px;color:#fff;background:var(--jw)}.send:disabled{background:#596f79}.privacy{display:flex;gap:6px;align-items:center;margin-top:6px;font-size:.74rem;color:var(--muted)}.privacy svg{width:14px;height:14px;flex:none}.privacy-info{background:transparent;color:var(--jw);text-decoration:underline;text-underline-offset:2px;font:inherit;font-weight:600;padding:4px}.privacy-info:hover{text-decoration-thickness:2px}.sr{position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden}.end{background:#fff7e6;color:#382e15;border-bottom:1px solid #d4bf90;padding:10px 15px}.end p{margin:0}.end button{text-decoration:underline;margin-right:12px}.end button:first-of-type{color:#71420e}
    :host-context(.high-contrast) .bubble,:host-context(.high-contrast) .tools{background:white;color:black;border-color:#26372b}:host-context(.high-contrast) .mine .bubble{background:#002e25;color:white}:host-context(.high-contrast){--jw:#002e25;--muted:#111;--edge:#435a4d}:host-context(.more-space){letter-spacing:.05em;word-spacing:.1em}
    @media(max-width:600px){.launch{right:12px;bottom:calc(15px + var(--mpd-lift,0px));padding:10px 16px;min-height:45px}.panel{right:8px;bottom:9px;width:calc(100vw - 16px);height:min(585px,calc(100dvh - 18px));z-index:110}.panel:not([hidden])~.launch{visibility:hidden}.entry{padding-bottom:max(11px,env(safe-area-inset-bottom))}}
    @media(max-height:450px){.panel{bottom:4px;right:4px;height:calc(100dvh - 8px);max-width:calc(100vw - 8px)}header{padding:7px 12px}.tools{padding:3px 10px}.entry{padding:5px 10px}.privacy{margin-top:3px}}
    </style><section hidden class="panel" role="dialog" aria-label="Conversación con Justina MPD"><header><span class="mark">${icon('chat')}</span><div><strong>Justina MPD</strong><small>Orientación de la Defensa Pública</small></div><div class="row-icons"><button type="button" class="ib minimize" title="Minimizar conversación" aria-label="Minimizar conversación">${icon('minus')}</button></div></header><div class="tools"><button type="button" class="human">${icon('user')} Atención personal</button><button type="button" class="finish">Finalizar y borrar</button></div><div hidden class="end" role="group" aria-label="Confirmar fin de conversación"><p>¿Querés borrar esta conversación?</p><button class="confirm" type="button">Finalizar y borrar</button><button type="button" class="cancel">Continuar</button></div><div class="history" role="log" aria-label="Conversación" aria-live="polite" aria-relevant="additions" tabindex="0"></div><form class="entry" autocomplete="off"><div class="compose"><label class="sr" for="mpd-input">Escribí tu pregunta</label><input id="mpd-input" aria-describedby="privacy-hint" maxlength="400" placeholder="Escribí tu pregunta…" autocomplete="off" spellcheck="false"><button class="send" type="submit" aria-label="Enviar consulta" disabled>${icon('send')}</button></div><div class="privacy">${icon('shield')}<span id="privacy-hint">Evitá incluir datos personales.</span> <button class="privacy-info" type="button">Privacidad</button></div></form></section><button class="launch" type="button" aria-expanded="false" aria-label="Abrir conversación con Justina MPD">${icon('chat')}<span>Justina MPD</span></button>`;
  const get = cls => shadow.querySelector(cls);
  const panel = get('.panel'), history = get('.history'), input = get('input'), launcher = get('.launch');
  let opener = launcher;
  let previousRoute = '';
  function message(label, content, mine=false) {
    const msg = document.createElement('div');
    msg.className = 'msg' + (mine ? ' mine' : '');
    const speaker = document.createElement('span');
    speaker.className = 'speaker';
    speaker.textContent = label;
    const box = document.createElement('div');
    box.className = 'bubble';
    box.textContent = content;
    msg.append(speaker, box);
    history.append(msg);
    return {msg,box};
  }
  function answer(route) {
    const {msg,box} = message('Justina MPD',route.text);
    if (route.links) {
      const refs = document.createElement('div');
      refs.className = 'refs';
      for (const {url,label,place} of route.links) {
        if (place && document.getElementById('places-title')) {
          const visit=document.createElement('button');
          visit.className='map-action';
          visit.textContent=label;
          visit.addEventListener('click',()=>{
            minimize();
            window.dispatchEvent(new CustomEvent('justina-mpd:mapa',{detail:place}));
          });
          refs.append(visit);
          continue;
        }
        const link = document.createElement('a');
        link.href = url;
        link.textContent = label;
        if (url.startsWith('https:')) { link.target='_blank'; link.rel='noopener noreferrer'; }
        refs.append(link);
      }
      box.append(refs);
    }
    if (route.choices) {
      const picks = document.createElement('div');
      picks.className = 'picks';
      for (const {id,label} of route.choices) {
        const pick = document.createElement('button');
        pick.type = 'button';
        pick.textContent = label;
        pick.addEventListener('click', () => selectRoute(id, label, true));
        picks.append(pick);
      }
      msg.append(picks);
    }
    history.scrollTop = msg.offsetTop - history.offsetTop;
  }
  function selectRoute(id, display, focusReply=false) {
    if (!Object.hasOwn(routes,id)) id='desconocido';
    get('.end').hidden=true;
    const route=routes[id];
    message('Vos',display || route.question || 'Consulta general',true);
    answer(route);
    previousRoute = id;
    if (focusReply) history.focus({preventScroll:true});
  }
  function openChat(id='', trigger=launcher) {
    if (panel.hidden) opener=trigger;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded','true');
    launcher.setAttribute('aria-label','Minimizar conversación con Justina MPD');
    if (!history.children.length) answer({text:'Hola, soy Justina MPD. ¿Qué necesitás saber? Podés elegir un tema o escribir una pregunta.',choices:hello});
    if (id && Object.hasOwn(routes,id)) selectRoute(id);
    get('.minimize').focus({preventScroll:true});
  }
  function minimize() {
    panel.hidden = true;
    get('.end').hidden = true;
    launcher.setAttribute('aria-expanded','false');
    launcher.setAttribute('aria-label','Abrir conversación con Justina MPD');
    if (!opener.isConnected || !opener.getClientRects().length) opener=launcher;
    opener.focus({preventScroll:true});
  }
  function containsPrivateData(text) {
    const withoutLaws = text.replace(/\b(?:ley(?: nacional| provincial)?|c[oó]digo)\s*(?:n[.°ºo]*\s*)?\d{1,3}(?:\.\d{3})?\b|\b(?:ley(?: nacional| provincial)?)\s*(?:n[.°ºo]*\s*)?\d{4,5}\b/gi, '');
    return /\S+@\S+|\d{5,}|\b\d{1,2}\.\d{3}\.\d{3}\b|\b(?:dni|expediente|legajo)\s*[:#°\d]/i.test(withoutLaws);
  }
  function classify(messageText) {
    const t=messageText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if (/peligro|emergencia|me esta(n)? (pegando|atacando)|me amenaza|urgencia medica/.test(t)) return 'urgente';
    if (containsPrivateData(t)) return 'datos';
    if (/privacidad|confidencial|datos personales|mis datos|guardan.*(datos|mensajes)|borrar (?:el |la |mi )?(?:chat|historial|conversacion)|proteccion de datos|\b(?:25\.?326|2\.?399)\b/.test(t)) return 'privacidad';
    if (/adjuntar|subir (?:un|mi|el)|foto de|\bpdf\b|\bjpg\b/.test(t)) return 'cedula';
    if (/semaforo|riesgo|orientarme por tema|elegir un tema/.test(t)) return 'temas';
    const directory=directoryIntent(t);
    if(directory) return directory;
    if (/intimacion/.test(t)) return 'papel-intimacion';
    if (/citacion/.test(t)) return 'papel-citacion';
    if (/cedula|notificacion|papel del juzgado/.test(t)) return 'cedula';
    if (/contrato de (?:alquiler|locacion)|1188|\balquiler.*(?:escrit|ley)/.test(t)) return 'ley-alquiler';
    if (/24\.?240|art(?:iculo|\.)?\s*36\b|credito.*(?:informacion|ley|consumo)|prestamo.*cuotas/.test(t)) return 'ley-credito';
    if (/2302|2\.302|volver a (?:la escuela|estudiar)|derecho.*educacion/.test(t)) return 'ley-educacion';
    if (/26\.?061|art(?:iculo|\.)?\s*24\b|ser (?:escuchad|oid)|(?:escuchen|tener en cuenta).*opinion/.test(t)) return 'ley-escucha';
    if (/art(?:iculo|\.)?\s*659\b|(?:gastos|incluye|abarca|comprende|ley).*(?:cuota|alimento)|(?:cuota|alimento).*(?:incluye|ley|cubre|gastos)/.test(t)) return 'ley-alimentos';
    if (/art(?:iculo|\.)?\s*18\b|derecho a (?:la )?defensa|constitucion nacional/.test(t)) return 'ley-defensa';
    if (/infoleg|legislacion|normativa|\bley(?:es)?\b|leer (?:una |la )?norma/.test(t)) return 'normas';
    if (/vivienda|alquil|locacion/.test(t)) return 'vivienda';
    if (/deuda|consumo|credito|prestamo/.test(t)) return 'deudas';
    if (/salud mental|internacion/.test(t)) return 'salud';
    if (/cedula|notificacion|notifica|intimacion|(?:recibi|llego|llegado) (?:una? )?papel/.test(t)) return 'cedula';
    if (/fiscali/.test(t)) return 'fiscal';
    if (/juzgado/.test(t) && ['cedula','organismo','mirar'].includes(previousRoute)) return 'juzgado';
    if (/expediente|ya tengo|mi (defensor|abogad)|mi causa|ya me atiende|asignad/.test(t)) return 'asignada';
    if (/alimento|alimentaria|manutencion/.test(t)) return 'alimentos';
    if (/escuela|docente/.test(t)) return 'escuela';
    if (/soy adolescente|tengo 1[3-7] a/.test(t)) return 'adolescente';
    if (/ninez|nina|nino|adolescen|derechos de mi hij/.test(t)) return 'ninez';
    if (/audiencia/.test(t)) return 'audiencia';
    if (/penal|detencion|imputad/.test(t)) return 'penal';
    if (/document|requisito|pauta economica/.test(t)) return 'requisitos';
    if (/sede|localidad|ubicacion|direccion|oficina cerca/.test(t)) return 'sedes';
    if (/familia|civil|soj|divorcio|vivienda|alquiler|deuda/.test(t)) return 'civil';
    if (/persona|turno|telefono|contact|presencial|horario|videollamada|whatsapp|lejos/.test(t)) return 'persona';
    if (/funcion|que hace|que es la defensa|rol de/.test(t)) return 'funciones';
    if (/hola|primera|empezar|buen dia|buenas/.test(t)) return 'primera';
    if (/limite|que puede|alcance|asesoramiento/.test(t)) return 'limite';
    return 'desconocido';
  }
  get('form').addEventListener('submit',e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const id = classify(text);
    selectRoute(id, id==='datos' ? 'Consulta con datos omitidos' : routes[id]?.question || 'Consulta general',true);
    input.value='';
    get('.send').disabled=true;
    input.focus({preventScroll:true});
  });
  input.addEventListener('input',()=>get('.send').disabled=!input.value.trim());
  get('.privacy-info').addEventListener('click', () => selectRoute('privacidad', undefined, true));
  get('.human').addEventListener('click',()=>selectRoute('persona',undefined,true));
  get('.minimize').addEventListener('click',minimize);
  launcher.addEventListener('click',()=>panel.hidden?openChat():minimize());
  get('.finish').addEventListener('click',()=>{get('.end').hidden=false;get('.cancel').focus();});
  get('.cancel').addEventListener('click',()=>{get('.end').hidden=true;get('.finish').focus();});
  get('.confirm').addEventListener('click',()=>{
    history.replaceChildren();
    previousRoute='';
    input.value='';
    get('.send').disabled=true;
    minimize();
  });
  shadow.addEventListener('keydown',e=>{if(e.key==='Escape' && !panel.hidden){e.preventDefault();minimize();}});
  document.addEventListener('click',e=>{
    const trigger=e.target.closest?.('[data-chat]');
    if(trigger) openChat(trigger.dataset.chat,trigger);
  });
})();
