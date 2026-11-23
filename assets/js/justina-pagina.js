/* Comportamiento de la página de Justina MPD: menú, accesibilidad, leyes, mapa y fotos. */
(() => {
  const byId = id => document.getElementById(id);
  const menu = byId('menu');
  function closeMenu() {
    byId('nav').classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = byId('nav').classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  byId('nav').addEventListener('click', closeMenu);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && byId('nav').classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  // En modo revisión los diálogos se abren sin bloquear la página, para poder comentarlos.
  const openDialog = dialog => {
    if (dialog.open) return;
    if (document.body.classList.contains('rv-active')) dialog.show(); else dialog.showModal();
  };
  byId('acc-open').addEventListener('click', () => openDialog(byId('acc-dialog')));
  for (const trigger of document.querySelectorAll('[data-privacy-open]')) {
    trigger.addEventListener('click', () => openDialog(byId('privacy-dialog')));
  }
  for (const dialog of document.querySelectorAll('.panel-modal')) {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      const bounds = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom)) dialog.close();
    });
  }
  const settings = {large:'text-large', contrast:'high-contrast', space:'more-space', motion:'less-motion'};
  for (const [id, className] of Object.entries(settings)) {
    byId(id).addEventListener('change', e => document.documentElement.classList.toggle(className,e.target.checked));
  }
  byId('reset-settings').addEventListener('click', () => {
    for (const [id, className] of Object.entries(settings)) {
      byId(id).checked = false;
      document.documentElement.classList.remove(className);
    }
  });
})();

