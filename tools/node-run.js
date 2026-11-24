// Ejecuta varios scripts "de navegador" en un mismo ámbito global con Node, igual que jsc:
//   node tools/node-run.js data.js lib.js tools/check.js
// (Se usa en GitHub Actions, donde no hay jsc.)
const vm = require('vm');
const fs = require('fs');
globalThis.print = (...a) => console.log(...a);
for (const f of process.argv.slice(2)) {
  vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: f });
}
