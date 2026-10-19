import {escenariosActivos} from './activos.js';
interface EscenarioMeta {slug:string;titulo:string}
export const escenarioMap=new Map<string,EscenarioMeta>(escenariosActivos.map(e=>[e.slug,{slug:e.slug,titulo:e.titulo}]));
export function getNombreEscenario(slug:string){return escenarioMap.get(slug)?.titulo??`Escenario: ${slug}`;}
