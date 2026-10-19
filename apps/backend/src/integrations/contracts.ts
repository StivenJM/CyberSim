import { object, ServiceError } from './config.js';
const string={type:'string'}, number={type:'number'}, bool={type:'boolean'};
const array=(items:unknown)=>({type:'array',items});
const nullable=(schema:unknown)=>({anyOf:[schema,{type:'null'}]});
const obj=(properties:Record<string,unknown>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const pos=obj({x:number,y:number,z:number,rotacionY:number});
const config=obj({nombreConfig:string,activado:bool});
const firewall=obj({nombreRed:string,accion:string,direccion:string,protocolo:string});
const app=obj({nombreAplicacion:string});
const value={anyOf:[app,array(config),array(firewall),string,number,bool,{type:'null'}]};
const gateway=obj({lanLocal:string,hostLan:string,proteccion:string,dominioRemoto:string,hostRemoto:string});
const vpnClient=obj({proteccion:string,dominioRemoto:string,hostRemoto:string});
const eventInfo={anyOf:[
 obj({accion:string,objeto:string,tiempo:nullable(number),val:value,esObjetivo:nullable(bool)}),
 obj({nombreDocumento:string,nombreFirma:string,nombreClave:string,veredicto:bool,esObjetivo:nullable(bool)}),
 obj({dispositivoOrigen:string,dispositivoDestino:string,protocolo:string,esObjetivo:bool,debeSerBloqueado:bool}),
 obj({gateway,cliente:vpnClient}),
 obj({nombreActivo:string,dispositivoEmisor:string,dispositivoReceptor:string}),
 {type:'null'}
]};
const device=obj({id:number,tipo:string,nombre:string,sistemaOperativo:string,hardware:string,software:string,posicion:pos,estadoAtaque:string,
 personaEncargada:nullable(string),nombreEquipo:nullable(string),usuario:nullable(string),contrasenia:nullable(string),
 activos:array(obj({nombre:string,contenido:nullable(string),tipo:string,firma:nullable(string),propietario:nullable(string)})),redes:array(string),
 conectadoAInternet:nullable(bool),decorativo:nullable(bool)});
export const scenarioSchema=obj({
 id:number,slug:string,titulo:string,categoria:string,descripcion:string,presupuestoInicial:number,
 zonas:array(obj({id:number,nombre:string,dominio:string,esInteractiva:nullable(bool),
 redes:array(obj({nombre:string,color:string})),
 personas:array(obj({nombre:string,correo:string,nivelConcienciaSeguridad:string})),
 oficinas:array(obj({id:number,nombre:string,posicion:pos,espacios:array(obj({id:number,mueble:string,posicion:pos,dispositivos:array(device)}))}))})),
 fases:array(obj({id:number,nombre:string,descripcion:string,faseActual:bool,completada:bool,objetivos:array(obj({descripcion:string,completado:bool}))})),
 ataques:array(obj({nombreAtaque:string,tiempoNotificacion:number,tiempoEnOcurrir:number,tipoAtaque:string,dispositivoAAtacar:string,descripcion:string,fase:number,
 condicionMitigacion:obj({accion:string,objeto:string,tiempo:nullable(number),val:{anyOf:[array(config),array(firewall)]}})})),
 eventos:array(obj({nombreEvento:string,tipoEvento:string,tiempoNotificacion:number,tiempoEnOcurrir:nullable(number),descripcion:string,fase:number,infoAdicional:eventInfo,ejecutarAlInstante:nullable(bool)})),
 accionesEsperadas:array(obj({accion:string,objeto:string,inicioTiempoEsperado:number,finTiempoEsperado:number,val:value}))
});
export const feedbackSchema=obj({analisis:string,fortaleza:string,area_mejora:string,consejo:string});
const section=obj({titulo:string,contenido:string});
export const analysisSchema=obj({resumen_ejecutivo:section,patrones:section,fortalezas:section,areas_mejora:section,recomendaciones:section});
export const tutorSchema=obj({message:string,sufficient:bool,citations:array(string)});
export function validateSchema(schema:unknown,data:unknown):void {
 const s=object(schema);
 if(s.anyOf) {
  for(const candidate of s.anyOf as unknown[]) {try{validateSchema(candidate,data);return;}catch{/* try next union member */}}
  throw new ServiceError('INVALID_MODEL_UNION',422);
 }
 if(s.type==='null') {if(data!==null)throw new ServiceError('INVALID_MODEL_NULL',422);return;}
 if(s.type==='object') {
  const value=object(data);const properties=object(s.properties);
  for(const k of s.required as string[])if(!(k in value))throw new ServiceError('MISSING_MODEL_FIELD',422,k);
  for(const[k,v]of Object.entries(value)) {
   if(!(k in properties))throw new ServiceError('UNKNOWN_MODEL_FIELD',422,k);
   validateSchema(properties[k],v);
  }
 } else if(s.type==='array'){
  if(!Array.isArray(data))throw new ServiceError('INVALID_MODEL_ARRAY',422);
  for(const v of data)validateSchema(s.items,v);
 } else if(typeof data!==s.type || (typeof data==='number'&&!Number.isFinite(data)))throw new ServiceError('INVALID_MODEL_FIELD',422);
}
export function validateScenario(data:unknown):Record<string,unknown> {
 validateSchema(scenarioSchema,data);
 const s=object(data);
 if(Buffer.byteLength(JSON.stringify(s))>262144)throw new ServiceError('SCENARIO_TOO_LARGE',413);
 const phases=(s.fases as Record<string,unknown>[]);
 if(!phases.length || phases.length>12 || phases.filter(p=>p.faseActual).length!==1 || !phases[0].faseActual || phases.some(p=>p.completada))
  throw new ServiceError('INVALID_PHASES',422);
 const ids=new Set(phases.map(p=>p.id));
 if(ids.size!==phases.length)throw new ServiceError('DUPLICATE_PHASE',422);
 const devices=new Set<string>();
 for(const z of s.zonas as Record<string,unknown>[]) {
  const networks=new Set((z.redes as Record<string,unknown>[]).map(n=>n.nombre));
  for(const o of z.oficinas as Record<string,unknown>[])for(const e of o.espacios as Record<string,unknown>[])
   for(const d of e.dispositivos as Record<string,unknown>[]){
    if(devices.has(String(d.nombre)))throw new ServiceError('DUPLICATE_DEVICE',422);
    devices.add(String(d.nombre));
    if((d.redes as string[]).some(n=>!networks.has(n)))throw new ServiceError('UNKNOWN_NETWORK',422);
   }
 }
 if(!devices.size)throw new ServiceError('EMPTY_TOPOLOGY',422);
 for(const event of [...s.ataques as Record<string,unknown>[],...s.eventos as Record<string,unknown>[]]) {
  if(!ids.has(event.fase) || Number(event.tiempoNotificacion)<0 || (event.tiempoEnOcurrir!==null&&Number(event.tiempoEnOcurrir)<Number(event.tiempoNotificacion)))throw new ServiceError('INVALID_EVENT',422);
  if(event.dispositivoAAtacar&&!devices.has(String(event.dispositivoAAtacar)))throw new ServiceError('UNKNOWN_DEVICE',422);
 }
 for(const p of phases){
  const close=(s.eventos as Record<string,unknown>[]).some(e=>e.fase===p.id&&String(e.tipoEvento).includes('Completación'));
  if(!close)throw new ServiceError('MISSING_PHASE_CLOSE',422);
  const names=new Set([...s.eventos as Record<string,unknown>[],...s.ataques as Record<string,unknown>[]].filter(e=>e.fase===p.id).map(e=>e.nombreEvento||e.nombreAtaque));
  for(const o of p.objetivos as Record<string,unknown>[])if(!names.has(o.descripcion))throw new ServiceError('OBJECTIVE_EVENT_MISMATCH',422);
 }
 return s;
}

