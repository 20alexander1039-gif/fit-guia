(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var DIAS=['L','M','X','J','V','S','D'],NOM=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
var NIV=['','Principiante','Intermedio','Avanzado'];
var RUTINAS=[
 {n:'Piernas y glúteos',min:20,m2:2,obj:['musculo','peso']},
 {n:'Pausa postural de espalda',min:10,m2:1,obj:['postura']},
 {n:'Core y movilidad',min:15,m2:1,obj:['postura','cond']},
 {n:'Full body sin equipo',min:30,m2:4,obj:['cond','peso','musculo']},
 {n:'Espalda y hombros',min:20,m2:2,obj:['postura','musculo']}];
var EJ=[
 {n:'Sentadilla libre',g:'Piernas',v:1,e:'Sin equipo',o:['musculo','peso'],t:'Pies al ancho de hombros. Baja la cadera como si te sentaras, con la espalda recta y las rodillas alineadas con los pies. Sube empujando con los talones.'},
 {n:'Puente de glúteos',g:'Piernas',v:1,e:'Sin equipo',o:['musculo','postura'],t:'Acostado boca arriba, rodillas dobladas. Eleva la cadera hasta alinear hombros, cadera y rodillas. Baja con control.'},
 {n:'Zancadas',g:'Piernas',v:2,e:'Sin equipo',o:['peso','cond','musculo'],t:'Da un paso largo al frente y baja hasta que ambas rodillas formen 90°. Empuja con el pie delantero para volver.'},
 {n:'Plancha isométrica',g:'Core',v:2,e:'Sin equipo',o:['postura','cond','musculo'],t:'Apoya antebrazos y puntas de los pies. Mantén el cuerpo en línea recta, abdomen firme, sin hundir la cadera.'},
 {n:'Gato-camello',g:'Espalda',v:1,e:'Sin equipo',o:['postura'],t:'En cuatro apoyos, arquea la espalda hacia arriba y luego hacia abajo, lento y coordinado con la respiración.'},
 {n:'Estiramiento lumbar',g:'Espalda',v:1,e:'Sin equipo',o:['postura'],t:'Acostado boca arriba, lleva las rodillas al pecho y abrázalas 30 segundos respirando profundo.'},
 {n:'Remo con banda',g:'Espalda',v:2,e:'Banda elástica',o:['musculo','postura'],t:'Sentado con la banda en los pies, tira de los extremos hacia la cintura juntando los omóplatos. Vuelve lento.'},
 {n:'Flexiones',g:'Pecho',v:2,e:'Sin equipo',o:['musculo','cond'],t:'Manos bajo los hombros, cuerpo recto. Baja el pecho hacia el suelo y empuja hasta extender los brazos.'},
 {n:'Rotación de cuello',g:'Cuello',v:1,e:'Sin equipo',o:['postura'],t:'Sentado y con la espalda recta, gira la cabeza lentamente a cada lado y luego inclina la oreja hacia el hombro.'},
 {n:'Jumping jacks',g:'Cardio',v:1,e:'Sin equipo',o:['peso','cond'],t:'De pie, salta abriendo piernas y elevando los brazos sobre la cabeza; vuelve a la posición inicial al ritmo que puedas mantener.'},
 {n:'Peso muerto con mancuerna',g:'Espalda',v:3,e:'Mancuernas',o:['musculo'],t:'Con la espalda neutra, baja la mancuerna cerca de las piernas llevando la cadera atrás. Sube apretando glúteos.'}];
var CLIENTES=[
 ['Joaquín Reyes','Piernas y glúteos',85,'warn','Alerta postura',[62,68,71,78,81,85]],
 ['Carlos Maldonado','Core y movilidad',60,'warn','Alerta postura',[55,58,57,59,60,60]],
 ['Jazmín Esquivel','Full body',90,'ok','Normal',[84,86,88,89,90,90]],
 ['Elvis Presley','Espalda y hombros',92,'ok','Normal',[88,90,90,91,92,92]],
 ['Cecilia López','Pausa activa',66,'idle','Inactiva 4 días',[70,68,66,66,66,66]],
 ['Mateo Fernández','Piernas y glúteos',70,'idle','Bajo rendimiento',[75,74,72,71,70,70]]];
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
 del:function(k){try{localStorage.removeItem(k)}catch(e){}}};