(() => {
  const {cities, rights, labels, mapUrl} = window.JustinaMPD;
  const byId = id => document.getElementById(id);
  const normalize = value => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const make = (tag, content, className) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };
  const link = (url, title) => {
    const node = make('a', title);
    node.href = url;
    if (url.startsWith('https://')) {
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
    return node;
  };

  const query = byId('law-query');
  const lawCards = [...document.querySelectorAll('[data-law-item]')];
  query.addEventListener('input', () => {
    const terms = normalize(query.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of lawCards) {
      const record = rights.find(law => law.id === card.dataset.lawItem);
      const index = normalize([record.question,record.topic,record.law,record.article,record.scope,...record.keywords].join(' '));
      card.hidden = !terms.every(term => index.includes(term));
      if (!card.hidden) count++;
    }
    byId('law-status').textContent = count === 1 ? '1 explicación' : count + ' explicaciones';
    byId('law-none').hidden = count > 0;
  });

  const citySelect = byId('place-city');
  const topicSelect = byId('place-topic');
  const list = byId('place-list');
  const points = [...document.querySelectorAll('[data-city-point]')];
  const heading = byId('places-title');
  function officeCard(office, city) {
    const article = make('article', null, 'office-card');
    article.append(make('span', labels[office.topic],'office-tag'), make('h3',office.name));
    const details = make('dl');
    for (const [name, value] of [['Dirección',office.address || 'Consultá por teléfono antes de acercarte.'],['Horario',office.hours || 'Consultá el horario antes de ir.'],['Teléfono',(office.phone && (office.phoneLabel?office.phoneLabel+' · ':'')+office.phone+(office.extension?' (interno '+office.extension+')':'')) || 'Consultá el directorio oficial.']]) {
      const line = make('div');
      line.append(make('dt',name),make('dd',value));
      details.append(line);
    }
    article.append(details);
    if (office.note) article.append(make('p',office.note,'office-note'));
    const links = make('div',null,'office-links');
    if (office.tel) links.append(link('tel:'+office.tel,office.phoneLabel?'Llamar · '+office.phoneLabel:'Llamar a la oficina'));
    const target = mapUrl(city,office);
    if (target) {
      const showMap=make('button','Ver ubicación','inline');
      showMap.type='button';
      showMap.addEventListener('click',()=>showStreet(city,office,target,showMap));
      links.append(showMap,link(target,'Cómo llegar'));
    }
    links.append(link(office.source,'Directorio oficial'));
    article.append(links);
    if(office.units?.length) {
      const detail=make('details');
      detail.append(make('summary','Ver teléfonos por número de defensoría o equipo'));
      const numbers=make('ul');
      for(const unit of office.units) {
        const li=make('li',unit.name+' · ');
        const dial='+54'+unit.phone.replace(/\D/g,'').replace(/^0/,'');
        li.append(link('tel:'+dial,unit.phone+(unit.extension?' (interno '+unit.extension+')':'')));
        numbers.append(li);
      }
      detail.append(numbers);article.append(detail);
    }
    return article;
  }
  const mapPanel=document.querySelector('.map-panel');
  const canvas=document.querySelector('.map-canvas');
  const graphic=canvas.querySelector('svg');
  const zooms=[1,1.45,2.1];
  let zoomIndex=0;
  function setZoom(i) {
    zoomIndex=i;
    graphic.style.width=(zooms[i]*100)+'%';
    byId('map-in').disabled=i===zooms.length-1;
    byId('map-out').disabled=i===0;
    if(i>0) {canvas.scrollLeft=(canvas.scrollWidth-canvas.clientWidth)/2;canvas.scrollTop=(canvas.scrollHeight-canvas.clientHeight)/2;}
  }
  byId('map-in').addEventListener('click',()=>setZoom(Math.min(zoomIndex+1,zooms.length-1)));
  byId('map-out').addEventListener('click',()=>setZoom(Math.max(zoomIndex-1,0)));
  setZoom(0);
  function showStreet(city,office,target,trigger) {
    if (mapa) { enfocarOficina(city, office); return; }
    mapPanel.querySelector('.street-view')?.remove();
    const viewer=make('div',null,'street-view');
    const bar=make('div',null,'street-head');
    const close=make('button','Volver a la provincia','inline');
    close.type='button';
    close.addEventListener('click',()=>{viewer.remove();trigger.focus()});
    bar.append(make('strong',city.name+' · '+office.street),close);
    const frame=make('iframe');
    frame.title='Mapa de la dirección publicada de '+office.name+' en '+city.name;
    frame.referrerPolicy='no-referrer';
    const address=new URL(target).searchParams.get('query');
    frame.src='https://maps.google.com/maps?output=embed&hl=es&z=16&q='+encodeURIComponent(address);
    const note=make('div',null,'street-foot');
    note.append(make('span',office.precision?'Referencia de calle o esquina. ':'Búsqueda por domicilio publicado. '),link(target,'Abrir dirección en Google Maps'));
    viewer.append(bar,frame,note);
    mapPanel.append(viewer);
    close.focus();
  }
  function showResults() {
    mapPanel.querySelector('.street-view')?.remove();
    const town = citySelect.value, topic = topicSelect.value;
    const displayed = cities.filter(city => (!town || city.id === town) && city.offices.some(o => !topic || o.topic === topic));
    list.replaceChildren();
    for (const point of points) {
      const city = cities.find(town => town.id === point.dataset.cityPoint);
      const active = city.id === town;
      const available = city.offices.some(o => !topic || o.topic === topic);
      point.classList.toggle('selected', active);
      point.classList.toggle('unavailable', !available);
      point.setAttribute('aria-pressed',String(active));
    }
    byId('place-clear').disabled = !town && !topic;
    if (!displayed.length) {
      byId('place-status').textContent = 'Sin sede publicada para esta selección';
      const message=make('p', 'Podés elegir otra localidad o llamar a la Defensoría General para consultar dónde recibir atención.');
      list.append(message,link('tel:+542995255042','Defensoría General · (0299) 525 5042'));
    } else if (town) {
      const city = displayed[0];
      const offices = city.offices.filter(o => !topic || o.topic === topic);
      byId('place-status').textContent = city.name+' · '+offices.length+(offices.length === 1 ? ' ficha de atención' : ' fichas de atención');
      offices.forEach(office => list.append(officeCard(office,city)));
    } else {
      byId('place-status').textContent = displayed.length+' localidades con atención';
      const grid=make('div',null,'city-list');
      for (const city of displayed) {
        const button=make('button',city.name);
        button.type='button';
        button.append(make('small',Array.from(new Set(city.offices.filter(o=>!topic || o.topic===topic).map(o=>labels[o.topic]))).join(' · ')));
        button.addEventListener('click',()=>{citySelect.value=city.id;showResults();byId('place-status').focus({preventScroll:true})});
        grid.append(button);
      }
      list.append(grid);
    }
    list.parentElement.scrollTop = 0;
    pintarMapa();
  }
  byId('place-status').tabIndex=-1;
  citySelect.addEventListener('change',showResults);
  topicSelect.addEventListener('change',showResults);
  byId('place-clear').addEventListener('click',()=>{citySelect.value='';topicSelect.value='';showResults();citySelect.focus({preventScroll:true})});
  for (const point of points) {
    function selectPoint(){citySelect.value=point.dataset.cityPoint;showResults();}
    point.addEventListener('click',selectPoint);
    point.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPoint()}});
  }
  /* Mapa con cartografía (Leaflet). La librería y las imágenes del mapa se piden recién cuando la sección
     está por verse. Si no se pueden cargar, queda el esquema de la provincia y todo sigue funcionando. */
  const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/';
  let mapa = null, capaCiudades = null, capaOficinas = null, pedido = null;
  const marcas = new Map();
  function cargarLeaflet() {
    if (pedido) return pedido;
    pedido = new Promise((ok, no) => {
      if (window.L) return ok();
      const css = make('link'); css.rel = 'stylesheet'; css.href = LEAFLET + 'leaflet.css';
      css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='; css.crossOrigin = '';
      const js = make('script'); js.src = LEAFLET + 'leaflet.js';
      js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; js.crossOrigin = '';
      js.onload = () => ok(); js.onerror = no; css.onerror = no;
      document.head.append(css, js);
    }).then(iniciarMapa);
    pedido.catch(() => { /* sin mapa: queda el esquema */ });
    return pedido;
  }
  function iniciarMapa() {
    const L = window.L, caja = byId('mapa-real');
    caja.hidden = false;
    mapPanel.classList.add('con-mapa');
    mapa = L.map(caja, {scrollWheelZoom:false, minZoom:6, maxZoom:17, zoomSnap:.5, dragging:!L.Browser.mobile, tap:false});
    mapa.attributionControl.setPrefix(false);
    // Cartografía oficial del Instituto Geográfico Nacional; si no responde, OpenStreetMap.
    const ign = L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png', {maxZoom:17, attribution:'Cartografía: Instituto Geográfico Nacional · OpenStreetMap'});
    let reemplazada = false;
    ign.on('tileerror', () => {
      if (reemplazada) return;
      reemplazada = true;
      mapa.removeLayer(ign);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:17, attribution:'© Colaboradores de OpenStreetMap'}).addTo(mapa);
    });
    ign.addTo(mapa);
    capaCiudades = L.layerGroup().addTo(mapa);
    capaOficinas = L.layerGroup().addTo(mapa);
    for (const city of cities) {
      const punto = L.circleMarker([city.lat, city.lon], {radius:8, color:'#fff', weight:2.5, fillColor:'#22667c', fillOpacity:1, bubblingMouseEvents:false});
      // Las etiquetas se reparten alrededor de cada punto para que no se pisen en la vista de toda la provincia.
      const lado = {andacollo:'left', chos:'bottom', zapala:'left', cutral:'top', junin:'top', sanmartin:'left', villa:'left'}[city.id] || 'right';
      punto.bindTooltip(city.name, {permanent:true, direction:lado, offset:{left:[-10,0], right:[10,0], top:[0,-9], bottom:[0,9]}[lado], className:'mpd-tip'});
      punto.on('click', () => { citySelect.value = city.id; showResults(); });
      punto.cityId = city.id;
      capaCiudades.addLayer(punto);
    }
    byId('map-reset').addEventListener('click', () => { citySelect.value = ''; showResults(); });
    const nota = document.querySelector('[data-map-note]');
    if (nota) nota.textContent = 'Tocá un punto para ver las oficinas de esa localidad. Podés acercar el mapa con los botones + y −.';
    pintarMapa();
  }
  function pintarMapa() {
    if (!mapa) return;
    const L = window.L, town = citySelect.value, topic = topicSelect.value;
    capaOficinas.clearLayers();
    marcas.clear();
    capaCiudades.eachLayer(punto => {
      const city = cities.find(c => c.id === punto.cityId);
      const disponible = city.offices.some(o => !topic || o.topic === topic);
      punto.setStyle({fillColor: city.id === town ? '#b34b21' : '#22667c', fillOpacity: disponible ? 1 : .35, opacity: disponible ? 1 : .45});
      const etiqueta = punto.getTooltip() && punto.getTooltip().getElement();
      if (etiqueta) { etiqueta.classList.toggle('sel', city.id === town); etiqueta.style.opacity = disponible ? '' : '.55'; }
    });
    byId('map-reset').hidden = !town;
    if (!town) { mapa.fitBounds(L.latLngBounds(cities.map(c => [c.lat, c.lon])).pad(.14)); return; }
    const city = cities.find(c => c.id === town), puntos = [];
    for (const office of city.offices.filter(o => !topic || o.topic === topic)) {
      if (!Number.isFinite(office.lat) || !Number.isFinite(office.lon)) continue;
      const globo = make('div');
      globo.append(make('strong', office.name), make('span', office.address || city.name));
      const marca = L.circleMarker([office.lat, office.lon], {radius:7, color:'#fff', weight:2, fillColor:'#b34b21', fillOpacity:1}).bindPopup(globo);
      capaOficinas.addLayer(marca);
      marcas.set(office.id, marca);
      puntos.push([office.lat, office.lon]);
    }
    if (puntos.length) mapa.fitBounds(L.latLngBounds(puntos).pad(.8), {maxZoom:15});
    else mapa.setView([city.lat, city.lon], 12);
  }
  function enfocarOficina(city, office) {
    const marca = marcas.get(office.id);
    if (marca) { mapa.setView(marca.getLatLng(), 16); marca.openPopup(); }
    else mapa.setView([city.lat, city.lon], 13);
    mapPanel.scrollIntoView({block:'nearest'});
  }
  if ('IntersectionObserver' in window) {
    const vigia = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) { vigia.disconnect(); cargarLeaflet(); }
    }, {rootMargin:'500px'});
    vigia.observe(byId('sedes'));
  } else cargarLeaflet();

  function focusMap(city='',topic='') {
    citySelect.value=city;
    topicSelect.value=topic;
    showResults();
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
  }
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-map-topic]');
    if(trigger) focusMap('',trigger.dataset.mapTopic);
  });
  window.addEventListener('justina-mpd:mapa',e=>focusMap(e.detail.city,e.detail.topic));
  showResults();

  const gallery=document.querySelector('.carousel');
  const slides=[...gallery.querySelectorAll('.photo-slide')];
  const pause=byId('photo-pause');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let current=0, playing=!motion.matches, timer=null, resumedHere=false;
  const pauseIcon=pause.innerHTML;
  const playIcon='<svg aria-hidden="true" class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>';
  function show(index) {
    slides[current].hidden=true;
    current=(index+slides.length)%slides.length;
    slides[current].hidden=false;
    byId('photo-count').textContent=(current+1)+' / '+slides.length;
  }
  function schedule() {
    clearInterval(timer);
    if (playing && !motion.matches && !document.documentElement.classList.contains('less-motion') && !document.hidden && (resumedHere || !gallery.matches(':hover,:focus-within'))) timer=setInterval(()=>show(current+1),8000);
    pause.setAttribute('aria-label',playing ? 'Pausar las fotos' : 'Reproducir las fotos');
    pause.title=pause.getAttribute('aria-label');
    pause.innerHTML=playing ? pauseIcon : playIcon;
    pause.hidden=motion.matches || document.documentElement.classList.contains('less-motion');
  }
  function navigate(delta){playing=false;show(current+delta);schedule()}
  byId('photo-back').addEventListener('click',()=>navigate(-1));
  byId('photo-next').addEventListener('click',()=>navigate(1));
  pause.addEventListener('click',()=>{playing=!playing;resumedHere=playing;schedule()});
  for(const event of ['mouseenter','mouseleave','focusin','focusout']) gallery.addEventListener(event,()=>{resumedHere=false;setTimeout(schedule,0)});
  motion.addEventListener('change',()=>{playing=!motion.matches;schedule()});
  document.addEventListener('visibilitychange',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{attributeFilter:['class']});
  schedule();
})();
