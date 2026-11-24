// Mini-DOM para ejecutar el script de index.html fuera del navegador (prueba de humo).
// Variables opcionales definidas antes: FAKE_TODAY ('AAAA-MM-DD'), FAKE_UA, FAKE_FILTERS (JSON).
function El(tag){ this.tag=tag; this.children=[]; this.className=''; this.textContent=''; this._html=''; this.hidden=false; this.dataset={}; this.attrs={}; this.style={}; this.classList={add(){},remove(){}}; }
Object.defineProperty(El.prototype,'innerHTML',{ get(){ return this._html; }, set(v){ this._html=v; this.children=[]; } });
El.prototype.appendChild=function(c){ this.children.push(c); return c; };
El.prototype.setAttribute=function(k,v){ this.attrs[k]=v; };
El.prototype.addEventListener=function(){}; El.prototype.focus=function(){};
var ids={};
['range','updatedLine','staleNotice','filters','legend','months','cards','filterNote','noUpcoming','pastWrap','pastCount','pastCards','footerUpdated','modalBackdrop','modalDate','modalCards','modalClose','recurring','weekend','weekendTitle','weekendList','weekendEmpty','weekendAlso'].forEach(i=>ids[i]=new El('div'));
['staleNotice','weekend','weekendEmpty','weekendAlso','noUpcoming','pastWrap','filterNote'].forEach(i=>ids[i].hidden=true);
var document={ getElementById:i=>ids[i], createElement:t=>new El(t), addEventListener(){}, removeEventListener(){}, activeElement:null };
var window={ addEventListener(){} };
var navigator={ userAgent: typeof FAKE_UA!=='undefined'?FAKE_UA:'' };
var localStorage={ getItem:()=>typeof FAKE_FILTERS!=='undefined'?FAKE_FILTERS:null, setItem(){} };
if(typeof URLSearchParams==='undefined'){
  var URLSearchParams=function(o){ this.o=o; };
  URLSearchParams.prototype.toString=function(){ return Object.keys(this.o).map(k=>k+'='+encodeURIComponent(this.o[k])).join('&'); };
}
if(typeof FAKE_TODAY!=='undefined'){
  const RealDate=Date; const [Y,M,D]=FAKE_TODAY.split('-').map(Number);
  Date=function(...a){ return a.length? new RealDate(...a) : new RealDate(Y,M-1,D,12); };
  Date.UTC=RealDate.UTC; Date.now=()=>RealDate.now();
}
