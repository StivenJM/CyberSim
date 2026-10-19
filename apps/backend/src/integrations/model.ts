import { randomUUID } from 'node:crypto';
import { getEncoding } from 'js-tiktoken';
import { locked, pool, required, object, ServiceError, fingerprint } from './config.js';
import { assertCurrent, uncertain, type Operation } from './coordinator.js';
import { tutorSchema, feedbackSchema, analysisSchema, scenarioSchema } from './contracts.js';
const encoding=getEncoding('o200k_base');
export const tokens=(value:unknown)=>encoding.encode(typeof value==='string'?value:JSON.stringify(value)).length;
const schemas={chat:tutorSchema,feedback:feedbackSchema,analysis:analysisSchema,scenario:scenarioSchema,index:null};
export async function provider(op:Operation, endpoint:'responses'|'embeddings', input:Record<string,unknown>, childId:string=randomUUID()):Promise<unknown> {
 const key=required('OPENAI_API_KEY');
 if(endpoint==='responses'&&Array.isArray(input.tools)){
  const names=['buscar_topologias','buscar_desafios','buscar_conocimiento','buscar_contexto'];
  for(const item of input.tools){const t=object(item);if(op.clase!=='scenario'||t.type!=='function'||!names.includes(String(t.name)))throw new ServiceError('TOOL_NOT_ALLOWED',403);}
 }
 const inputCount=tokens(input);
 const reservation=await locked(async c=>{
  const current=await assertCurrent(op.id,c);
  if(current.resultado_ref&&typeof current.resultado_ref==='object'){
   const sources=(current.resultado_ref as {sources?:{document:string;hash:string}[]}).sources||[];
   for(const source of sources){
    const valid=await c.query("SELECT 1 FROM documento_conocimiento WHERE id=$1 AND hash=$2 AND estado='valido'",[source.document,source.hash]);
    if(!valid.rowCount)throw new ServiceError('SOURCE_WITHDRAWN',409);
   }
  }
  if(current.hija?.status==='running')throw new ServiceError('CHILD_BUSY',409);
  if(current.hija?.id===childId||current.hija?.seen?.[childId])throw new ServiceError('CHILD_DUPLICATE',409);
  const used=current.uso||{};
  if((used.input||0)+inputCount>(op.clase==='chat'?12000:24000))throw new ServiceError('TOKEN_BUDGET',413);
  if(endpoint==='responses'&&(used.calls||0)>=(op.clase==='scenario'?3:1))throw new ServiceError('MODEL_ROUND_LIMIT',422);
  const ceiling={chat:1000,feedback:1500,analysis:4000,scenario:8000,index:0}[op.clase];
  const remaining=ceiling-(used.output||0);
  if(endpoint==='responses'&&remaining<=0)throw new ServiceError('TOKEN_BUDGET',413);
  const next={...used,input:(used.input||0)+inputCount,calls:(used.calls||0)+(endpoint==='responses'?1:0)};
  await c.query('UPDATE operacion_integracion SET hija=$2,uso=$3 WHERE id=$1',[op.id,JSON.stringify({id:childId,status:'running',hash:fingerprint(input),seen:{...current.hija?.seen,[childId]:fingerprint(input)}}),JSON.stringify(next)]);
  return remaining;
 });
 let response:Response;
 try{
  response=await fetch('https://api.openai.com/v1/'+endpoint,{
   method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify(endpoint==='embeddings'?{model:process.env.OPENAI_EMBEDDING_MODEL||'text-embedding-3-small',dimensions:1536,input:input.input}:
    {model:['analysis','scenario'].includes(op.clase)?process.env.OPENAI_COMPLEX_MODEL||'gpt-6.1-sol':process.env.OPENAI_TUTOR_MODEL||'gpt-6-luna',
     store:false,include:['reasoning.encrypted_content'],reasoning:{effort:['analysis','scenario'].includes(op.clase)?'low':'none'},parallel_tool_calls:false,
     max_output_tokens:reservation,input:input.messages,
     text:{format:{type:'json_schema',name:op.clase,strict:true,schema:schemas[op.clase]}},
     ...(op.clase==='scenario'?{tools:input.tools||[]}: {})}),
   signal:AbortSignal.timeout(Math.max(1,op.deadline.getTime()-Date.now()-2000))
  });
 }catch{await uncertain(op.id);throw new ServiceError('PROVIDER_UNCERTAIN',504);}
 if(response.status>=500){await uncertain(op.id);throw new ServiceError('PROVIDER_UNCERTAIN',502);}
 let data:Record<string,unknown>;
 try{data=object(await response.json());}catch{await uncertain(op.id);throw new ServiceError('PROVIDER_UNCERTAIN',502);}
 const usage=data.usage?object(data.usage):{};
 await locked(async c=>{
  await c.query(`UPDATE operacion_integracion SET hija=jsonb_set(hija,'{status}','"done"'),uso=uso || $2::jsonb,actualizado_en=now() WHERE id=$1`,
   [op.id,JSON.stringify({output:(op.uso?.output||0)+Number(usage.output_tokens||0)})]);
 });
 if(!response.ok)throw new ServiceError('PROVIDER_'+response.status,response.status===429?429:502);
 if(endpoint==='responses'&&data.status!=='completed')throw new ServiceError('MODEL_INCOMPLETE',502);
 return data;
}
export async function embeddings(op:Operation,texts:string[],childId?:string):Promise<number[][]>{
 if(texts.length>8||texts.reduce((n,t)=>n+tokens(t),0)>4000)throw new ServiceError('EMBEDDING_BATCH_LIMIT',413);
 const data=object(await provider(op,'embeddings',{input:texts},childId));
 if(!Array.isArray(data.data)||data.data.length!==texts.length)throw new ServiceError('EMBEDDING_RESPONSE',502);
 return data.data.map(row=>{
  const e=object(row).embedding;
  if(!Array.isArray(e)||e.length!==1536||e.some(v=>typeof v!=='number'||!Number.isFinite(v)))throw new ServiceError('EMBEDDING_DIMENSION',502);
  return e as number[];
 });
}
export function outputText(response:unknown):string{
 const rows=object(response).output;
 if(!Array.isArray(rows))throw new ServiceError('MODEL_OUTPUT',502);
 let text='';
 for(const row of rows){const r=object(row);if(r.type==='message'&&Array.isArray(r.content))for(const part of r.content){
  const p=object(part);if(p.type==='refusal')throw new ServiceError('MODEL_REFUSAL',422);if(p.type==='output_text')text+=String(p.text);
 }}
 return text;
}
export async function completedModel(op:Operation,messages:unknown[],childId?:string):Promise<unknown>{
 const response=await provider(op,'responses',{messages},childId);
 try{return JSON.parse(outputText(response));}catch(e){if(e instanceof ServiceError)throw e;throw new ServiceError('MODEL_JSON',502);}
}
export async function pruneOperations():Promise<void>{
 await pool.query("DELETE FROM operacion_integracion WHERE estado IN ('completada','cancelada','fallida') AND actualizado_en < now()-interval '7 days'");
}

