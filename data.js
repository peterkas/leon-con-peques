// Datos de León con Peques. Es el único fichero que hay que tocar en la actualización semanal
// (además del texto de novedades del pie, en index.html).
//
// Campos de cada evento:
//   id        identificador corto y único: minúsculas, números y guiones (enlaces e ics/<id>.ics)
//   title, cat ('fiesta' | 'teatro' | 'taller'), start, end (AAAA-MM-DD)
//   place     lugar tal como se muestra
//   mapQuery  (opcional) búsqueda para "Cómo llegar"; null = sin enlace de mapa.
//             Si falta, se usa "<place>, León".
//   sessions  (opcional) funciones con hora: [{date:'AAAA-MM-DD', time:'HH:MM'}, …].
//             Cada una se puede añadir al calendario por separado.
//   time      (opcional, solo si no hay sessions) texto libre: "hora por confirmar"…
//   duration  (opcional) minutos; para la hora de fin en el calendario (si falta, 60)
//   age       (opcional) {min, max}; cualquiera de los dos puede faltar. Sin age = edad
//             no indicada en la fuente (el evento se muestra con cualquier filtro de edad).
//   price     (opcional) texto: '7 €', 'Gratis', '6 € niños · 3 € adultos'
//   tickets   (opcional) URL de compra de entradas
//   summary, detail, source (dominios separados por " · ", se muestran como enlaces)
//
// Tras editar este fichero: ./tools/build-ics.sh  (y subir ics/ en el mismo commit)

