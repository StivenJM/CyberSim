import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
const root=process.env.PREPARATION_DIR||'/state';await mkdir(root,{recursive:true});
const base=process.env.BACKEND_INTERNAL_URL||'http://backend:3001',n8n=process.env.N8N_URL||'http://n8n:5678';
const sha=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
async function read(n,f={}){try{return JSON.parse(await readFile(root+'/'+n+'.json','utf8'));}catch{return f;}}
async function save(n,v){await writeFile(root+'/'+n+'.json',JSON.stringify(v,null,2),{mode:0o600});}
async function request(url,body,headers={},method){
 const verb=method||(body?'POST':'GET');
 const r=await fetch(url,{method:verb,headers:{'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(300000)});
 const text=await r.text();if(!r.ok){const target=new URL(url);throw Object.assign(new Error('HTTP_'+r.status+' '+verb+' '+target.hostname+target.pathname),{status:r.status});}
 return text?JSON.parse(text):{};
}
const backend=(v,b,m)=>request(base+'/internal/v1/'+v,b,{'X-Maintenance-Token':process.env.MAINTENANCE_TOKEN||''},m);
const api=(v,b,m)=>request(n8n+'/api/v1/'+v,b,{'X-N8N-API-KEY':process.env.N8N_ADMIN_API_KEY||''},m);
const manifest=JSON.parse(await readFile('infra/n8n/manifest.json','utf8'));
function canonical(v){
 const keys=['id','name','type','typeVersion','parameters','credentials'];
 const settings=Object.fromEntries(['executionOrder','saveDataSuccessExecution','saveExecutionProgress','executionTimeout'].filter(k=>v.settings?.[k]!==undefined).map(k=>[k,v.settings[k]]));
 const clean={nodes:v.nodes.map(n=>Object.fromEntries(keys.filter(k=>n[k]!==undefined).map(k=>[k,n[k]]))),connections:v.connections,settings};
 const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,z])=>[k,stable(z)])):x;
 return JSON.stringify(stable(clean));
}
async function bootstrap(apply=false,discard=false){
 if(!process.env.N8N_ADMIN_API_KEY)return {workflows:'requires_configuration',drive:'requires_configuration',reason:'Crear owner y API key n8n; añadir N8N_ADMIN_API_KEY al .env.'};
 const map=await read('workflows',{credentials:{},workflows:{}});map.credentials??={};map.workflows??={};
 for(const [key,type,data]of [
  ['cybersim-service','httpHeaderAuth',{name:'X-Service-Token',value:process.env.N8N_TO_BACKEND_TOKEN}],
  ['cybersim-webhook','httpHeaderAuth',{name:'X-Cybersim-Webhook',value:process.env.BACKEND_TO_N8N_TOKEN}],
  ['cybersim-google','googleDriveOAuth2Api',{clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET,customScopes:true,enabledScopes:'https://www.googleapis.com/auth/drive.readonly'}]
 ]){
  if(map.credentials[key]||Object.values(data).some(v=>!v))continue;
  map.credentials[key]=(await api('credentials',{name:key,type,data})).id;await save('workflows',map);
 }
 let pending=false;
 for(const item of manifest.workflows){
  if(item.key==='drive'&&(!map.credentials['cybersim-google']||!process.env.GOOGLE_DRIVE_FOLDER_ID)){pending=true;continue;}
  const body=JSON.parse((await readFile('infra/n8n/'+item.file,'utf8')).replaceAll('__FOLDER_ID__',process.env.GOOGLE_DRIVE_FOLDER_ID||'NOT_CONFIGURED'));
  for(const node of body.nodes)for(const type of Object.keys(node.credentials||{})){
   const key=node.credentials[type].id;
   if(!map.credentials[key])throw new Error('CREDENTIAL_REQUIRED_'+key);
   node.credentials[type]={id:map.credentials[key],name:key};
  }
  const hash=sha(canonical(body));let installed=map.workflows[item.key],current;
  if(installed){
   current=await api('workflows/'+installed.id);
   if(installed.hash===hash&&sha(canonical(current))===hash)continue;
   if(!apply){pending=true;continue;}
   if(sha(canonical(current))!==installed.hash&&!discard)throw new Error('LOCAL_WORKFLOW_CHANGED: exportar o --discard-local.');
   await save('backup-'+Date.now()+'-'+item.key,current);
   await api('workflows/'+installed.id+'/deactivate',{});
   current=await api('workflows/'+installed.id,body,'PUT');
  }else{
   const found=await api('workflows?name='+encodeURIComponent(body.name));
   if(found.data?.length)throw new Error('WORKFLOW_MAP_MISSING: no duplicar ni adoptar automáticamente.');
   current=await api('workflows',body);
  }
  const active=await api('workflows/'+current.id+'/activate',{});
  map.workflows[item.key]={id:current.id,hash,version:active.versionId||current.versionId};
  await save('workflows',map);
 }
 return {workflows:pending?'update_pending':'ready',drive:map.credentials['cybersim-google']?'configured':'requires_configuration'};
}
async function baseline(){
 const docs=[];
 for(const [folder,type]of [['knowledge/base','conocimiento'],['knowledge/app-context','contexto']]){
  for(const filename of await readdir(folder)){
   if(!/\.(md|txt)$/.test(filename))continue;
   const content=await readFile(path.join(folder,filename),'utf8');
   docs.push({id:'repo:'+folder+'/'+filename,source:'versionado',revision:sha(content),type,content});
  }
 }
 for(const [filename,type]of [['topologias','topologias'],['desafios','desafios']]){
  for(const record of JSON.parse(await readFile('apps/frontend/scripts/rag-output/'+filename+'.json','utf8')))
   docs.push({id:'repo:'+filename+':'+record.slug,source:'versionado',revision:sha(record),type,content:record.text,data:record});
 }
 const installation=(await backend('maintenance/status')).installationId;
 const hash=sha({docs,installation});if((await read('baseline')).hash===hash)return;
 await request(n8n+'/webhook/cybersim-ingest',{documents:docs},{'X-Cybersim-Webhook':process.env.BACKEND_TO_N8N_TOKEN||''});
 await save('baseline',{hash});
}
async function prepare(){
 while(true){
  try{
   await backend('maintenance/status');const result=await bootstrap();
   if(result.workflows==='ready')await baseline();
   const evidence=await read('acceptance');
   await backend('maintenance/preparation',{...result,verification:evidence.passed?'passed':'pending'});
   console.log(JSON.stringify({event:'preparation',...result,verification:evidence.passed?'passed':'pending'}));
  }catch(e){console.warn(JSON.stringify({event:'preparation_pending',reason:e.message}));}
  await sleep(15000);
 }
}
async function pause(){
 for(let i=0;i<305;i++){try{return await backend('maintenance/pause',{});}catch(e){if(e.status!==409)throw e;}await sleep(1000);}
 throw new Error('DRAIN_TIMEOUT: no reset ni cambio automático.');
}
const [command='status',sub,...args]=process.argv.slice(2);
try{
 if(command==='prepare')await prepare();
 else if(command==='status')console.log(JSON.stringify(await backend('maintenance/status'),null,2));
 else if(command==='maintenance'){
  if(sub==='pause')await pause();else if(sub==='resume')await backend('maintenance/resume',{});else throw new Error('maintenance pause|resume');
 }else if(command==='workflows'){
  if(sub==='apply'){
   await pause();
   const before=await read('workflows',{credentials:{},workflows:{}});
   const snapshots={};
   for(const[key,ref]of Object.entries(before.workflows))snapshots[key]=await api('workflows/'+ref.id);
   await save('apply-backup-'+Date.now(),{map:before,snapshots});
   try{await bootstrap(true,args.includes('--discard-local'));await backend('maintenance/resume',{});}
   catch(error){
    const after=await read('workflows');
    for(const[key,ref]of Object.entries(after.workflows||{})){
     if(!snapshots[key]){await api('workflows/'+ref.id+'/deactivate',{}).catch(()=>{});await api('workflows/'+ref.id,undefined,'DELETE');continue;}
     const original=snapshots[key];
     await api('workflows/'+ref.id+'/deactivate',{}).catch(()=>{});
     await api('workflows/'+ref.id,{name:original.name,nodes:original.nodes,connections:original.connections,settings:original.settings},'PUT');
     if(original.activeVersionId||original.active)await api('workflows/'+ref.id+'/activate',{});
    }
    await save('workflows',before);
    throw new Error('APPLY_FAILED: revisión anterior restaurada; mantenimiento permanece activo. '+error.message);
   }
   const backups=(await readdir(root)).filter(n=>/^apply-backup-\\d+\\.json$/.test(n)).sort().reverse();
   for(const[nameIndex,name]of backups.entries())if(nameIndex>=3||Date.now()-Number(name.match(/\\d+/)[0])>30*86400000)await unlink(root+'/'+name);
  }
  else if(sub==='export'){
   const map=await read('workflows');
   for(const item of manifest.workflows){
    if(!map.workflows?.[item.key])continue;
    const current=await api('workflows/'+map.workflows[item.key].id);
    const clean={name:current.name,nodes:current.nodes,connections:current.connections,settings:current.settings};
    for(const node of clean.nodes){
     for(const[type,ref]of Object.entries(node.credentials||{})){
      const key=Object.keys(map.credentials).find(k=>map.credentials[k]===ref.id);
      if(!key)throw new Error('Credencial desconocida: sanear antes de exportar.');
      node.credentials[type]={id:key,name:key};
     }
     if(/Bearer |sk-[a-zA-Z0-9]/.test(JSON.stringify(node.parameters)))throw new Error('Posible secreto: exportación bloqueada.');
    }
    await mkdir('/host/infra/n8n',{recursive:true});await writeFile('/host/infra/n8n/'+item.file,JSON.stringify(clean,null,2)+'\n');
   }
   console.log('Export saneado escrito al host: revisar diff antes del commit.');
  }else throw new Error('workflows export|apply [--discard-local]');
 }else if(command==='integrations'){
  if(sub==='resolve-uncertain'){
   if(!args.includes('--ack-remote-uncertainty')||!args.includes('--emitters-stopped'))throw new Error('Detén n8n/runner y proporciona ambos reconocimientos.');
   await backend('maintenance/resolve-uncertain',{acknowledgeRemoteUncertainty:true,emittersStopped:true});
  }else if(sub==='reconcile')await backend('maintenance/resume',{});else throw new Error('integrations reconcile|resolve-uncertain');
 }else if(command==='knowledge'&&sub==='reconcile')console.log(JSON.stringify(await backend('knowledge/unit',{})));
 else if(command==='verify'){await import('./verify.mjs');}
 else throw new Error('Comando no reconocido.');
}catch(e){console.error(JSON.stringify({error:e.message}));process.exitCode=1;}

