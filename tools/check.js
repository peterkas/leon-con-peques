// Valida data.js. Se ejecuta tras data.js y lib.js:
//   jsc data.js lib.js tools/check.js        (Mac)
//   node tools/node-run.js data.js lib.js tools/check.js   (GitHub Actions)
// Si hay errores, lanza una excepción (código de salida ≠ 0) y no se publica nada.
(function(){
  const errors = [], warnings = [];
  const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
  const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
    && iso(parseISO(s).y, parseISO(s).m, parseISO(s).d) === s;
  const CATS = ['fiesta', 'teatro', 'taller'];

  [['WINDOW_START', WINDOW_START], ['WINDOW_END', WINDOW_END], ['UPDATED', UPDATED]]
    .forEach(([n, v]) => { if (!isDate(v)) err(`${n} no es una fecha válida: ${v}`); });
  if (WINDOW_START > WINDOW_END) err('WINDOW_START es posterior a WINDOW_END');

  const ids = new Set();
  events.forEach((e, i) => {
    const where = `evento #${i + 1} (${e.id || 'sin id'})`;
    if (!/^[a-z0-9-]+$/.test(e.id || '')) err(`${where}: id no válido (solo a-z, 0-9 y guiones)`);
    if (ids.has(e.id)) err(`${where}: id repetido`);
    ids.add(e.id);
    ['title', 'place', 'summary', 'detail', 'source'].forEach(k => {
      if (typeof e[k] !== 'string' || !e[k].trim()) err(`${where}: falta "${k}"`);
    });
    if (!CATS.includes(e.cat)) err(`${where}: cat debe ser ${CATS.join(' | ')}`);
    if (!isDate(e.start) || !isDate(e.end)) err(`${where}: start/end no son fechas válidas`);
    else {
      if (e.start > e.end) err(`${where}: start es posterior a end`);
      if (e.end < WINDOW_START) warn(`${where}: terminó antes del periodo cubierto; se puede quitar`);
      if (e.start > WINDOW_END) warn(`${where}: empieza después del periodo cubierto; no se verá en el calendario`);
    }
    if (e.sessions !== undefined) {
      if (!Array.isArray(e.sessions) || !e.sessions.length) err(`${where}: sessions debe ser una lista no vacía`);
      else e.sessions.forEach(s => {
        if (!s || !isDate(s.date) || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(s.time || '')) err(`${where}: sesión no válida ${JSON.stringify(s)}`);
        else if (s.date < e.start || s.date > e.end) err(`${where}: sesión ${s.date} fuera de start–end`);
      });
      if (e.time) warn(`${where}: tiene sessions y time; se ignora time`);
    }
    if (e.time !== undefined && typeof e.time !== 'string') err(`${where}: time debe ser texto`);
    if (e.age !== undefined) {
      const a = e.age || {};
      const ok = (v) => v === undefined || (Number.isInteger(v) && v >= 0 && v <= 18);
      if (!ok(a.min) || !ok(a.max) || (a.min === undefined && a.max === undefined)) err(`${where}: age debe ser {min, max} con enteros 0–18`);
      else if (a.min !== undefined && a.max !== undefined && a.min > a.max) err(`${where}: age.min > age.max`);
    }
    if (e.duration !== undefined && !(Number.isInteger(e.duration) && e.duration > 0 && e.duration <= 600)) err(`${where}: duration debe ser minutos (entero)`);
    if (e.price !== undefined && (typeof e.price !== 'string' || !e.price.trim())) err(`${where}: price debe ser texto`);
    if (e.tickets !== undefined && !/^https:\/\/\S+$/.test(e.tickets || '')) err(`${where}: tickets debe ser una URL https`);
    if (e.mapQuery !== undefined && e.mapQuery !== null && typeof e.mapQuery !== 'string') err(`${where}: mapQuery debe ser texto o null`);
  });

  recurring.forEach((r, i) => {
    ['title', 'desc', 'source'].forEach(k => {
      if (typeof r[k] !== 'string' || !r[k].trim()) err(`recurring #${i + 1}: falta "${k}"`);
    });
  });

  warnings.forEach(w => print(`aviso: ${w}`));
  if (errors.length) {
    errors.forEach(e => print(`ERROR: ${e}`));
    throw new Error(`data.js tiene ${errors.length} error(es)`);
  }
  print(`data.js OK: ${events.length} eventos, ${recurring.length} entradas habituales${warnings.length ? `, ${warnings.length} aviso(s)` : ''}`);
})();
