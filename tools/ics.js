// Genera los .ics a partir de data.js + lib.js. Se ejecuta con jsc (JavaScriptCore,
// incluido en macOS) desde tools/build-ics.sh, que reparte la salida en ficheros.
// Formato de salida: para cada fichero, una línea "=====FILE <ruta>" y su contenido.
//
//   ics/<id>.ics              todas las funciones del evento (o el evento de día completo)
//   ics/<id>-<AAAAMMDD>-<HHMM>.ics   una sola función (solo si el evento tiene varias)

function esc(s){
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function utf8len(ch){
  const c = ch.codePointAt(0);
  return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}
// RFC 5545: líneas de máximo 75 octetos; las de continuación empiezan por un espacio.
function fold(line){
  const out = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const b = utf8len(ch);
    if (bytes + b > 75) { out.push(cur); cur = ' '; bytes = 1; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out;
}

function description(e, withSchedule){
  return [
    e.summary,
    withSchedule && timeText(e) ? `Horario: ${timeText(e)}` : '',
    [ageLabel(e) && `Edad: ${ageLabel(e)}`, e.price && `Precio: ${e.price}`].filter(Boolean).join(' · '),
    e.tickets ? `Entradas: ${e.tickets}` : '',
    `Fuente: ${e.source}`,
    `Más info: ${SITE_URL}#ev-${e.id}`,
  ].filter(Boolean).join('\n\n');
}

function vevent(e, uid, timing, desc){
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@leon-con-peques`,
    `DTSTAMP:${compact(UPDATED)}T000000Z`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.place)}`,
    ...timing,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${SITE_URL}#ev-${e.id}`,
    // Aviso: 2 h antes si hay hora; si es de día completo, a las 18:00 del día anterior.
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`,
    `TRIGGER:${timing[0].includes('VALUE=DATE') ? '-PT6H' : '-PT2H'}`, 'END:VALARM',
    'END:VEVENT',
  ];
}

// Hora local "flotante": se interpreta en la zona horaria del dispositivo (España).
function sessionTiming(e, s){
  const t = (hhmm) => hhmm.replace(':', '') + '00';
  return [`DTSTART:${compact(s.date)}T${t(s.time)}`, `DTEND:${compact(s.date)}T${t(sessionEnd(e, s))}`];
}
function allDayTiming(e){
  return [`DTSTART;VALUE=DATE:${compact(e.start)}`, `DTEND;VALUE=DATE:${compact(addDays(e.end, 1))}`];
}

function calendar(name, vevents){
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Leon con Peques//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(name)}`,
  ];
  vevents.forEach(v => lines.push(...v));
  lines.push('END:VCALENDAR');
  return lines.flatMap(fold).join('\r\n') + '\r\n';
}
function emit(path, content){ print(`=====FILE ${path}`); print(content); }

const ids = new Set();
events.forEach(e => {
  if (!/^[a-z0-9-]+$/.test(e.id)) throw new Error(`id no válido (solo a-z, 0-9 y guiones): "${e.id}"`);
  if (ids.has(e.id)) throw new Error(`id repetido: "${e.id}"`);
  ids.add(e.id);
  const ss = getSessions(e);
  ss.forEach(s => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date) || !/^\d{1,2}:\d{2}$/.test(s.time)) throw new Error(`sesión no válida en "${e.id}": ${JSON.stringify(s)}`);
    if (s.date < e.start || s.date > e.end) throw new Error(`sesión fuera de start–end en "${e.id}": ${s.date}`);
  });

  if (ss.length) {
    const vs = ss.map(s => vevent(e, `${e.id}-${sessionKey(s)}`, sessionTiming(e, s), description(e, false)));
    emit(`ics/${e.id}.ics`, calendar(e.title, vs));
    if (ss.length > 1) ss.forEach((s, i) => emit(`ics/${e.id}-${sessionKey(s)}.ics`, calendar(e.title, [vs[i]])));
  } else {
    emit(`ics/${e.id}.ics`, calendar(e.title, [vevent(e, e.id, allDayTiming(e), description(e, true))]));
  }
});