var ses=null,tm=null,rt=null,seg=0,last=null,stream=null,cur=null;
var hoyI=function(){return (new Date().getDay()+6)%7};
var okRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function fmt(s){return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)}
function msg(el,txt,ok){var e=$(el);e.className=ok?'okmsg':'err';e.textContent=txt}
function abre(t,html){$('#d-t').textContent=t;$('#d-b').innerHTML=html;$('#dlg').showModal()}
function usuarios(){
 var u=store.get('usuarios',null);
 if(!u){u=[{mail:'ana@fitguia.com',pass:'123456',nombre:'Ana',rol:'cliente'},{mail:'luis@fitguia.com',pass:'123456',nombre:'Luis',rol:'entrenador'}];store.set('usuarios',u)}
 return u}
function perfil(){return store.get('perfil',{obj:'postura',nivel:1,dias:[true,false,true,false,true,false,false]})}

/* Roles y navegación */
var MENU={cliente:[['inicio','Inicio'],['ejercicios','Ejercicios'],['entrenar','Entrenar'],['progreso','Progreso'],['perfil','Perfil']],
 entrenador:[['panel','Dashboard'],['clientes','Lista de clientes']],ninguno:[['landing','Inicio'],['acceso','Acceso']]};
var ETQ={cliente:['Cliente','ok'],entrenador:['Entrenador','idle']};
function rol(){var r=store.get('rol','ninguno');return MENU[r]?r:'ninguno'}
function pintaNav(){
 var r=rol(),h='';
 if(r!=='ninguno')h+='<span class="tag rolb '+ETQ[r][1]+'">'+ETQ[r][0]+'</span>';
 h+=MENU[r].map(function(m){return '<a href="#'+m[0]+'">'+m[1]+'</a>'}).join('');
 if(r!=='ninguno')h+='<button type="button" id="salir">Cerrar sesión</button>';
 $('#nav').innerHTML=h;
 var e=$('#rol-h');e.hidden=r==='ninguno';
 if(r!=='ninguno'){e.textContent=ETQ[r][0];e.className='tag '+ETQ[r][1]}
 document.body.setAttribute('data-rol',r);
 var s=$('#salir');if(s)s.onclick=salir;
}
function salir(){apagaCam();store.set('rol','ninguno');location.hash='#landing';ir()}
function ir(){
 var r=rol(),id=(location.hash||'#'+MENU[r][0][0]).slice(1);
 if(MENU[r].every(function(m){return m[0]!==id})){location.hash='#'+MENU[r][0][0];return}
 pintaNav();
 if(id!=='entrenar')apagaCam();
 document.querySelectorAll('main>section').forEach(function(s){s.hidden=s.id!==id});
 document.querySelectorAll('#nav a').forEach(function(a){
  if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 var f={inicio:pintaInicio,ejercicios:pintaCat,progreso:pintaProgreso,perfil:pintaPerfil,panel:pintaPanel,clientes:pintaClientes}[id];
 if(f)f();
 $('#main').focus({preventScroll:true});
}
window.addEventListener('hashchange',ir);

/* Inicio: preferencias, rutinas, rutina personalizada y plan semanal (US03, US12, US19, US20) */
function sugerir(e){
 if(e)e.preventDefault();
 var min=parseInt($('#min').value,10),m2=parseInt($('#m2').value,10),obj=$('#obj').value;
 if(!(min>=5&&min<=60)){$('#e-pref').textContent='Ingresa un tiempo entre 5 y 60 minutos.';return}
 $('#e-pref').textContent='';
 var res=RUTINAS.filter(function(r){return r.min<=min&&r.m2<=m2&&r.obj.indexOf(obj)>-1});
 var ul=$('#rutinas');ul.innerHTML='';
 if(!res.length){ul.innerHTML='<li>No hay rutinas con esos datos. Prueba con más tiempo o espacio.</li>';return}
 res.forEach(function(r){
  var li=document.createElement('li');
  li.innerHTML='<span><b></b><br><span class="muted">'+r.min+' min · sin equipo · '+r.m2+' m²</span></span>';
  li.querySelector('b').textContent=r.n;
  var b=document.createElement('button');b.className='btn';b.type='button';b.textContent='Iniciar';
  b.setAttribute('aria-label','Iniciar '+r.n);
  b.addEventListener('click',function(){iniciar(r)});li.appendChild(b);ul.appendChild(li)});
}
$('#f-pref').addEventListener('submit',sugerir);
$('#b-gen').addEventListener('click',function(){
 var p=perfil(),min=parseInt($('#min').value,10),obj=$('#obj').value,ul=$('#pers');
 if(!(min>=5&&min<=60)){$('#e-pref').textContent='Ingresa un tiempo entre 5 y 60 minutos.';return}
 var l=EJ.filter(function(e){return e.o.indexOf(obj)>-1&&e.v<=p.nivel}).slice(0,Math.max(2,Math.floor(min/5)));
 ul.innerHTML='';
 if(!l.length){ul.innerHTML='<li>No hay ejercicios para ese objetivo y nivel.</li>';return}
 var li=document.createElement('li');
 li.innerHTML='<span><b>Rutina personalizada ('+NIV[p.nivel]+')</b><br><span class="muted"></span></span>';
 li.querySelector('.muted').textContent=l.map(function(e){return e.n+' 3×12'}).join(' · ');
 var b=document.createElement('button');b.className='btn';b.type='button';b.textContent='Iniciar';
 b.onclick=function(){iniciar({n:'Rutina personalizada',min:min,m2:2})};li.appendChild(b);ul.appendChild(li);
});
function pintaInicio(){
 var p=perfil();$('#obj').value=p.obj;
 var rs=RUTINAS.filter(function(r){return r.obj.indexOf(p.obj)>-1}),k=0,hay=p.dias.some(Boolean);
 $('#plan').innerHTML=hay?NOM.map(function(d,i){
  var t=p.dias[i]?rs[k++%rs.length].n:'Descanso';
  return '<li><b>'+d+'</b><span>'+t+'</span></li>'}).join(''):'<li>Elige tus días de entrenamiento en tu Perfil.</li>';
 pintaSemana();
}
function pintaSemana(){
 var hoy=hoyI(),hechos=store.get('sesiones',[]).map(function(s){return s.dia});
 $('#semana').innerHTML=DIAS.map(function(d,i){
  return '<li class="'+(hechos.indexOf(i)>-1?'on':'')+'"'+(i===hoy?' aria-current="date"':'')+'>'+d+
  (hechos.indexOf(i)>-1?'<span class="sr"> entrenado</span>':'')+'</li>'}).join('');
}

/* Pausa activa (US39) */
var pt=null,ps=300;
$('#b-pausa').addEventListener('click',function(){
 var b=this;
 if(pt){clearInterval(pt);pt=null;ps=300;$('#pausa').textContent=fmt(ps);b.textContent='Iniciar pausa';return}
 b.textContent='Detener pausa';
 pt=setInterval(function(){ps--;$('#pausa').textContent=fmt(ps);
  if(ps<=0){clearInterval(pt);pt=null;ps=300;b.textContent='Iniciar pausa';$('#pausa').textContent='¡Pausa completada!'}},1000);
});

/* Catálogo (US15, US16, US17) */
function opciones(sel,vals){var s=$(sel);vals.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;s.appendChild(o)})}
opciones('#f-g',EJ.map(function(e){return e.g}).filter(function(v,i,a){return a.indexOf(v)===i}));
opciones('#f-e',EJ.map(function(e){return e.e}).filter(function(v,i,a){return a.indexOf(v)===i}));
function pintaCat(){
 var q=$('#f-q').value.trim().toLowerCase(),g=$('#f-g').value,n=$('#f-n').value,e=$('#f-e').value;
 var l=EJ.filter(function(x){return x.n.toLowerCase().indexOf(q)>-1&&(!g||x.g===g)&&(!n||String(x.v)===n)&&(!e||x.e===e)});
 $('#cat-n').textContent=l.length+' ejercicio(s) encontrado(s).';
 var ul=$('#cat');ul.innerHTML='';
 if(!l.length){ul.innerHTML='<li>No hay ejercicios con esos filtros. Prueba quitando alguno.</li>';return}
 l.forEach(function(x){
  var li=document.createElement('li');
  li.innerHTML='<span><b></b><br><span class="muted">'+x.g+' · '+NIV[x.v]+' · '+x.e+'</span></span>';
  li.querySelector('b').textContent=x.n;
  var b=document.createElement('button');b.className='btn alt';b.type='button';b.textContent='Ver instrucciones';
  b.setAttribute('aria-label','Ver instrucciones de '+x.n);
  b.onclick=function(){
   abre(x.n,'<div class="demo" role="img" aria-label="Demostración visual de '+x.n+'">Demostración: '+x.n+'</div><p></p><p class="muted">'+x.g+' · '+NIV[x.v]+' · '+x.e+'</p>');
   $('#d-b p').textContent=x.t};
  li.appendChild(b);ul.appendChild(li)});
}
$('#f-cat').addEventListener('input',pintaCat);
$('#f-cat').addEventListener('submit',function(e){e.preventDefault()});

