import {Pool} from 'pg';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const name='cybersim_contract_test_'+randomBytes(6).toString('hex');
if(!/^cybersim_contract_test_[a-f0-9]{12}$/.test(name))throw new Error('Unsafe test database');
const admin=new Pool({host:process.env.PGHOST||'postgres',user:process.env.PGUSER||'postgres',password:process.env.PGPASSWORD||'postgres',database:process.env.PGDATABASE||'cybersim'});
let created=false;
try{
 await admin.query('CREATE DATABASE "'+name+'"');created=true;
 const url=new URL('postgresql://localhost');url.hostname=process.env.PGHOST||'postgres';url.username=process.env.PGUSER||'postgres';url.password=process.env.PGPASSWORD||'postgres';url.pathname='/'+name;
 const env={...process.env,NODE_ENV:'test',DATABASE_URL:url.toString(),DIRECT_URL:url.toString(),CYBERSIM_TEST_DATABASE:'1',OPENAI_API_KEY:'',INTERNAL_SIGNING_KEY:'local-test-signing-key-123456789012345678901234567890'};
 for(const args of [
  ['--filter','@cybersim/backend','run','migrate:deploy'],
  ['--filter','@cybersim/backend','run','db:seed'],
  ['--filter','@cybersim/backend','exec','tsx','-e',"import{pool}from'./src/integrations/config.ts';void(async()=>{await pool.query('INSERT INTO coordinacion_integracion(id) VALUES(1)');await pool.end()})()"],
  ['--filter','@cybersim/backend','run','test']
 ]){
  const r=spawnSync('pnpm',args,{env,stdio:'inherit',timeout:180000});
  if(r.status!==0)throw new Error('Isolated integration check failed');
 }
}finally{
 if(created)await admin.query('DROP DATABASE "'+name+'" WITH (FORCE)');
 await admin.end();
}