const events = [
  {
    id:'cuentoreyes', title:'Cuentacuentos: A la caza de Papá Noel y los Reyes Magos', cat:'taller',
    start:'2026-11-28', end:'2026-11-28',
    place:'Librería Pastor Infantil',
    sessions:[{date:'2026-11-28', time:'12:00'}],
    summary:'Sesión de cuentacuentos de Emma S. Varela, dentro de la agenda semanal de planes en familia en León.',
    detail:'Nuevo esta semana (localizado en el post semanal de menudoesleon.com). Misma autora y título que el acto ya conocido del 17 de diciembre en la Biblioteca de Villaquilambre, pero sesión distinta. La fuente no especifica edad recomendada; el formato de cuentacuentos suele encajar con la franja de 3-5 años.',
    source:'menudoesleon.com'
  },
  {
    id:'tallersenet', title:'Taller "El desafío del Senet"', cat:'taller',
    start:'2026-11-28', end:'2026-11-28',
    place:'Museo Liceo Egipcio',
    sessions:[{date:'2026-11-28', time:'12:00'}],
    age:{min:4, max:12},
    summary:'Taller familiar en torno al antiguo juego egipcio del Senet.',
    detail:'Nuevo esta semana (localizado en el post semanal de menudoesleon.com). Recomendado de 4 a 12 años; el límite inferior entra en la franja de 3-5 años de este calendario, aunque el superior la supera ampliamente.',
    source:'menudoesleon.com'
  },
  {
    id:'bosqueenllamas', title:'El bosque en llamas', cat:'teatro',
    start:'2026-11-28', end:'2026-11-29',
    place:'Teatro San Francisco',
    sessions:[{date:'2026-11-28', time:'18:00'}, {date:'2026-11-29', time:'12:00'}],
    age:{min:5}, price:'7 €', duration:50,
    summary:'Teatro infantil de la compañía asturiana ElektraFiktion: un incendio arrasa un bosque donde conviven el erizo Espín y la zorra Pícara, y el público infantil debe guiar a los animales a un lugar seguro.',
    detail:'Apto a partir de 5 años, duración 50 min, entrada 7 €. Reverificado esta semana directamente en teatrosanfrancisco.es (acceso recuperado tras varias semanas de fallos). Sin cambios.',
    source:'teatrosanfrancisco.es · ctickets.es'
  },
  {
    id:'momia', title:'Menuda momia', cat:'teatro',
    start:'2026-11-29', end:'2026-11-29',
    place:'Salón de actos del Colegio de Villaobispo (Villaquilambre)',
    sessions:[{date:'2026-11-29', time:'18:00'}],
    age:{min:3, max:9},
    mapQuery:'Colegio Villaobispo de las Regueras, Villaquilambre, León',
    summary:'Espectáculo de marionetas de Marimba Marionetas, dentro del ciclo "Otoño Cultural" de Villaquilambre.',
    detail:'Recomendado para público infantil de 3 a 9 años y familiar. Reverificado esta semana directamente en la fuente del ciclo "Otoño Cultural". Sin cambios.',
    source:'menudoesleon.com · ileon.eldiario.es · heraldodeleon.es'
  },
  {
    id:'mercadonavideno', title:'Mercado Navideño de León', cat:'fiesta',
    start:'2026-12-04', end:'2027-01-06',
    place:'Plaza Mayor de León',
    summary:'Mercado de artesanía navideña con casetas distribuidas en forma de cruz e iluminación de "cielo estrellado".',
    detail:'Entra esta semana en la lista principal. Tras una amenaza de cancelación a principios de noviembre (renuncia del operador adjudicatario, dudas de los artesanos sobre el traslado), tres fuentes de prensa independientes confirmaron entre el 18 y el 20 de noviembre la ubicación en la Plaza Mayor, el diseño y la apertura prevista el 4 de diciembre, con cierre hacia el 6 de enero. No se ha localizado una resolución municipal oficial.',
    source:'diariodeleon.es · leonoticias.com · leon24horas.net · digitaldeleon.com'
  },
  {
    id:'parquenavideno', title:'Parque navideño infantil — Plaza de Toros', cat:'fiesta',
    start:'2026-12-05', end:'2027-01-07',
    place:'Plaza de Toros de León',
    age:{min:2, max:12}, price:'6 € niños · 3 € adultos',
    summary:'Castillos hinchables gigantes, toboganes, realidad virtual, piscina de bolas, zona de dibujo y cine navideño, en un espacio cubierto.',
    detail:'Entrada infantil (2-12 años) 6 €, adultos 3 €. Horario según sesión, publicado en criaturasjurasicas.com. Sin cambios respecto a la semana pasada.',
    source:'menudoesleon.com · digitaldeleon.com'
  },
  {
    id:'lasemilla', title:'La semilla', cat:'teatro',
    start:'2026-12-05', end:'2026-12-06',
    place:'Teatro San Francisco',
    sessions:[{date:'2026-12-05', time:'17:00'}, {date:'2026-12-05', time:'18:15'}, {date:'2026-12-06', time:'11:00'}, {date:'2026-12-06', time:'12:15'}],
    age:{min:3}, price:'7 €', duration:40,
    summary:'Espectáculo de títeres y objetos de La Canela Títeres (Jaén): una reflexión sobre sembrar y cuidar los potenciales de la infancia, con los límites como ayuda para crecer y el miedo como un obstáculo a superar.',
    detail:'Apto a partir de 3 años, duración 40 min, entrada 7 €. Reverificado esta semana directamente en teatrosanfrancisco.es. Es el espectáculo de este calendario con la edad recomendada más ajustada a la franja de 3-5 años.',
    source:'teatrosanfrancisco.es · ctickets.es'
  },
  {
    id:'soyunoso', title:'Soy un oso', cat:'teatro',
    start:'2026-12-12', end:'2026-12-13',
    place:'Teatro San Francisco',
    sessions:[{date:'2026-12-12', time:'18:00'}, {date:'2026-12-13', time:'12:00'}],
    age:{min:4}, price:'7 €', duration:50,
    summary:'Títeres, marionetas y música de Cía. Yheppa Títeres (Asturias). Ursus, un oso, sale de su cueva en primavera y descubre que su bosque ha sido sustituido por una fábrica; sus habitantes le hacen dudar de que sea realmente un oso. Basado en el cuento "El oso que no era", de Frank Tashlin.',
    detail:'Apto a partir de 4 años · duración 50 min · entrada 7 €. Reverificado esta semana directamente en teatrosanfrancisco.es. Sin cambios.',
    source:'teatrosanfrancisco.es · ctickets.es'
  },
  {
    id:'papanoelvq', title:'A la caza de Papá Noel', cat:'taller',
    start:'2026-12-17', end:'2026-12-17',
    place:'Biblioteca de Villaquilambre', time:'hora por confirmar',
    summary:'Presentación y firma del libro infantil de Emma S. Varela, dentro del ciclo "Otoño Cultural" de Villaquilambre.',
    detail:'Reverificado esta semana directamente en la fuente del ciclo "Otoño Cultural": sigue siendo el último acto confirmado, con la hora aún sin anunciar.',
    source:'menudoesleon.com · ileon.eldiario.es · heraldodeleon.es'
  },
  {
    id:'cabalgaza', title:'La Cabalgaza — desfile de Papá Noel', cat:'fiesta',
    start:'2026-12-19', end:'2026-12-19',
    place:'Calles de León (recorrido por anunciar)', time:'hora por confirmar',
    mapQuery:null,
    summary:'Desfile navideño con Papá Noel, carrozas, música, acróbatas, elfos, duendes y renos, dentro de una gira de la Cabalgaza por cinco ciudades de Castilla y León (Valladolid 12, Palencia 13, León 19, Salamanca 20 y Zamora 23 de diciembre).',
    detail:'Reconfirmado esta semana por una fuente adicional (Digital de León, 16 nov). El horario y el recorrido por las calles de León todavía no se han publicado.',
    source:'elespanol.com · digitaldeleon.com'
  }
];