/* Sesión: iniciar, pausar, descanso y cámara (US22, US23, US24, US26, US27) */
function apagaCam(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}}
function iniciar(r){
 ses={r:r,v:0,n:0,serie:1,p:false};seg=0;last=null;apagaCam();clearInterval(rt);
 $('#resumen').hidden=true;location.hash='#entrenar';
 $('#sesion').innerHTML='<h2></h2><p class="muted" id="s-info"></p>'+
 '<div class="cam" role="group" aria-label="Vista de cámara">La cámara está desactivada. Puedes entrenar con el registro manual.</div>'+
 '<p class="muted">La cámara solo muestra tu imagen; el análisis automático de postura no está activo en esta versión.</p>'+
 '<p class="big" id="s-t">00:00</p><p>Repeticiones válidas: <b id="s-v">0</b> · No válidas: <b id="s-n">0</b></p>'+
 '<div id="s-a" role="alert"></div><p id="s-d" role="status" class="muted"></p>'+
 '<button class="btn" id="s-ok" type="button">Repetición válida</button> '+
 '<button class="btn alt" id="s-no" type="button">Repetición no válida</button> '+
 '<button class="btn alt" id="s-pau" type="button" aria-pressed="false">Pausar</button> '+
 '<button class="btn alt" id="s-des" type="button">Descanso de 30 s</button> '+
 '<button class="btn alt" id="s-cam" type="button">Activar cámara</button> '+
 '<button class="btn alt" id="s-sim" type="button">Simular alerta de postura</button> '+
 '<button class="btn" id="s-sig" type="button">Siguiente serie</button> '+
 '<button class="btn danger" id="s-fin" type="button">Finalizar</button>';
 $('#sesion h2').textContent=r.n;info();
 $('#s-ok').onclick=function(){if(!ses.p){ses.v++;act()}};
 $('#s-no').onclick=function(){if(!ses.p){ses.n++;act()}};
 $('#s-pau').onclick=function(){ses.p=!ses.p;this.textContent=ses.p?'Reanudar':'Pausar';this.setAttribute('aria-pressed',ses.p)};
 $('#s-des').onclick=function(){
  var d=30;clearInterval(rt);$('#s-d').textContent='Descanso: 30 s';
  rt=setInterval(function(){d--;$('#s-d').textContent=d>0?'Descanso: '+d+' s':'¡Descanso terminado! Continúa con la siguiente serie.';if(d<=0)clearInterval(rt)},1000)};
 $('#s-cam').onclick=camara;
 $('#s-sim').onclick=function(){$('#s-a').className='alerta';$('#s-a').textContent='Mantén la espalda recta'};
 $('#s-sig').onclick=function(){if(ses.serie<3)ses.serie++;info();$('#s-a').className='';$('#s-a').textContent=''};
 $('#s-fin').onclick=finalizar;
 clearInterval(tm);tm=setInterval(function(){if(!ses.p){seg++;$('#s-t').textContent=fmt(seg)}},1000);
}
function camara(){
 var b=$('#s-cam'),c=$('.cam');
 if(stream){apagaCam();c.textContent='Cámara desactivada. Puedes entrenar con el registro manual.';b.textContent='Activar cámara';return}
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){c.textContent='Tu navegador no permite usar la cámara. Usa el registro manual.';return}
 navigator.mediaDevices.getUserMedia({video:true}).then(function(s){
  stream=s;var v=document.createElement('video');v.autoplay=true;v.muted=true;v.playsInline=true;
  v.setAttribute('aria-label','Vista de tu cámara');v.srcObject=s;c.innerHTML='';c.appendChild(v);b.textContent='Desactivar cámara';
 }).catch(function(){c.textContent='No se pudo acceder a la cámara (permiso denegado o no disponible). Continúa con el registro manual.'});
}
function info(){$('#s-info').textContent='Serie '+ses.serie+' de 3 · meta 12 reps · '+ses.r.min+' min'}
function act(){$('#s-v').textContent=ses.v;$('#s-n').textContent=ses.n}
function finalizar(){
 clearInterval(tm);clearInterval(rt);apagaCam();
 var tot=ses.v+ses.n,p=tot?Math.round(ses.v/tot*100):0;
 last={min:Math.max(1,Math.round(seg/60)),v:ses.v,n:ses.n,p:p,dia:hoyI(),esf:0,rutina:ses.r.n,fecha:new Date().toLocaleDateString('es-PE')};
 $('#sesion').innerHTML='<p class="muted">Sesión finalizada.</p>';
 $('#r-t').textContent=fmt(seg);$('#r-p').textContent=p+'%';$('#r-v').textContent=ses.v;$('#r-n').textContent=ses.n;
 $('#ok-guardar').textContent='';$('#nota').value='';$('#esf').innerHTML='';
 [1,2,3,4,5].forEach(function(n){var b=document.createElement('button');b.type='button';b.textContent=n;
  b.setAttribute('aria-pressed','false');b.onclick=function(){last.esf=n;
   document.querySelectorAll('#esf button').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false')});
   b.classList.add('on');b.setAttribute('aria-pressed','true')};$('#esf').appendChild(b)});
 $('#resumen').hidden=false;$('#resumen').scrollIntoView();
}
$('#b-guardar').addEventListener('click',function(){
 if(!last)return;
 if(!last.esf){msg('#ok-guardar','Elige qué tan intensa fue la sesión (1 a 5).',false);return}
 last.nota=$('#nota').value.trim();
 var s=store.get('sesiones',[]);s.push(last);store.set('sesiones',s);last=null;
 msg('#ok-guardar','Sesión guardada correctamente.',true);
});

