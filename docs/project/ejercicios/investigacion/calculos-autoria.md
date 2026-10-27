# Cálculos inertes de control del padre

Lectura de los documentos finales,26-10-2026. Node24.22.1, OpenSSL3.5.9, SQLite integrado3.53.4. Solo memoria/lectura: no instala dependencias, no toca código de aplicación ni datos externos. Desde raíz, ejecutar el bloque por stdin de Node; requiere node:sqlite y crypto. Los modelos TA/AL/NA son **abstracciones de autor**, no implementaciones del laboratorio ni pruebas independientes de validez.

Resultados observados: AP7roundtrips/11rechazos; NA7vectores/S08 y126transiciones,6B/Q y3B/Q/C; TA20checks; AL36transiciones; BV3queries. El modelo NA colapsa validadores seguros por respuesta al catálogo: no prueba toda la gramática/esquema. TA observa admisión y publicación, no implementa inventario/cuarentena. AL no incluye red/mantenimiento. BV no ejecuta el adaptador de navegador.

```javascript
const fs=require('node:fs'),c=require('node:crypto'),a=require('node:assert/strict'),B=String.fromCharCode(96);
const read=p=>fs.readFileSync('docs/project/ejercicios/'+p,'utf8'),codes=l=>[...l.matchAll(new RegExp(B+'([^'+B+']*)'+B,'g'))].map(m=>m[1]);
const ap=read('cwe-321-andinapay.md'),na=read('cwe-502-nubeandina.md'),ta=read('cwe-434-talentoandino.md');const keys={},plains={};
for(const l of ap.split('\n')){let m=l.match(/^\| (K1|K2|KI) \//);if(m)keys[m[1]]=Buffer.from(codes(l)[1],'hex');m=l.match(/^\| (R\d+)[^|]*\|/);if(m&&codes(l)[0]?.startsWith('{'))plains[m[1]]=codes(l)[0];}
let apPass=0,apReject=0;for(const l of ap.split('\n').filter(x=>/^\| R\d+\/K/.test(x))){const id=l.match(/R\d+/)[0],k=l.match(/\/(K1|K2|KI)\//)[1],v=codes(l);const dec=(key,tag)=>{const d=c.createDecipheriv('aes-256-gcm',key,Buffer.from(v[0],'hex'));d.setAAD(Buffer.from(v[1].replace(/\\\|/g,'|')));d.setAuthTag(tag);return Buffer.concat([d.update(Buffer.from(v[2],'hex')),d.final()]).toString();};a.equal(dec(keys[k],Buffer.from(v[3],'hex')),plains[id]);apPass++;const t=Buffer.from(v[3],'hex');t[0]^=1;a.throws(()=>dec(keys[k],t));apReject++;if(k!=='K1'){a.throws(()=>dec(keys.K1,Buffer.from(v[3],'hex')));apReject++;}}a.equal(apPass,7);
const kh=na.match(new RegExp('hex\\s+'+B+'((?:a1)+)'+B))[1];a.equal(kh.length,64);const f=[];
for(let i=1;i<=6;i++){const j=na.match(new RegExp('\\*\\*S0'+i+'\\*\\*\\s+'+B.repeat(3)+'json\\s+([^\\r\\n]+)'))[1];f.push(JSON.parse(j));}f.push({...f[0],note:'X'.repeat(2500)});const macs=[];
for(let i=0;i<7;i++){const id='S0'+(i+1),row=na.split('\n').find(x=>x.startsWith('| '+id+' |')&&/\| \d+ \|/.test(x)),v=codes(row),j=JSON.stringify(f[i]);a.equal(Buffer.byteLength(j),Number(row.split('|')[2].trim()));a.equal(c.createHash('sha256').update(j).digest('hex'),v[0]);const mac=c.createHmac('sha256',Buffer.from(kh,'hex')).update('NA1|session|org-7|'+Buffer.from(j).toString('base64')).digest('hex');a.equal(mac,v[1]);macs.push(mac);}
const altered=Buffer.from(macs[0],'hex');altered[0]^=1;a(na.includes(altered.toString('hex')));
const initial=()=>({principal:'org-7',sessionOwner:'org-7',role:'organizer',filters:{track:'infra',pageSize:20},template:'basic',theme:'light',restarts:0,config:'clean'});
const valid=o=>o.type==='WorkspaceSession'&&o.owner==='org-7'&&o.expiresAt==='2026-10-20T11:00:00Z'&&!('role'in o)&&!('note'in o)&&o.extensions.every(x=>x.type==='PassiveNote');
function restore(n,commit,i,fault=false){const st=initial(),o=f[Math.min(i,6)],before=JSON.stringify(st);if([3,4,6].includes(n)){if(i>=2)return{ok:false,st,before};if(fault){if(commit==='eager')st.filters=structuredClone(o.filters);return{ok:false,st,before};}Object.assign(st,{filters:structuredClone(o.filters),template:o.template,theme:o.preferences.theme});return{ok:true,st,before};}if(n===2&&(i===7||o.type!=='WorkspaceSession'))return{ok:false,st,before};
function walk(v){if(v&&typeof v==='object'){if(v.type==='RestoreHook'){st.restarts++;st.role='admin';st.config='dirty';}if(v.type==='WorkspaceSession'){st.sessionOwner=v.owner;st.filters=structuredClone(v.filters);st.template=v.template;st.theme=v.preferences.theme;if(v.role)st.role=v.role;}for(const x of Object.values(v))if(x&&typeof x==='object')walk(x);}}walk(o);return{ok:valid(o)&&Buffer.byteLength(JSON.stringify(o))<=2048&&!(n===1&&i===7),st,before};}
let transitions=0,bq=0,bqc=0;for(let n=0;n<=6;n++)for(const commit of ['eager','staged']){let goodB=true,goodQ=true;for(let i=0;i<8;i++){const r=restore(n,commit,i);transitions++;if(i<2)goodB&&=r.ok&&r.st.role==='organizer'&&r.st.filters.track===f[i].filters.track;else goodQ&&=!r.ok&&JSON.stringify(r.st)===r.before;}const z=restore(n,commit,1,true);transitions++;const goodC=!z.ok&&JSON.stringify(z.st)===z.before;if(goodB&&goodQ)bq++;if(goodB&&goodQ&&goodC)bqc++;}a.equal(bq,6);a.equal(bqc,3);
const rows=ta.split('\n').filter(x=>/^\| T\d\d \|/.test(x)).map(l=>l.split('|').slice(1,-1).map(x=>x.trim()));a.equal(rows.length,13);
function admit(r,V,L){const [id,fn,mime,profile,size,active]=r,field=fn.split(' / ')[0],ext=codes(fn)[0].split('.').at(-1).toLowerCase();if(V==='deny')return false;if(L&&Number(size)>(field==='cv'?5242880:2097152))return false;if(V===0)return true;if(V===1)return ['pdf','jpg','jpeg'].includes(ext)&&['application/pdf','image/jpeg'].includes(mime);return active==='no'&&(field==='cv'?ext==='pdf'&&profile==='PDF completo':['jpg','jpeg'].includes(ext)&&profile==='JPEG completo');}
let taChecks=0;for(const r of rows){a.equal(admit(r,2,true),r[6].startsWith('Admitir'));taChecks++;}a(admit(rows[3],1,true));a(admit(rows[5],2,false));a(!admit(rows[0],'deny',true));taChecks+=3;const pending=[];for(const S of ['S1','S2'])for(const P of ['P0','P1']){const served=(P==='P0'?'admitted':'pending')==='admitted';pending.push({S,P,served});a.equal(served,P==='P0');taChecks++;}
const roles=['anonymous','expired','tampered','customer','dispatcher','support'];let alChecks=0;for(const role of roles)for(const method of ['GET','POST'])for(const action of ['cancel','reassign','reset']){const st={status:'in_transit',route:'R1',credentialRevision:7},before=JSON.stringify(st);let code;if(method==='GET')code=405;else if(['anonymous','expired','tampered'].includes(role))code=401;else if((role==='dispatcher'&&action!=='reset')||(role==='support'&&action==='reset')){code=200;if(action==='cancel')st.status='cancelled';if(action==='reassign')st.route='R3';if(action==='reset')st.credentialRevision++;}else code=403;if(code!==200)a.equal(JSON.stringify(st),before);else a.equal(action==='reset'?st.credentialRevision:action==='cancel'?st.status:st.route,action==='reset'?8:action==='cancel'?'cancelled':'R3');alChecks++;}
const {DatabaseSync}=require('node:sqlite'),db=new DatabaseSync(':memory:'),bv=read('cwe-89-bibliotecaviva.md');const books=bv.split('\n').filter(x=>/^\| 1[0-3] \|/.test(x)).map(x=>x.split('|').slice(1,-1).map(z=>z.trim())),loans=bv.split('\n').filter(x=>/^\| 100[1-7] \|/.test(x)).map(x=>x.split('|').slice(1,-1).map(z=>z.trim()));a.equal(loans.length,7);db.exec('CREATE TABLE books(book_id INTEGER,title TEXT,author TEXT); CREATE TABLE loans(loan_id INTEGER,student_id TEXT,book_id INTEGER,loan_date TEXT)');for(const b of books)db.prepare('INSERT INTO books VALUES(?,?,?)').run(...b);for(const l of loans)db.prepare('INSERT INTO loans VALUES(?,?,?,?)').run(...l);
const query=bv.match(new RegExp(B.repeat(3)+'sql\\s+(SELECT l.loan_id[\\s\\S]*?)'+B.repeat(3)))[1].trim(),st=db.prepare(query),ids=(title,author,actor='S101')=>st.all({actor,title,author,date:''}).sort((x,y)=>x.loan_id-y.loan_id).slice(0,2).map(x=>x.loan_id);a.deepEqual(ids('redes',''),[1001,1003]);a.deepEqual(ids('',"O'Reilly"),[1002]);a.deepEqual(ids("')) > 0 OR 1=1 --",''),[]);const sqlVersion=db.prepare('SELECT sqlite_version() AS v').get().v;db.close();
console.log(JSON.stringify({ap:{roundtrips:apPass,rejections:apReject},na:{vectorsReadBack:7,tagMutation:1,abstractTransitions:transitions,BQ:bq,BQC:bqc},ta:{checks:taChecks,pending},al:{selectedTransitions:alChecks},bv:{selectedQueries:3,sqlite:sqlVersion}},null,2));
```

