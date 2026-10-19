import {assertRound} from './drive-round.js';
import { randomUUID, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat, statfs } from 'node:fs/promises';
import path from 'node:path';
import { pool, locked, object, httpJson, ServiceError, repositoryRoot } from './config.js';
import { coordination, reserve, finish, assertCurrent, type Operation } from './coordinator.js';
import { embeddings, tokens } from './model.js';
import { getEncoding } from 'js-tiktoken';

const encoding=getEncoding('o200k_base');
const types=['conocimiento','contexto','topologias','desafios'];
const cache=process.env.KNOWLEDGE_CACHE_DIR||path.resolve('.dev/knowledge');
export const signature=()=>({model:process.env.OPENAI_EMBEDDING_MODEL||'text-embedding-3-small',dimensions:1536,pipeline:'markdown-500-800-75-v1'});
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const file=(key:string)=>path.join(cache,hash(key)+'.json');
async function save(key:string,value:unknown){await mkdir(cache,{recursive:true});await writeFile(file(key),JSON.stringify(value),{mode:0o600});}
async function load(key:string):Promise<unknown>{return JSON.parse(await readFile(file(key),'utf8'));}
export interface Doc {id:string;type:string;content:string;revision:string;data?:unknown;source?:string}
interface Revision {id:string;installation_id:string;firma:Record<string,unknown>;colecciones:Record<string,string>;inventario:Record<string,unknown>;calibracion:Record<string,unknown>;estado:string}
export async function qdrant(p:string,body?:unknown,method?:string):Promise<Record<string,unknown>>{
 return object(await httpJson((process.env.QDRANT_URL||'http://localhost:6333')+p,{method:method|| (body?'POST':'GET'),headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})},10000));
}
export function chunks(text:string):string[]{
 const paragraphs=text.replace(/\r\n/g,'\n').split(/\n\s*\n/);
 const result:string[]=[];let current='';
 for(const paragraph of paragraphs){
  if(current&&tokens(current+'\n\n'+paragraph)>500){result.push(current);current='';}
  const ids=encoding.encode(paragraph);
  if(ids.length>800){if(current){result.push(current);current='';}for(let i=0;i<ids.length;i+=725)result.push(encoding.decode(ids.slice(i,i+800)));}
  else current=current?current+'\n\n'+paragraph:paragraph;
 }
 if(current)result.push(current);return result.filter(t=>t.trim());
}
export async function storeDoc(value:unknown):Promise<void>{
 const d=object(value) as unknown as Doc;
 if(d.source==='drive')await assertRound(object(value).syncPermit);
 if(typeof d.id!=='string'||!d.id||d.id.length>300||!types.includes(d.type)||typeof d.content!=='string'||!d.content.trim()||Buffer.byteLength(d.content)>1048576||d.content.includes('\u0000')||d.content.includes('\uFFFD')||Buffer.byteLength(JSON.stringify(d.data||{}))>1048576)
  throw new ServiceError('INVALID_DOCUMENT',422);
 const digest=hash({content:d.content,data:d.data,signature:signature()});
 await save('document:'+digest,d);
 const total=await pool.query<{bytes:string}>("SELECT coalesce(sum((metadata->>'bytes')::bigint),0)::text bytes FROM documento_conocimiento WHERE estado='valido' AND id<>$1",[d.id]);
 if(Number(total.rows[0].bytes)+Buffer.byteLength(d.content)>52428800)throw new ServiceError('CORPUS_LIMIT',413);
 await locked(async client=>{
 if(d.source==='drive')await assertRound(object(value).syncPermit,client);
 await client.query(`INSERT INTO documento_conocimiento(id,origen,revision,hash,tipo,estado,metadata)
  VALUES($1,$2,$3,$4,$5,'valido',$6) ON CONFLICT(id) DO UPDATE SET revision=$3,hash=$4,tipo=$5,estado='valido',retirado_en=NULL,confirmaciones=0,metadata=$6,observado_en=now()`,
  [d.id,d.source||'versionado',d.revision,digest,d.type,JSON.stringify({bytes:Buffer.byteLength(d.content),cache:digest})]);
 });
}
export async function withdraw(id:string,reason:string,syncPermit?:unknown):Promise<void>{
 await locked(async c=>{
  if(syncPermit)await assertRound(syncPermit,c);
  await c.query("UPDATE documento_conocimiento SET estado='retirado',retirado_en=now(),metadata=metadata||$2::jsonb WHERE id=$1",[id,JSON.stringify({reason})]);
  await c.query('UPDATE coordinacion_integracion SET exclusiones_version=exclusiones_version+1 WHERE id=1');
 });
}
export async function inventory(value:unknown):Promise<{download:unknown[];round:string}>{
 const body=object(value);
 await assertRound(body.syncPermit);
 if(body.complete!==true||body.incompleteSearch===true||!Array.isArray(body.files)||body.folderAccessible!==true)throw new ServiceError('INCOMPLETE_INVENTORY',409);
 const round=randomUUID();const files=body.files.map(object);const ids=new Set(files.map(f=>'drive:'+f.id));
 const known=await pool.query<{id:string;revision:string;estado:string;confirmaciones:number;observado_en:Date}>("SELECT * FROM documento_conocimiento WHERE origen='drive'");
 const download=files.filter(f=>/\.(txt|md|markdown)$/i.test(String(f.name))).filter(f=>{
  const old=known.rows.find(d=>d.id==='drive:'+f.id);
  return !old||old.revision!==String(f.version||f.modifiedTime)||old.estado!=='valido';
 });
 for(const old of known.rows) {
  if(ids.has(old.id)){await pool.query('UPDATE documento_conocimiento SET confirmaciones=0,ronda=$2,observado_en=now() WHERE id=$1',[old.id,round]);continue;}
  // A missing list item alone is never sufficient. n8n must provide an individual probe.
  const probes=Array.isArray(body.probes)?body.probes.map(object):[];
  const probe=probes.find(p=>'drive:'+p.id===old.id);
  if(!probe||!['trashed','moved','inaccessible'].includes(String(probe.confirmed)))continue;
  if(probe.confirmed==='trashed'||probe.confirmed==='moved')await withdraw(old.id,String(probe.confirmed),body.syncPermit);
  else if(Date.now()-old.observado_en.getTime()>=60000){
   if(old.confirmaciones>=1)await withdraw(old.id,'confirmed_access_loss',body.syncPermit);
   else await pool.query('UPDATE documento_conocimiento SET confirmaciones=confirmaciones+1,observado_en=now() WHERE id=$1',[old.id]);
  }
 }
 for(const f of download){
  await pool.query(`INSERT INTO documento_conocimiento(id,origen,revision,hash,tipo,estado,metadata)
   VALUES($1,'drive',$2,'pending','conocimiento','pendiente',$3)
   ON CONFLICT(id) DO UPDATE SET estado='pendiente'`,['drive:'+f.id,String(f.version||f.modifiedTime),JSON.stringify({name:String(f.name),bytes:Number(f.size||0)})]);
 }
 for(const probe of (Array.isArray(body.probes)?body.probes.map(object):[]))
  if(['trashed','moved'].includes(String(probe.confirmed)))await withdraw('drive:'+probe.id,String(probe.confirmed),body.syncPermit);
 await save('drive-status',{lastSuccess:new Date().toISOString(),round});
 return {download,round};
}
async function revision(id:string):Promise<Revision>{
 const result=await pool.query<Revision>('SELECT * FROM revision_indice_conocimiento WHERE id=$1',[id]);
 if(!result.rows[0])throw new ServiceError('REVISION_MISSING');return result.rows[0];
}
interface Work {doc:string;hash:string;type:string;position:number;text:string;data?:unknown}
export async function prepareRevision():Promise<Revision|null>{
 const c=await coordination();
 const pending=await pool.query("SELECT 1 FROM documento_conocimiento WHERE estado='pendiente' LIMIT 1");
 if(pending.rowCount)throw new ServiceError('DOCUMENTS_PENDING');
 const docs=(await pool.query<{id:string;hash:string;tipo:string}>("SELECT id,hash,tipo FROM documento_conocimiento WHERE estado='valido' ORDER BY id")).rows;
 if(!types.every(t=>docs.some(d=>d.tipo===t)))throw new ServiceError('BASELINE_INCOMPLETE');
 const inventoryHash=hash({docs,signature:signature()});
 const existing=await pool.query<Revision>("SELECT * FROM revision_indice_conocimiento WHERE installation_id=$1 AND estado IN ('preparacion','publicada') ORDER BY creado_en DESC",[c.installation_id]);
 if(existing.rows[0]?.inventario.hash===inventoryHash)return existing.rows[0].estado==='publicada'?null:existing.rows[0];
 for(const stale of existing.rows.filter(r=>r.estado==='preparacion')){
  for(const name of Object.values(stale.colecciones))await qdrant('/collections/'+name,undefined,'DELETE');
  await pool.query('DELETE FROM revision_indice_conocimiento WHERE id=$1',[stale.id]);
 }
 const revisions=(await pool.query<Revision>("SELECT * FROM revision_indice_conocimiento WHERE installation_id=$1 ORDER BY creado_en DESC",[c.installation_id])).rows;
 for(const stale of revisions.slice(2)){
  const refs=await pool.query("SELECT 1 FROM operacion_integracion WHERE revision_id=$1 AND estado IN ('activa','esperando','incierta')",[stale.id]);
  if(refs.rowCount)throw new ServiceError('REVISION_IN_USE',409);
  for(const name of Object.values(stale.colecciones))await qdrant('/collections/'+name,undefined,'DELETE');
  await pool.query('DELETE FROM revision_indice_conocimiento WHERE id=$1',[stale.id]);
 }
 const id=randomUUID();const cols=Object.fromEntries(types.map(t=>[t,'cs_'+c.installation_id.replaceAll('-','')+'_'+id.replaceAll('-','')+'_'+t]));
 const work:Work[]=[];
 for(const d of docs){
  const source=object(await load('document:'+d.hash));
  const content=String(source.content);const parts=['topologias','desafios'].includes(d.tipo)?[encoding.decode(encoding.encode(content).slice(0,800))]:chunks(content);
  parts.forEach((text,position)=>work.push({doc:d.id,hash:d.hash,type:d.tipo,position,text,data:source.data}));
 }
 for(const name of Object.values(cols))await qdrant('/collections/'+name,{vectors:{size:1536,distance:'Cosine',on_disk:true},on_disk_payload:true},'PUT');
 await save('work:'+id,work);
 await pool.query(`INSERT INTO revision_indice_conocimiento(id,installation_id,firma,colecciones,inventario)
 VALUES($1,$2,$3,$4,$5)`,[id,c.installation_id,JSON.stringify(signature()),JSON.stringify(cols),JSON.stringify({hash:inventoryHash,offset:0,total:work.length,docs})]);
 return revision(id);
}
async function vector(op:Operation,text:string):Promise<number[]>{
 const key='vector:'+hash({signature:signature(),text});
 try{return await load(key) as number[];}catch{
  const result=(await embeddings(op,[text]))[0];await save(key,result);return result;
 }
}
export async function indexUnit():Promise<Record<string,unknown>>{
 if(!process.env.OPENAI_API_KEY)throw new ServiceError('CONFIG_OPENAI_API_KEY');
 await mkdir(cache,{recursive:true});const space=await statfs(cache);
 if(Number(space.bavail)*Number(space.bsize)<2147483648)throw new ServiceError('DISK_LOW');
 const op=await reserve('index','system:index',randomUUID(),{tick:Date.now()});
 try {
  const r=await prepareRevision();if(!r){await finish(op.id);return {state:'current'};}
  const work=await load('work:'+r.id) as Work[];
  let offset=Number(r.inventario.offset);
  if(offset<work.length){
   const item=work[offset];const v=await vector(op,item.text);
   const h=hash({doc:item.doc,hash:item.hash,position:item.position});const uuid=h.slice(0,8)+'-'+h.slice(8,12)+'-4'+h.slice(13,16)+'-a'+h.slice(17,20)+'-'+h.slice(20,32);
   await qdrant('/collections/'+r.colecciones[item.type]+'/points?wait=true',{points:[{id:uuid,vector:v,payload:{document:item.doc,hash:item.hash,text:item.text,data:item.data||null,revision:r.id,position:item.position}}]},'PUT');
   offset++;
   await pool.query('UPDATE revision_indice_conocimiento SET inventario=jsonb_set(inventario,\'{offset}\',$2::jsonb) WHERE id=$1',[r.id,String(offset)]);
   await finish(op.id);return {state:'indexing',offset,total:work.length};
  }
  // Explicit calibration dataset, evaluated with the revision's own embeddings.
  const fixtures=JSON.parse(await readFile(path.join(repositoryRoot,'knowledge/calibration.json'),'utf8')) as Record<string,{query:string;positive:boolean}[]>;
  for(const type of types){
   if(r.calibracion[type])continue;
   const values=fixtures[type];if(!values||values.filter(v=>v.positive).length<5||values.filter(v=>!v.positive).length<5)throw new ServiceError('CALIBRATION_DATASET');
   const scores=Array.isArray(r.calibracion[type+':scores'])?r.calibracion[type+':scores'] as {score:number;positive:boolean}[]:[];
   const next=values[scores.length];
   if(next){
    const v=await vector(op,next.query);
    const result=await qdrant('/collections/'+r.colecciones[type]+'/points/query',{query:v,limit:1});
    const points=object(result.result).points as {score:number}[];
    scores.push({score:points[0]?.score??-1,positive:next.positive});
    await pool.query('UPDATE revision_indice_conocimiento SET calibracion=calibracion||$2::jsonb WHERE id=$1',[r.id,JSON.stringify({[type+':scores']:scores})]);
    await finish(op.id);return {state:'calibrating',type,count:scores.length};
   }
   const negative=Math.max(...scores.filter(s=>!s.positive).map(s=>s.score));const threshold=negative+0.000001;
   if(scores.filter(s=>s.positive&&s.score>=threshold).length/scores.filter(s=>s.positive).length<0.8)throw new ServiceError('CALIBRATION_FAILED_'+type);
   await pool.query('UPDATE revision_indice_conocimiento SET calibracion=calibracion||$2::jsonb WHERE id=$1',[r.id,JSON.stringify({[type]:threshold})]);
   await finish(op.id);return {state:'calibrated',type};
  }
  await locked(async client=>{
   await assertCurrent(op.id,client);
   const c=await coordination(client);
   const current=(await client.query<{id:string;hash:string;tipo:string}>("SELECT id,hash,tipo FROM documento_conocimiento WHERE estado='valido' ORDER BY id")).rows;
   if(hash({docs:current,signature:signature()})!==r.inventario.hash)throw new ServiceError('STAGING_CHANGED',409);
   if(c.installation_id!==r.installation_id)throw new ServiceError('STALE_REVISION',409);
   if(c.revision_id)await client.query("UPDATE revision_indice_conocimiento SET estado='retirada' WHERE id=$1",[c.revision_id]);
   await client.query("UPDATE revision_indice_conocimiento SET estado='publicada',publicado_en=now() WHERE id=$1",[r.id]);
   await client.query('UPDATE coordinacion_integracion SET revision_id=$1 WHERE id=1',[r.id]);
  });
  await finish(op.id);return {state:'published',revision:r.id};
 }catch(e){await finish(op.id,'fallida').catch(()=>{});throw e;}
}
export async function retrieve(op:Operation,type:string,query:string):Promise<Record<string,unknown>[]>{
 if(!types.includes(type)||!op.revision_id)throw new ServiceError('RAG_NOT_READY');
 await locked(async c=>{
  const current=await assertCurrent(op.id,c);const used=current.uso||{};
  if((used.tools||0)>=6)throw new ServiceError('TOOL_LIMIT',422);
  await c.query('UPDATE operacion_integracion SET uso=uso||$2::jsonb WHERE id=$1',[op.id,JSON.stringify({tools:(used.tools||0)+1})]);
 });
 const r=await revision(op.revision_id);
 if(hash(r.firma)!==hash(signature()))throw new ServiceError('EMBEDDING_SIGNATURE_MISMATCH');
 const v=(await embeddings(op,[query]))[0];
 const result=await qdrant('/collections/'+r.colecciones[type]+'/points/query',{query:v,limit:20,with_payload:true,score_threshold:r.calibracion[type]});
 const points=object(result.result).points;
 if(!Array.isArray(points))throw new ServiceError('RAG_RESPONSE');
 const accepted:Record<string,unknown>[]=[];let count=0;
 for(const p of points){
  const row=object(p);const payload=object(row.payload);
  const doc=await pool.query("SELECT 1 FROM documento_conocimiento WHERE id=$1 AND estado='valido' AND hash=$2",[payload.document,payload.hash]);
  if(!doc.rowCount)continue;
  const cost=tokens(payload.text);
  if(count+cost>4000||accepted.length>=8)break;
  count+=cost;accepted.push({...payload,citation:String(row.id)});
 }
 const selected=type==='topologias'?accepted.slice(0,1):type==='desafios'?accepted.slice(0,3):accepted;
 await pool.query("UPDATE operacion_integracion SET resultado_ref=jsonb_build_object('sources',coalesce(resultado_ref->'sources','[]'::jsonb)||$2::jsonb) WHERE id=$1",
  [op.id,JSON.stringify(selected.map(s=>({document:s.document,hash:s.hash})))]);
 return selected;
}
export async function ensureSources(sources:Record<string,unknown>[]):Promise<void>{
 for(const s of sources){
  const found=await pool.query("SELECT 1 FROM documento_conocimiento WHERE id=$1 AND hash=$2 AND estado='valido'",[s.document,s.hash]);
  if(!found.rowCount)throw new ServiceError('SOURCE_WITHDRAWN',409);
 }
}
export async function diskAvailable():Promise<boolean>{
 try {await mkdir(cache,{recursive:true});await stat(cache);return true;}catch{return false;}
}