/* Progreso, meta e historial (US31, US34, US35) */
function pintaProgreso(){
 var s=store.get('sesiones',[]),m=[0,0,0,0,0,0,0],meta=store.get('meta',4);
 s.forEach(function(x){m[x.dia]+=x.min});
 var mx=Math.max.apply(null,m.concat([1]));
 $('#barras').innerHTML=m.map(function(v,i){
  return '<div><i style="height:'+Math.round(v/mx*110)+'px"></i>'+DIAS[i]+'<span class="sr"> '+v+' minutos</span></div>'}).join('');
 var n=Math.min(s.length,meta);
 $('#meta-t').textContent='Meta semanal: '+meta+' sesiones';$('#meta-i').value=meta;
 $('#meta-b').style.width=(n/meta*100)+'%';$('#meta-track').setAttribute('aria-valuenow',n);$('#meta-track').setAttribute('aria-valuemax',meta);
 $('#meta-p').textContent=n+' de '+meta+' completadas';$('#racha').textContent=s.length;
 var h=$('#hist');h.innerHTML='';
 if(!s.length){h.innerHTML='<li>Aún no tienes sesiones. Empieza una desde Inicio.</li>';return}
 s.slice().reverse().forEach(function(x){
  var li=document.createElement('li');
  li.innerHTML='<span><b></b><br><span class="muted">'+x.fecha+' · '+x.min+' min · precisión '+x.p+'% · esfuerzo '+x.esf+'/5</span></span>';
  li.querySelector('b').textContent=x.rutina;h.appendChild(li)});
}
$('#b-meta').addEventListener('click',function(){
 var v=parseInt($('#meta-i').value,10);
 if(!(v>=1&&v<=7)){msg('#e-meta','Ingresa una meta entre 1 y 7 sesiones.',false);return}
 $('#e-meta').textContent='';store.set('meta',v);pintaProgreso();msg('#ok-meta','Meta guardada.',true);
});

