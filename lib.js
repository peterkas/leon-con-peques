// Utilidades compartidas por la página (index.html) y el generador de .ics (tools/ics.js).
// Sin acceso al DOM: solo fechas, sesiones y textos derivados de data.js.

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTHS_LONG = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WD_SHORT = ['lun','mar','mié','jue','vie','sáb','dom'];
const SITE_URL = 'https://peterkas.github.io/leon-con-peques/';
const DEFAULT_DURATION_MIN = 60;

function iso(y,m,d){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function parseISO(s){ const [y,m,d] = s.split('-').map(Number); return {y, m:m-1, d}; }
function compact(s){ return s.replace(/-/g,''); }
function addDays(s, n){
  const {y,m,d} = parseISO(s);
  const t = new Date(Date.UTC(y,m,d) + n*86400000);
  return iso(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
}
function daysBetween(a, b){
  const A = parseISO(a), B = parseISO(b);
  return Math.round((Date.UTC(B.y,B.m,B.d) - Date.UTC(A.y,A.m,A.d)) / 86400000);
}
function weekdayIdx(s){ const {y,m,d} = parseISO(s); return (new Date(Date.UTC(y,m,d)).getUTCDay() + 6) % 7; } // 0=lun … 6=dom
function fmtDayMonth(s){ const {m,d} = parseISO(s); return `${d} de ${MONTHS_LONG[m]}`; }
function fmtFull(s){ return `${fmtDayMonth(s)} de ${parseISO(s).y}`; }
function fmtShort(s){ const {m,d} = parseISO(s); return `${WD_SHORT[weekdayIdx(s)]} ${d} ${MONTHS_ES[m]}`; }

// ── Sesiones (funciones con fecha y hora) ──
function getSessions(e){ return Array.isArray(e.sessions) ? e.sessions : []; }
function sessionKey(s){ return `${compact(s.date)}-${s.time.replace(':','')}`; }
function addMinutes(time, mins){
  const [h, m] = time.split(':').map(Number);
  const t = Math.min(h*60 + m + mins, 23*60 + 59);
  return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
}
function sessionEnd(e, s){ return addMinutes(s.time, e.duration || DEFAULT_DURATION_MIN); }

// Texto de horario. Con sesiones: "18:00" (un día) o "sáb 17:00 y 18:15 · dom 11:00".
// onlyDays (opcional) limita a esas fechas, p. ej. para el bloque del fin de semana.
function timeText(e, onlyDays){
  const ss = getSessions(e).filter(s => !onlyDays || onlyDays.includes(s.date));
  if(!ss.length) return onlyDays && getSessions(e).length ? '' : (e.time || '');
  const byDate = [];
  ss.forEach(s => {
    const g = byDate.find(x => x.date === s.date);
    if(g) g.times.push(s.time); else byDate.push({ date: s.date, times: [s.time] });
  });
  if(byDate.length === 1) return byDate[0].times.join(' y ');
  return byDate.map(g => `${WD_SHORT[weekdayIdx(g.date)]} ${g.times.join(' y ')}`).join(' · ');
}

// ── Edad ──
function ageLabel(e){
  if(!e.age) return '';
  const {min, max} = e.age;
  if(min != null && max != null) return `${min}–${max} años`;
  if(min != null) return `${min}+ años`;
  if(max != null) return `hasta ${max} años`;
  return '';
}
// Sin edad indicada → se muestra siempre (no se puede descartar).
function fitsAge(e, age){
  if(!e.age) return true;
  const {min, max} = e.age;
  return (min == null || age >= min) && (max == null || age <= max);
}
