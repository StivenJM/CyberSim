import {useState,useEffect} from 'react';
type Status={state:string;components?:Record<string,string>};
export default function PreparationStatus(){
 const [status,setStatus]=useState<Status|null>(null);
 useEffect(()=>{
  const poll=()=>fetch('/api/health/ready').then(r=>r.json()).then(setStatus).catch(()=>setStatus({state:'sin_conexion'}));
  void poll();const timer=setInterval(()=>void poll(),10000);return()=>clearInterval(timer);
 },[]);
 if(!import.meta.env.DEV||!status||status.state==='listo')return null;
 const labels:Record<string,string>={database:'Base de datos',coordinator:'Coordinación de IA',qdrant:'Conocimiento',piper:'Voz',openai:'OpenAI',smtp:'Correo',workflows:'Workflows',drive:'Google Drive',verification:'Verificación',disk:'Disco'};
 const states:Record<string,string>={requires_configuration:'requiere configuración',pending:'pendiente',pending_index:'pendiente de indexación',unavailable:'no disponible',update_pending:'actualización pendiente',configured:'configurado',ready:'disponible',uncertain:'requiere reconciliación',paused:'en mantenimiento',unknown:'sin comprobar',low:'poco espacio'};
 return <details style={{position:'fixed',bottom:8,left:8,zIndex:10000,maxWidth:350,padding:10,borderRadius:8,background:'#201d10',color:'#ffe6a3',fontSize:13}}>
  <summary>Entorno de desarrollo: {status.state.replaceAll('_',' ')}</summary>
  <ul>{Object.entries(status.components||{}).map(([key,value])=><li key={key}>{labels[key]||key}: {states[value]||value}</li>)}</ul>
  <span>Consulta la guía de Docker para completar la preparación.</span>
 </details>;
}