/* Perfil, vinculación, comentarios y datos (US08, US10, US46, US47, US48) */
function pintaHilo(el){
 var h=store.get('hilo',[]);
 $(el).innerHTML=h.length?h.map(function(x){return '<li><span><b>'+(x.de==='entrenador'?'Entrenador':'Tú')+'</b><br><span class="t"></span></span></li>'}).join(''):'<li>Aún no hay comentarios.</li>';
 $(el).querySelectorAll('.t').forEach(function(n,i){n.textContent=h[i].txt});
}
function pintaPerfil(){
 var p=perfil();$('#p-nom').value=store.get('usuario','');$('#p-obj').value=p.obj;$('#p-niv').value=p.nivel;
 $('#p-dias').innerHTML=DIAS.map(function(d,i){return '<label class="dia"><input type="checkbox" value="'+i+'"'+(p.dias[i]?' checked':'')+'> '+d+'</label>'}).join('');
 var v=store.get('vinculo',null);
 $('#vinc-e').textContent=v?'Vinculado con tu entrenador (código '+v+').':'Aún no estás vinculado a un entrenador.';
 pintaHilo('#hilo-c');
}
$('#f-perfil').addEventListener('submit',function(e){
 e.preventDefault();
 var n=$('#p-nom').value.trim();
 if(n.length<2){$('#e-p-nom').textContent='Ingresa tu nombre.';return}
 $('#e-p-nom').textContent='';
 var d=[];document.querySelectorAll('#p-dias input').forEach(function(c){d.push(c.checked)});
 store.set('perfil',{obj:$('#p-obj').value,nivel:parseInt($('#p-niv').value,10),dias:d});store.set('usuario',n);saludo();
 msg('#ok-perfil','Perfil guardado correctamente.',true);
});
$('#b-cod').addEventListener('click',function(){
 var c=$('#cod').value.trim().toUpperCase(),l=store.get('codigos',[]),i=l.indexOf(c);
 if(!c){msg('#e-cod','Ingresa el código que te dio tu entrenador.',false);return}
 if(i<0){msg('#e-cod','El código no es válido o ya fue usado.',false);return}
 l.splice(i,1);store.set('codigos',l);store.set('vinculo',c);
 var v=store.get('vinculados',[]);v.push(store.get('usuario','Cliente'));store.set('vinculados',v);
 $('#e-cod').textContent='';$('#cod').value='';pintaPerfil();
});
$('#b-resp').addEventListener('click',function(){
 var t=$('#resp').value.trim();
 if(!t){msg('#ok-resp','Escribe una respuesta antes de enviarla.',false);return}
 var h=store.get('hilo',[]);h.push({de:'cliente',txt:t});store.set('hilo',h);$('#resp').value='';pintaHilo('#hilo-c');msg('#ok-resp','Respuesta enviada.',true);
});
$('#b-del').addEventListener('click',function(){
 abre('¿Eliminar tus datos?','<p>Se borrarán tu cuenta, tu perfil, tu historial y tus comentarios de este navegador. Esta acción no se puede deshacer.</p><button class="btn danger" id="d-si" type="button">Sí, eliminar</button>');
 $('#d-si').onclick=function(){
  var m=store.get('mail','');store.set('usuarios',usuarios().filter(function(u){return u.mail!==m}));
  ['sesiones','perfil','hilo','meta','vinculo','usuario','mail'].forEach(store.del);
  $('#dlg').close();salir()};
});