Interpretación: se busca detectar contradicciones entre bytes, ejemplos y predicciones del diseño. Que un cálculo confirme nuestras reglas no establece que esas reglas midan comprensión ni que el futuro código las cumpla.

## Control adicional tras corregir TA

Ejecutado al reanudar:12trazas S1/S2×P0/P1×propietario/reclutador/visitante. Cada traza recibe T04, intenta recuperar antes de resolver, rechaza sin consumir contador final, recibe T01 y lo admite. Comprueba handles temporales distintos, revocación, conservación de contador, nuevo ID final y acceso permitido/denegado. El almacenamiento privado es una etiqueta de contexto: no se implementa ni prueba aquí un servidor HTTP. Es un modelo de estados adicional, no una carrera real ni prueba del runtime.

```javascript
const assert = require('node:assert/strict');
function fresh(storage, publication) {
  return {storage, publication, seq:1, next:100, temporary:{}, final:{}};
}
function receive(s, id) {
  const h='TA-PENDING-'+s.seq++;
  s.temporary[h]={id, owner:'candidato-1', status:s.publication==='P0'?'admitted':'pending'};
  return h;
}
function retrieve(s,h,actor) {
  const e=s.temporary[h]||s.final[h];
  return e&&e.status==='admitted'&&['candidato-1','reclutador-1'].includes(actor)?'TA:'+e.id:null;
}
function resolve(s,h,allowed) {
  const e=s.temporary[h]; assert(e);
  delete s.temporary[h];
  if(!allowed)return null;
  const id='TA-'+String(s.next++).padStart(4,'0');
  s.final[id]={...e,status:'admitted'};
  return id;
}
let traces=0;
for(const storage of ['S1','S2'])for(const publication of ['P0','P1'])
for(const actor of ['candidato-1','reclutador-1','visitante']){
  const s=fresh(storage,publication),h=receive(s,'T04');
  assert.equal(h,'TA-PENDING-1');
  assert.equal(s.next,100); assert.equal(Object.keys(s.final).length,0);
  assert.equal(retrieve(s,h,actor),publication==='P0'&&actor!=='visitante'?'TA:T04':null);
  assert.equal(resolve(s,h,false),null); assert.equal(retrieve(s,h,actor),null);
  assert.equal(s.next,100); assert.equal(Object.keys(s.final).length,0);
  const h2=receive(s,'T01'); assert.equal(h2,'TA-PENDING-2');
  const id=resolve(s,h2,true); assert.equal(id,'TA-0100'); assert.equal(s.next,101);
  assert.equal(retrieve(s,h2,actor),null);
  assert.equal(retrieve(s,id,actor),actor==='visitante'?null:'TA:T01');
  traces++;
}
console.log(JSON.stringify({TA_interleaved_traces:traces}));
```
