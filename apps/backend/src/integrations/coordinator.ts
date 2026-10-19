import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import jwt from 'jsonwebtoken';
import type { PoolClient } from 'pg';
import { pool, locked, ServiceError, fingerprint, required } from './config.js';

export type Kind = 'chat' | 'feedback' | 'analysis' | 'scenario' | 'index';
export interface Coordination {
 id: number; installation_id: string; generacion: number; pausada: boolean;
 activa: string | null; esperando: string | null; revision_id: string | null; exclusiones_version: number;
}
export interface Operation {
 id: string; installation_id: string; generacion: number; actor: string; request_id: string; clase: Kind;
 estado: string; deadline: Date; revision_id: string | null; huella: string;
 hija: { id: string; status: string; hash: string; seen?:Record<string,string> } | null; ejecucion_n8n: string | null;
 uso: Record<string, number>; resultado_ref: unknown;
}
export async function coordination(client: Pick<PoolClient, 'query'> = pool): Promise<Coordination> {
 const { rows } = await client.query<Coordination>('SELECT * FROM coordinacion_integracion WHERE id=1');
 if (!rows[0]) throw new ServiceError('RECONCILIATION_REQUIRED');
 return rows[0];
}
export async function operation(id: string, client: Pick<PoolClient, 'query'> = pool): Promise<Operation> {
 const { rows } = await client.query<Operation>('SELECT * FROM operacion_integracion WHERE id=$1', [id]);
 if (!rows[0]) throw new ServiceError('UNKNOWN_OPERATION', 409);
 return rows[0];
}
export async function assertCurrent(id: string, client: Pick<PoolClient, 'query'> = pool): Promise<Operation> {
 const c = await coordination(client); const op = await operation(id, client);
 if (op.installation_id !== c.installation_id || op.generacion !== c.generacion ||
     c.activa !== id || op.estado !== 'activa') throw new ServiceError('STALE_OPERATION', 409);
 if (Date.now() >= op.deadline.getTime()) throw new ServiceError('DEADLINE', 504);
 return op;
}
export async function reserve(kind: Kind, actor: string, requestId: string, body: unknown, signal?: AbortSignal, expectedInstallation?:string): Promise<Operation> {
 if (!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId)) throw new ServiceError('INVALID_REQUEST_ID', 400);
 const hash = fingerprint(body);
 const id = randomUUID();
 const initial = await locked(async client => {
  const c = await coordination(client);
  if(expectedInstallation&&c.installation_id!==expectedInstallation)throw new ServiceError('INSTALLATION_CHANGED',401);
  if (c.pausada) throw new ServiceError('MAINTENANCE');
  if (c.activa && (await operation(c.activa, client)).estado === 'incierta') throw new ServiceError('OPERATION_UNCERTAIN');
  const prior = await client.query<Operation>('SELECT * FROM operacion_integracion WHERE installation_id=$1 AND actor=$2 AND request_id=$3',[c.installation_id,actor,requestId]);
  if (prior.rows[0]) {
   if (prior.rows[0].huella !== hash) throw new ServiceError('REQUEST_ID_CONFLICT',409);
   throw new ServiceError('RESULT_NOT_REPLAYABLE',409);
  }
  if (kind === 'index' && (c.activa || c.esperando)) throw new ServiceError('YIELD',429);
  if (c.activa && c.esperando) throw new ServiceError('QUEUE_FULL',429);
  const state = c.activa ? 'esperando' : 'activa';
  const ms = kind === 'index' ? 60000 : ['analysis','scenario'].includes(kind) ? 300000 : 120000;
  await client.query(`INSERT INTO operacion_integracion
   (id,installation_id,generacion,actor,request_id,clase,estado,huella,deadline,revision_id)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[id,c.installation_id,c.generacion,actor,requestId,kind,state,hash,new Date(Date.now()+ms),c.revision_id]);
  await client.query(state === 'activa' ? 'UPDATE coordinacion_integracion SET activa=$1 WHERE id=1' : 'UPDATE coordinacion_integracion SET esperando=$1 WHERE id=1',[id]);
  return operation(id,client);
 });
 if (initial.estado === 'activa') return initial;
 while (true) {
  const op = await operation(id);
  if (op.estado === 'activa') return assertCurrent(id);
  if (op.estado !== 'esperando') throw new ServiceError('WAIT_CANCELLED',409);
  if (signal?.aborted || Date.now() >= op.deadline.getTime()) {
   await locked(async c => {
    await c.query("UPDATE operacion_integracion SET estado='cancelada' WHERE id=$1 AND estado='esperando'",[id]);
    await c.query('UPDATE coordinacion_integracion SET esperando=NULL WHERE id=1 AND esperando=$1',[id]);
   });
   throw new ServiceError('DEADLINE',504);
  }
  await sleep(150);
 }
}
export async function finish(id: string, state = 'completada', effect?: (c: PoolClient,op: Operation)=>Promise<unknown>): Promise<void> {
 await locked(async client => {
  const c = await coordination(client); const op = await operation(id,client);
  if (c.installation_id !== op.installation_id || c.generacion !== op.generacion || c.activa !== id) throw new ServiceError('STALE_OPERATION',409);
  if (op.estado === 'incierta') return;
  if (op.hija?.status === 'running') {
   await client.query("UPDATE operacion_integracion SET estado='incierta' WHERE id=$1",[id]); return;
  }
  if (state === 'completada' && Date.now() >= op.deadline.getTime()) throw new ServiceError('DEADLINE',504);
  if(state==='completada'&&/^\d+$/.test(op.actor)) {
   const actor=await client.query('SELECT 1 FROM usuario_auth WHERE id_usuario_auth=$1 AND confirmado=true',[Number(op.actor)]);
   if(!actor.rowCount)throw new ServiceError('STALE_ACTOR',403);
  }
  if(state==='completada'&&op.resultado_ref&&typeof op.resultado_ref==='object'){
   const sources=(op.resultado_ref as {sources?:{document:string;hash:string}[]}).sources||[];
   for(const source of sources){
    const valid=await client.query("SELECT 1 FROM documento_conocimiento WHERE id=$1 AND hash=$2 AND estado='valido'",[source.document,source.hash]);
    if(!valid.rowCount)throw new ServiceError('SOURCE_WITHDRAWN',409);
   }
  }
  const result = effect ? await effect(client,op) : null;
  await client.query('UPDATE operacion_integracion SET estado=$2,resultado_ref=$3,actualizado_en=now() WHERE id=$1',[id,state,result]);
  let next: string | null = null;
  if (c.esperando) {
   const waiting = await operation(c.esperando,client);
   if (!c.pausada && waiting.deadline.getTime()>Date.now()) {
    next=waiting.id; await client.query("UPDATE operacion_integracion SET estado='activa' WHERE id=$1",[next]);
   } else await client.query("UPDATE operacion_integracion SET estado='cancelada' WHERE id=$1",[waiting.id]);
  }
  await client.query('UPDATE coordinacion_integracion SET activa=$1,esperando=NULL WHERE id=1',[next]);
 });
}
export async function uncertain(id: string): Promise<void> {
 await pool.query("UPDATE operacion_integracion SET estado='incierta',actualizado_en=now() WHERE id=$1 AND estado='activa'",[id]);
}
export function permit(op: Operation): string {
 return jwt.sign({installationId:op.installation_id,generation:op.generacion,operationId:op.id,kind:op.clase,
  exp:Math.floor(op.deadline.getTime()/1000)},required('INTERNAL_SIGNING_KEY'),{algorithm:'HS256'});
}
export async function fromPermit(token: string): Promise<Operation> {
 let payload: jwt.JwtPayload;
 try {
  const p=jwt.verify(token,required('INTERNAL_SIGNING_KEY'),{algorithms:['HS256']});
  if(typeof p==='string') throw new Error();
  payload=p;
 } catch { throw new ServiceError('INVALID_PERMIT',401); }
 const op=await assertCurrent(String(payload.operationId));
 if(op.installation_id!==payload.installationId || op.generacion!==payload.generation || op.clase!==payload.kind)
  throw new ServiceError('STALE_PERMIT',409);
 return op;
}
export async function recover(): Promise<void> {
 await locked(async c => {
  const current=await coordination(c);
  if(current.activa) await c.query("UPDATE operacion_integracion SET estado='incierta' WHERE id=$1 AND estado='activa'",[current.activa]);
  if(current.esperando) await c.query("UPDATE operacion_integracion SET estado='cancelada' WHERE id=$1",[current.esperando]);
  await c.query('UPDATE coordinacion_integracion SET esperando=NULL WHERE id=1');
 });
}