/* Panel del entrenador (US04, US40, US41, US42, US43, US44, US46, US47) */
function filas(tb,lista){
 tb.innerHTML='';
 lista.forEach(function(c){
  var tr=document.createElement('tr');
  tr.innerHTML='<td><button type="button"></button></td><td></td><td>'+c[2]+'%</td><td><span class="tag '+c[3]+'">'+c[4]+'</span></td>';
  tr.querySelector('button').textContent=c[0];
  tr.querySelector('button').setAttribute('aria-label','Ver ficha de '+c[0]);
  tr.children[1].textContent=c[1];
  tr.querySelector('button').onclick=function(){ficha(c)};tb.appendChild(tr)});
}
function pintaPanel(){
 filas($('#tb-alertas'),CLIENTES.filter(function(c){return c[3]!=='ok'}));
 var prom=Math.round(CLIENTES.reduce(function(a,c){return a+c[2]},0)/CLIENTES.length);
 $('#metricas').innerHTML=[['Clientes activos',CLIENTES.length+store.get('vinculados',[]).length],['Precisión técnica promedio',prom+'%'],['Asistencia semanal','78%']]
  .map(function(m){return '<div class="card"><span class="muted">'+m[0]+'</span><b class="big">'+m[1]+'</b></div>'}).join('');
}
function pintaClientes(){
 var q=$('#buscar').value.trim().toLowerCase();
 var f=CLIENTES.filter(function(c){return (c[0]+' '+c[1]).toLowerCase().indexOf(q)>-1});
 filas($('#tbody'),f);$('#vacio').hidden=f.length>0;
 var v=store.get('vinculados',[]);$('#inv-l').textContent=v.length?'Clientes vinculados por invitación: '+v.join(', '):'Aún no hay clientes vinculados por invitación.';
}
$('#buscar').addEventListener('input',pintaClientes);
$('#b-inv').addEventListener('click',function(){
 var c='FIT-'+Math.floor(1000+Math.random()*9000),l=store.get('codigos',[]);l.push(c);store.set('codigos',l);
 $('#inv-c').textContent=c;
});
function ficha(c){
 cur=c;
 var pts=c[5].map(function(v,i){return (10+i*56)+','+(110-(v-50)*2)}).join(' ');
 abre(c[0],'<p>Última rutina: <span id="f-ur"></span><br>Precisión técnica: <b>'+c[2]+'%</b></p>'+
 '<svg viewBox="0 0 300 120" width="100%" role="img" aria-label="Evolución de precisión en 6 semanas"><polyline fill="none" stroke="#60a5fa" stroke-width="3" points="'+pts+'"/></svg>'+
 '<h3>Rutina asignada</h3><label for="as-r">Rutina<select id="as-r">'+RUTINAS.map(function(r){return '<option>'+r.n+'</option>'}).join('')+'</select></label>'+
 '<button class="btn" id="b-as" type="button">Asignar rutina</button><ul id="as-l" class="list"></ul>'+
 '<button class="btn" id="b-gs" type="button" hidden>Guardar cambios</button><p id="ok-as" role="status" class="okmsg"></p>'+
 '<h3>Comentarios</h3><ul id="hilo-e" class="list"></ul>'+
 '<label for="msg">Comentario para el cliente</label><textarea id="msg" rows="2"></textarea><button class="btn" id="b-msg" type="button">Enviar comentario</button><p id="ok-msg" role="status" class="okmsg"></p>');
 $('#f-ur').textContent=c[1];
 var a=store.get('asig',{})[c[0]];if(a){$('#as-r').value=a.r;lista(a.ej)}
 $('#b-as').onclick=function(){
  var r=RUTINAS.filter(function(x){return x.n===$('#as-r').value})[0];
  var ej=EJ.filter(function(e){return e.o.indexOf(r.obj[0])>-1}).slice(0,4).map(function(e){return {n:e.n,s:3,r:12}});
  var all=store.get('asig',{});all[c[0]]={r:r.n,ej:ej};store.set('asig',all);lista(ej);msg('#ok-as','Rutina "'+r.n+'" asignada a '+c[0]+'.',true)};
 $('#b-gs').onclick=function(){
  var ej=[],bad=false;
  document.querySelectorAll('#as-l li').forEach(function(li){
   var s=parseInt(li.querySelector('.in-s').value,10),r=parseInt(li.querySelector('.in-r').value,10);
   if(!(s>=1&&s<=6&&r>=1&&r<=30))bad=true;ej.push({n:li.getAttribute('data-n'),s:s,r:r})});
  if(bad){msg('#ok-as','Series entre 1 y 6 y repeticiones entre 1 y 30.',false);return}
  var all=store.get('asig',{});all[c[0]].ej=ej;store.set('asig',all);msg('#ok-as','Cambios guardados en la rutina de '+c[0]+'.',true)};
 pintaHilo('#hilo-e');
 $('#b-msg').onclick=function(){
  var t=$('#msg').value.trim();
  if(!t){msg('#ok-msg','Escribe un comentario antes de enviarlo.',false);return}
  var h=store.get('hilo',[]);h.push({de:'entrenador',txt:t});store.set('hilo',h);$('#msg').value='';pintaHilo('#hilo-e');msg('#ok-msg','Comentario enviado a '+c[0]+'.',true)};
}
function lista(ej){
 var ul=$('#as-l');ul.innerHTML='';$('#b-gs').hidden=!ej.length;
 ej.forEach(function(e,i){
  var li=document.createElement('li');li.setAttribute('data-n',e.n);
  li.innerHTML='<span><b></b></span><label class="sm">Series<input class="in-s" type="number" min="1" max="6" value="'+e.s+'"></label><label class="sm">Reps<input class="in-r" type="number" min="1" max="30" value="'+e.r+'"></label><button class="btn alt" type="button">Quitar</button>';
  li.querySelector('b').textContent=e.n;
  li.querySelector('button').setAttribute('aria-label','Quitar '+e.n);
  li.querySelector('button').onclick=function(){li.remove();$('#b-gs').hidden=!$('#as-l li');msg('#ok-as','Ejercicio quitado. Guarda los cambios para confirmarlo.',true)};
  ul.appendChild(li)});
}
$('#d-x').addEventListener('click',function(){$('#dlg').close()});

