// Resumen de lo que pintaría la página (se ejecuta después del script de index.html).
(function(){
  const h3 = c => (c.innerHTML.match(/<h3>(.*?)<\/h3>/) || [,'?'])[1];
  const fails = [];
  const upcoming = events.filter(e => e.end >= TODAY).length;
  if (ids.cards.children.length !== upcoming && !isFiltered()) fails.push(`lista: ${ids.cards.children.length} tarjetas, esperadas ${upcoming}`);
  if (!ids.months.children.length) fails.push('no se ha pintado ningún mes');
  ids.cards.children.forEach(c => { if (!c.id || !c.id.startsWith('ev-')) fails.push(`tarjeta sin ancla: ${h3(c)}`); });

  print(`hoy       : ${TODAY}`);
  print(`cabecera  : ${ids.range.textContent} · ${ids.updatedLine.textContent}`);
  print(`aviso     : ${ids.staleNotice.hidden ? '(ninguno)' : ids.staleNotice.innerHTML.replace(/<[^>]+>/g, '')}`);
  print(`meses     : ${ids.months.children.map(m => m.children[0].textContent).join(' | ')}`);
  print(`finde     : ${ids.weekend.hidden ? '(oculto)' : ids.weekendTitle.textContent + ' → ' + (ids.weekendList.children.length + ' planes')}`);
  print(`próximos  : ${ids.cards.children.length} · ya celebrados: ${ids.pastCards.children.length}`);
  ids.cards.children.forEach(c => print(`   · ${h3(c)}`));
  if (fails.length) { fails.forEach(f => print(`FALLO: ${f}`)); throw new Error('prueba de humo fallida'); }
  print('prueba de humo OK');
})();
