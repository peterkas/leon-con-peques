# León con Peques

Calendario de planes para niños de 3 a 5 años en León capital y alrededores, publicado como app web instalable (PWA) en GitHub Pages:

**https://peterkas.github.io/leon-con-peques/**

## Instalar en el móvil

- **iPhone / iPad:** abre la URL en Safari → *Compartir* → *Añadir a pantalla de inicio*.
- **Android:** abre la URL en Chrome → *Instalar app* (o menú ⋮ → *Añadir a pantalla de inicio*).

## Estructura

| Fichero | Qué es |
|---|---|
| `index.html` | La app: estilos, datos de eventos (`events`, `recurring`) y lógica |
| `manifest.webmanifest` | Nombre, colores e iconos para instalarla |
| `sw.js` | Service worker: funcionamiento sin conexión |
| `icons/` | Iconos (`icon.svg` es el original) |

## Actualizar el calendario

1. En `index.html`, edita los arrays `events` y `recurring`, las fechas `WINDOW_START`, `WINDOW_END` y `UPDATED`, y el texto de novedades del pie. La cabecera, los meses del calendario y la fecha de actualización se generan solos a partir de esas fechas.
2. Haz commit y push a `main`. GitHub Pages publica en uno o dos minutos.
3. La app instalada carga la versión nueva la próxima vez que se abra con conexión.