/* Acceso: iniciar sesión y crear cuenta (US07) */
function entrar(u){
 store.set('rol',u.rol);store.set('usuario',u.nombre);store.set('mail',u.mail);saludo();
 location.hash='#'+MENU[u.rol][0][0];ir();
}
$('#f-login').addEventListener('submit',function(e){
 e.preventDefault();
 var m=$('#mail').value.trim().toLowerCase(),p=$('#pass').value,ok=true;
 $('#e-mail').textContent='';$('#e-pass').textContent='';$('#e-login').textContent='';
 if(!m){$('#e-mail').textContent='El correo es obligatorio.';ok=false}
 else if(!okRe.test(m)){$('#e-mail').textContent='Ingresa un correo válido.';ok=false}
 if(!p){$('#e-pass').textContent='La contraseña es obligatoria.';ok=false}
 if(!ok)return;
 var u=usuarios().filter(function(x){return x.mail===m&&x.pass===p})[0];
 if(!u){$('#e-login').textContent='Correo o contraseña incorrectos.';return}
 $('#pass').value='';entrar(u);
});
$('#f-reg').addEventListener('submit',function(e){
 e.preventDefault();
 var n=$('#r-nom').value.trim(),m=$('#r-mail').value.trim().toLowerCase(),p=$('#r-pass').value,ok=true;
 ['nom','mail','pass'].forEach(function(k){$('#e-r-'+k).textContent=''});
 if(n.length<2){$('#e-r-nom').textContent='Ingresa tu nombre.';ok=false}
 if(!okRe.test(m)){$('#e-r-mail').textContent='Ingresa un correo válido.';ok=false}
 else if(usuarios().some(function(x){return x.mail===m})){$('#e-r-mail').textContent='Ese correo ya tiene una cuenta.';ok=false}
 if(p.length<6){$('#e-r-pass').textContent='La contraseña debe tener al menos 6 caracteres.';ok=false}
 if(!ok)return;
 var u={mail:m,pass:p,nombre:n,rol:document.querySelector('input[name=rrol]:checked').value},l=usuarios();l.push(u);store.set('usuarios',l);
 this.reset();entrar(u);
});
$('#ver-pass').onclick=function(){
 var t=$('#pass').type==='password';$('#pass').type=t?'text':'password';
 this.textContent=t?'Ocultar contraseña':'Mostrar contraseña';this.setAttribute('aria-pressed',t)};
