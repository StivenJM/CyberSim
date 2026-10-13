import { describe, test, expect } from 'vitest'
import { ECSManager } from '../src/ecs/core'
import { TiempoComponent } from '../src/ecs/components'
import { SistemaTiempo } from '../src/ecs/systems'

describe('SistemaTiempo y TimeComponent', () => {
    test('el valor de transcurrido se incrementa cuando no está pausado', () => {
        const em = new ECSManager();
        const entidad = em.agregarEntidad();
        em.agregarComponente(entidad, new TiempoComponent());
        const sistema = new SistemaTiempo();
        em.agregarSistema(sistema);
    
        const c = em.getComponentes(entidad);
        expect(c).toBeDefined();
        const t = c!.get(TiempoComponent);
        expect(t.transcurrido).toBe(0);
    
        // simular 2 segundos
        t.transcurrido += 2;
    
        expect(t.transcurrido).toBe(2);
    });
  
    test('pausar impide que el valor de trasncurrido aumente', () => {
        const em = new ECSManager();
        const entidad = em.agregarEntidad();
        em.agregarComponente(entidad, new TiempoComponent());
        const sistema = new SistemaTiempo();
        em.agregarSistema(sistema);
        
        const c = em.getComponentes(entidad)!;
        const t = c.get(TiempoComponent);
        
        // avanzar un poco
        t.transcurrido += 1;
        expect(t.transcurrido).toBe(1);
        
        // pausar
        sistema.pausar(entidad);
        expect(t.pausado).toBe(true);
        
        // intentar avanzar estando pausado
        if(!t.pausado) t.transcurrido += 1;
        expect(t.transcurrido).toBe(1);
    });

    test("reanudar continua el tiempo desde donde se quedó", () =>{
        const em = new ECSManager();
        const entidad = em.agregarEntidad();
        em.agregarComponente(entidad, new TiempoComponent());
        const sistema = new SistemaTiempo();
        em.agregarSistema(sistema);
        
        const c = em.getComponentes(entidad)!;
        const t = c.get(TiempoComponent);
        
        // avanzar un poco
        t.transcurrido += 1;
        expect(t.transcurrido).toBe(1);
        
        // pausar
        sistema.pausar(entidad);
        expect(t.pausado).toBe(true);
        
        // intentar avanzar estando pausado
        if(!t.pausado) t.transcurrido += 1;
        expect(t.transcurrido).toBe(1);
        
        // reanudar
        sistema.reanudar(entidad);
        expect(t.pausado).toBe(false);
        t.transcurrido += 1;
        expect(t.transcurrido).toBe(2);
    });
});
