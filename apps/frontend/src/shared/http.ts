export function authHeaders(): Record<string,string> {
 const token=localStorage.getItem('authToken');
 return {'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
}
export function authorizedFetch(input:RequestInfo|URL,init:RequestInit={}):Promise<Response>{
 return fetch(input,{...init,headers:{...authHeaders(),'X-Request-Id':crypto.randomUUID(),...Object.fromEntries(new Headers(init.headers).entries())},
 signal:init.signal||AbortSignal.timeout(305000)});
}
export function errorMessage(data:unknown):string {
 if(data&&typeof data==='object'&&'error' in data){
  const e=(data as {error:unknown}).error;
  if(typeof e==='string')return e;
  if(e&&typeof e==='object'&&'message'in e)return String(e.message);
 }
 return 'Servicio no disponible';
}

