import {describe,it,expect,beforeEach,afterAll,vi} from 'vitest';
import {randomUUID} from 'node:crypto';
import {pool} from '../src/integrations/config.js';
import {reserve,finish,coordination,permit,fromPermit,recover} from '../src/integrations/coordinator.js';
import {retrieve} from '../src/integrations/knowledge.js';
import {Sessions} from '../src/integrations/sessions.js';
const enabled=process.env.CYBERSIM_TEST_DATABASE==='1';
describe.skipIf(!enabled)('Contrato con PostgreSQL aislado',()=>{
 beforeEach(async()=>{
  await pool.query('UPDATE coordinacion_integracion SET activa=NULL,esperando=NULL,revision_id=NULL,pausada=false,generacion=1');
  await pool.query('DELETE FROM operacion_integracion');await pool.query('DELETE FROM revision_indice_conocimiento');await pool.query('DELETE FROM documento_conocimiento');
  vi.unstubAllGlobals();
 });
 afterAll(async()=>{vi.unstubAllGlobals();await pool.end();});
 it('admite una activa, una espera y rechaza la tercera; indexación cede',async()=>{
  const a=await reserve('chat','system:a',randomUUID(),{});
  const waiting=reserve('analysis','system:b',randomUUID(),{});
  while(!(await coordination()).esperando)await new Promise(r=>setTimeout(r,10));
  await expect(reserve('chat','system:c',randomUUID(),{})).rejects.toMatchObject({code:'QUEUE_FULL'});
  await expect(reserve('index','system:index',randomUUID(),{})).rejects.toMatchObject({code:'YIELD'});
  await finish(a.id);
  const b=await waiting;expect(b.estado).toBe('activa');await finish(b.id);
 });
 it('deduplica request ID sin repetir inferencias',async()=>{
  const id=randomUUID();const op=await reserve('chat','system:a',id,{text:'one'});
  await expect(reserve('chat','system:a',id,{text:'one'})).rejects.toMatchObject({code:'RESULT_NOT_REPLAYABLE'});
  await expect(reserve('chat','system:a',id,{text:'two'})).rejects.toMatchObject({code:'REQUEST_ID_CONFLICT'});
  await finish(op.id);
 });
 it('un deadline vencido no confirma efectos',async()=>{
  const op=await reserve('chat','system:a',randomUUID(),{});
  await pool.query("UPDATE operacion_integracion SET deadline=now()-interval '1 second' WHERE id=$1",[op.id]);
  const effect=vi.fn();
  await expect(finish(op.id,'completada',effect)).rejects.toMatchObject({code:'DEADLINE'});
  expect(effect).not.toHaveBeenCalled();await finish(op.id,'fallida');
 });
 it('una hija viva y un reinicio mantienen el turno incierto',async()=>{
  const op=await reserve('chat','system:a',randomUUID(),{});
  await pool.query('UPDATE operacion_integracion SET hija=$2 WHERE id=$1',[op.id,JSON.stringify({id:'provider',status:'running'})]);
  await finish(op.id);expect((await coordination()).activa).toBe(op.id);
  await recover();
  await expect(reserve('chat','system:b',randomUUID(),{})).rejects.toMatchObject({code:'OPERATION_UNCERTAIN'});
 });
 it('rechaza un permiso anterior al reset/generación sin crear una operación',async()=>{
  const op=await reserve('chat','system:a',randomUUID(),{});const token=permit(op);
  await pool.query('UPDATE coordinacion_integracion SET installation_id=$1,generacion=generacion+1',[randomUUID()]);
  await expect(fromPermit(token)).rejects.toMatchObject({code:'STALE_OPERATION'});
  expect((await pool.query('SELECT count(*)::int n FROM operacion_integracion')).rows[0].n).toBe(1);
 });
 it('usa la colección/modelo capturados aunque se publique otra revisión durante embedding',async()=>{
  const c=await coordination(),old=randomUUID(),next=randomUUID();
  const signature={pipeline:'markdown-500-800-75-v1',dimensions:1536,model:'text-embedding-3-small'};
  await pool.query("INSERT INTO revision_indice_conocimiento(id,installation_id,firma,colecciones,calibracion,estado) VALUES($1,$2,$3,$4,$5,'publicada')",[old,c.installation_id,JSON.stringify(signature),JSON.stringify({conocimiento:'original'}),JSON.stringify({conocimiento:0.1})]);
  await pool.query("INSERT INTO revision_indice_conocimiento(id,installation_id,firma,colecciones,estado) VALUES($1,$2,$3,$4,'preparacion')",[next,c.installation_id,JSON.stringify(signature),JSON.stringify({conocimiento:'new'})]);
  await pool.query('UPDATE coordinacion_integracion SET revision_id=$1',[old]);
  await pool.query("INSERT INTO documento_conocimiento(id,origen,revision,hash,tipo,estado) VALUES('d','versionado','1','h','conocimiento','valido')");
  const op=await reserve('chat','system:a',randomUUID(),{});const urls:string[]=[];
  process.env.OPENAI_API_KEY='local-mock-only';
  vi.stubGlobal('fetch',vi.fn(async(input:string)=>{
   urls.push(input);
   if(input.includes('api.openai.com')){
    await pool.query('UPDATE coordinacion_integracion SET revision_id=$1',[next]);
    return Response.json({data:[{embedding:Array(1536).fill(0.1)}],usage:{}});
   }
   return Response.json({result:{points:[{id:'citation',score:0.8,payload:{document:'d',hash:'h',text:'firewall',revision:old}}]}});
  }));
  const result=await retrieve(op,'conocimiento','firewall');expect(result).toHaveLength(1);
  expect(urls.some(u=>u.includes('/collections/original/'))).toBe(true);
  expect(urls.some(u=>u.includes('/collections/new/'))).toBe(false);
  await pool.query("UPDATE documento_conocimiento SET estado='retirado' WHERE id='d'");
  const effect=vi.fn();await expect(finish(op.id,'completada',effect)).rejects.toMatchObject({code:'SOURCE_WITHDRAWN'});expect(effect).not.toHaveBeenCalled();
  delete process.env.OPENAI_API_KEY;
 });
});
describe('Historial temporal y propiedad',()=>{
 it('aísla usuarios y avisa al perder el epoch',()=>{
  const sessions=new Sessions();const first=sessions.create(1);
  expect(()=>sessions.get(first.sessionId,first.memoryEpoch,2)).toThrow();
  expect(()=>new Sessions().get(first.sessionId,first.memoryEpoch,1)).toThrow('Se perdió el contexto');
 });
 it('caduca al acceder y no expulsa una sesión activa',()=>{
  let now=0;const sessions=new Sessions(()=>now);const first=sessions.create(1);
  sessions.get(first.sessionId,first.memoryEpoch,1).busy=true;now=3600001;
  expect(sessions.get(first.sessionId,first.memoryEpoch,1)).toBeDefined();
  sessions.get(first.sessionId,first.memoryEpoch,1).busy=false;
  now+=3600001;expect(()=>sessions.get(first.sessionId,first.memoryEpoch,1)).toThrow();
 });
});

