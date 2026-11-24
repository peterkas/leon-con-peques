# León con Peques

Calendario de planes para niños de 3 a 5 años en León capital y alrededores, publicado como app web instalable (PWA) en GitHub Pages:

**https://peterkas.github.io/leon-con-peques/**

## Instalar en el móvil

- **iPhone / iPad:** abre la URL en Safari → *Compartir* → *Añadir a pantalla de inicio*.
- **Android:** abre la URL en Chrome → *Instalar app* (o menú ⋮ → *Añadir a pantalla de inicio*).

## Estructura

| Fichero | Qué es |
|---|---|
| `data.js` | **Datos**: eventos (`events`), programación habitual (`recurring`) y fechas del periodo |
| `lib.js` | Fechas, sesiones, edades: lógica compartida por la página y el generador de `.ics` |
| `index.html` | La app: estilos, lógica y texto de novedades del pie |
| `tools/build-ics.sh` | Valida `data.js` y genera `ics/` (un `.ics` por evento y función). `ics/` no se sube: lo genera GitHub al publicar |
| `tools/test.sh` | Pruebas locales: validación + `.ics` + prueba de humo de la página (`./tools/test.sh [AAAA-MM-DD]`) |
| `.github/workflows/` | `publicar.yml` (valida, genera y publica en cada push) · `recordatorio.yml` (aviso semanal si los datos tienen 8+ días) |
| `manifest.webmanifest` | Nombre, colores e iconos para instalarla |
| `sw.js` | Service worker: funcionamiento sin conexión y actualizaciones |
| `icons/` | Iconos (`icon.svg` es el original) |

## Actualizar el calendario

1. En `data.js`, edita `events` y `recurring` y las fechas `WINDOW_START`, `WINDOW_END` y `UPDATED`. En `index.html`, el texto de novedades del pie. La cabecera, los meses, el bloque "Próximos días" (hoy + 4 días) y la fecha de actualización se generan solos.
   - Los campos de cada evento están documentados al principio de `data.js`: `sessions` (funciones con hora, cada una añadible al calendario), `age`, `price`, `duration`, `tickets`, `mapQuery`… Lo que no diga la fuente, se deja sin poner (no se inventa).
   - Antes de hacer commit, ejecuta `./tools/test.sh`.
2. Haz commit y push a `main`. El flujo **Publicar** valida, genera los `.ics` y publica en uno o dos minutos. Si la validación falla, no se publica nada.
   - Con Claude Code: `/leon-actualizar` hace todo el proceso (investigación incluida) y pide confirmación antes de publicar.
3. La app instalada carga la versión nueva la próxima vez que se abra con conexión.