function saludo(){$('#saludo').textContent='Hola, '+store.get('usuario','invitado')}
document.querySelectorAll('[data-ir]').forEach(function(b){
 b.onclick=function(){document.querySelector('input[name=rrol][value='+b.getAttribute('data-ir')+']').checked=true;location.hash='#acceso'}});

/* Landing: solicitud de información */
$('#f-cont').addEventListener('submit',function(e){
 e.preventDefault();
 var reglas=[['nom','Ingresa tu nombre completo.',function(v){return v.length>=3}],
  ['mail','Ingresa un correo electrónico válido.',function(v){return okRe.test(v)}],
  ['cel','Ingresa un celular de 9 dígitos.',function(v){return /^\d{9}$/.test(v)}],
  ['msj','Cuéntanos qué necesitas (mínimo 10 caracteres).',function(v){return v.length>=10}]],ok=true,primero=null;
 $('#ok-cont').textContent='';
 reglas.forEach(function(x){
  var i=$('#c-'+x[0]),mal=!x[2](i.value.trim());
  $('#e-c-'+x[0]).textContent=mal?x[1]:'';i.setAttribute('aria-invalid',mal);
  if(mal){ok=false;primero=primero||i}});
 if(!ok){primero.focus();return}
 $('#ok-cont').textContent='¡Gracias! Recibimos tu solicitud y te responderemos pronto (simulado).';this.reset();
});

usuarios();saludo();sugerir();ir();
})();
