import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {repositoryRoot} from './config.js';
export async function codeHash():Promise<string>{
 const digest=createHash('sha256');
 async function scan(dir:string):Promise<void>{
  let names:string[];try{names=await readdir(dir);}catch{return;}
  for(const name of names.sort()){
   if(['generated','node_modules','dist'].includes(name))continue;
   const full=path.join(dir,name);
   if(/\.(ts|tsx|mjs|json|md)$/.test(name)){
    digest.update(full);digest.update(await readFile(full));
   }else if(!name.includes('.'))await scan(full);
  }
 }
 await scan(path.join(repositoryRoot,'apps/backend/src'));await scan(path.join(repositoryRoot,'infra/n8n'));await scan(path.join(repositoryRoot,'knowledge'));
 for(const file of ['pnpm-lock.yaml','pnpm-workspace.yaml','package.json']){
  digest.update(await readFile(path.join(repositoryRoot,file)));
 }
 digest.update(JSON.stringify({tutor:process.env.OPENAI_TUTOR_MODEL,complex:process.env.OPENAI_COMPLEX_MODEL,embedding:process.env.OPENAI_EMBEDDING_MODEL}));
 return digest.digest('hex');
}

