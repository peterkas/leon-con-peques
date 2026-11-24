// Genera un .ics por evento a partir de data.js. Se ejecuta con jsc (JavaScriptCore,
// incluido en macOS) desde tools/build-ics.sh, que reparte la salida en ficheros.
// Formato de salida: para cada fichero, una línea "=====FILE <ruta>" y su contenido.

const SITE = 'https://peterkas.github.io/leon-con-peques/';

function compact(s){ return s.replace(/-/g, ''); }
function addDays(s, n){
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d) + n * 86400000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}
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
  let cur = '', bytes = 0, limit = 75;
  for (const ch of line) {
    const b = utf8len(ch);
    if (bytes + b > limit) { out.push(cur); cur = ' '; bytes = 1; limit = 75; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out;
}

function vevent(e){
  const single = e.start === e.end && /^\d{1,2}:\d{2}$/.test(e.time || '');
  const lines = [
    'BEGIN:VEVENT',
    `UID:${e.id}@leon-con-peques`,
    `DTSTAMP:${compact(UPDATED)}T000000Z`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.place)}`,
  ];
  if (single) {
    const [h, mi] = e.time.split(':').map(Number);
    const hh = String(h).padStart(2, '0'), mm = String(mi).padStart(2, '0');
    const he = String(Math.min(h + 1, 23)).padStart(2, '0');
    // Hora local "flotante": se interpreta en la zona horaria del dispositivo (España).
    lines.push(`DTSTART:${compact(e.start)}T${hh}${mm}00`, `DTEND:${compact(e.start)}T${he}${mm}00`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compact(e.start)}`, `DTEND;VALUE=DATE:${compact(addDays(e.end, 1))}`);
  }
  const desc = [
    e.summary,
    e.time && !single ? `Horario: ${e.time}` : '',
    `Fuente: ${e.source}`,
    `Más info: ${SITE}#ev-${e.id}`,
  ].filter(Boolean).join('\n\n');
  lines.push(`DESCRIPTION:${esc(desc)}`, `URL:${SITE}#ev-${e.id}`);
  // Aviso: 2 h antes si hay hora; si es de día completo, a las 18:00 del día anterior.
  lines.push(
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`,
    `TRIGGER:${single ? '-PT2H' : '-PT6H'}`, 'END:VALARM',
    'END:VEVENT'
  );
  return lines;
}

function calendar(evs, name){
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Leon con Peques//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(name)}`,
  ];
  evs.forEach(e => lines.push(...vevent(e)));
  lines.push('END:VCALENDAR');
  return lines.flatMap(fold).join('\r\n') + '\r\n';
}

const ids = new Set();
events.forEach(e => {
  if (!/^[a-z0-9-]+$/.test(e.id)) throw new Error(`id no válido (solo a-z, 0-9 y guiones): "${e.id}"`);
  if (ids.has(e.id)) throw new Error(`id repetido: "${e.id}"`);
  ids.add(e.id);
  print(`=====FILE ics/${e.id}.ics`);
  print(calendar([e], e.title));
});