const recurring = [
  { title:'"Conocemos a la reina Urraca" (taller, Palacio del Conde Luna) — NUEVO esta semana', desc:'Viernes 27 (18:00) y sábado 28 de noviembre (12:00) de 2026. Recomendado de 6 a 8 años, por encima de la franja de 3-5 de este calendario. Parece continuar el ciclo histórico de talleres del Palacio del Conde Luna con una temática distinta a la de años anteriores.', source:'menudoesleon.com (consultado esta semana)' },
  { title:'Teatro San Francisco — ciclo infantil-familiar de enero de 2027 (fuera de ventana, para referencia)', desc:'Papá Zorro (9-10 ene, 4-9 años), Dale (16-17 ene, desde 5 años), Casa (23-24 ene, desde 4 años) y La niña de las trenzas al revés (30-31 ene, desde 4 años). Todas sáb 18:00 / dom 12:00, 7 €. Se incorporarán a la lista principal cuando la ventana móvil las alcance.', source:'teatrosanfrancisco.es (calendario oficial, consultado esta semana)' },
  { title:'MUSAC — visita familiar (Pistoletto / exposiciones temporales)', desc:'Domingo 6 de diciembre de 2026, 12:00 (la visita del 22 de noviembre ya se ha celebrado). Pensada para niños de 5 a 12 años, por encima de la franja de 3-5 de este calendario. No se ha podido consultar esta semana si existe algún programa "Pequeamigos" o "Diverviaje para Pequeamigos" (error del servidor de musac.es).', source:'musac.es · menudoesleon.com (semanas anteriores)' },
  { title:'Rompamos barreras (taller, Biblioteca Pública de León)', desc:'Miércoles 25 de noviembre y 2 de diciembre de 2026, 19:00, con Mar Bonaque. Edad confirmada: a partir de 6 años, por lo que queda fuera de la franja de 3-5 años de este calendario.', source:'bibliotecas.jcyl.es (consultado en semanas anteriores)' },
  { title:'Villaquilambre — ciclo "Otoño Cultural"', desc:'Confirmado esta semana directamente en la fuente que no hay más funciones de teatro/música en diciembre aparte de "Menuda momia" (29 nov) y "A la caza de Papá Noel" (17 dic), ambas ya en la lista principal.', source:'menudoesleon.com (consultado esta semana)' },
  { title:'"Teatro para compartir en familia" — Casa de Cultura de Armunia', desc:'Ciclo gratuito municipal de teatro/títeres para toda la familia, sábados 18:00. No se ha reverificado esta semana; sin convocatoria de 2026 encontrada hasta ahora.', source:'búsquedas de prensa local (sin convocatoria 2026 confirmada)' },
  { title:'Biblioescena 2026 (Junta de Castilla y León)', desc:'Ciclo regional de teatro infantil/familiar en bibliotecas públicas, con sesiones de 3+, 4+ y 5+ años en otoño de 2026. En búsquedas anteriores todas las sesiones localizadas eran en la Biblioteca Pública de Salamanca, ninguna en León capital. Esta semana se ha localizado un programa similar de cuentos para bebés, pero en Valladolid, no en León.', source:'turismocastillayleon.com' },
  { title:'Biblioteca Pública de León — agenda de diciembre', desc:'No se ha podido consultar esta semana la página de agenda de bibliotecas.jcyl.es (error de acceso). Se reintentará la próxima semana para localizar cuentacuentos y talleres de diciembre específicos para 3-5 años.', source:'bibliotecas.jcyl.es' },
  { title:'Agenda de fin de semana (menudoesleon.com, ahoraleon.com)', desc:'El post semanal de menudoesleon.com sigue al día (publicado 18 nov, revisado 23 nov, cubre el 27-29 de noviembre); los dos eventos nuevos de esta semana salen de ahí. ahoraleon.com no ha aportado información adicional relevante esta semana.', source:'menudoesleon.com' }
];

// ── Al actualizar cada semana, basta con cambiar estas tres fechas (y los datos de arriba) ──
const WINDOW_START = '2026-11-24';   // primer día del periodo cubierto
const WINDOW_END   = '2026-12-24';   // último día del periodo cubierto
const UPDATED      = '2026-11-24';   // fecha de la última revisión de fuentes
const STALE_AFTER_DAYS = 7;          // a partir de cuántos días se avisa de que los datos son antiguos
