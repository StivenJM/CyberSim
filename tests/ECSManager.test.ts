import { describe, it, beforeEach, expect } from "vitest";
import { ECSManager } from "../src/client/ecs/core";
import { TransformComponent, Velocidad } from "../src/client/ecs/components";
import { SistemaTiempo } from "../src/client/ecs/systems";

describe("ECSManager", () => {
  let em: ECSManager;

  beforeEach(() => {
    em = new ECSManager();
  });

  describe("agregarEntidad", () => {
    it("debe agregar una entidad correctamente al manager", () => {
      const e1 = em.agregarEntidad();

      expect(e1.valueOf()).toBe(0);
    });

    it("debe agregar varias entidades con ids únicos e incrementales", () => {
      const e1 = em.agregarEntidad();
      const e2 = em.agregarEntidad();
      const e3 = em.agregarEntidad();

      expect(e1.valueOf()).toBe(0);
      expect(e2.valueOf()).toBe(1);
      expect(e3.valueOf()).toBe(2);
    });
  });

  describe("agregarComponente", () => {
    it("debe agregar un componente a una entidad", () => {
      const entidad = em.agregarEntidad();
      const pos = new TransformComponent(10, 20, 10, 0);

      em.agregarComponente(entidad, pos);

      const componentes = em.getComponentes(entidad);
      expect(componentes?.get(TransformComponent)).toBe(pos);
    });

    it("debe permitir agregar múltiples componentes", () => {
      const entidad = em.agregarEntidad();

      em.agregarComponente(entidad, new TransformComponent(10, 20, 10, 0));
      em.agregarComponente(entidad, new Velocidad(1, 2));

      const componentes = em.getComponentes(entidad);
      expect(componentes?.tiene(TransformComponent)).toBe(true);
      expect(componentes?.tiene(Velocidad)).toBe(true);
    });

    /*it('debe actualizar automáticamente los sistemas relevantes', () => {
            const sistema = new SistemaMovimiento();
            em.agregarSistema(sistema);
          
            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
          
            // Sistema aún no debe incluir la entidad (falta Velocidad)
            em.actualizar();
            expect(sistema.actualizacionesRealizadas).toBe(1);
          
            // Al agregar el componente faltante, debe incluirse
            em.agregarComponente(entidad, new Velocidad(1, 1));
            em.actualizar();
          
            const componentes = em.getComponentes(entidad);
            const pos = componentes?.get(TransformComponent);
            expect(pos?.x).toBe(1); // Se movió
        });*/
  });

  describe("getComponentes", () => {
    it("debe retornar los componentes de una entidad", () => {
      const entidad = em.agregarEntidad();
      em.agregarComponente(entidad, new TransformComponent(5, 10, 15, 0));

      const componentes = em.getComponentes(entidad);
      const pos = componentes?.get(TransformComponent);

      expect(pos?.x).toBe(5);
      expect(pos?.y).toBe(10);
      expect(pos?.z).toBe(15);
      expect(pos?.rotacionY).toBe(0);
    });

    it("debe retornar undefined para entidad inexistente", () => {
      const componentes = em.getComponentes(999);
      expect(componentes).toBeUndefined();
    });
  });

  describe("removerComponente", () => {
    it("debe remover un componente de una entidad", () => {
      const entidad = em.agregarEntidad();
      em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));

      em.removerComponente(entidad, TransformComponent);

      const componentes = em.getComponentes(entidad);
      expect(componentes?.tiene(TransformComponent)).toBe(false);
    });

    /*it('debe actualizar sistemas al remover componente', () => {
            const sistema = new SistemaMovimiento();
            em.agregarSistema(sistema);
          
            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad, new Velocidad(1, 1));
          
            // La entidad debe estar en el sistema
            em.actualizar();
            const pos1 = em.getComponentes(entidad)?.get(TransformComponent);
            expect(pos1?.x).toBe(1);
          
            // Al remover componente, ya no debe procesarse
            em.removerComponente(entidad, Velocidad);
            em.actualizar();
          
            const pos2 = em.getComponentes(entidad)?.get(TransformComponent);
            expect(pos2?.x).toBe(1); // No cambió porque ya no cumple requisitos
        });*/

    it("no debe causar error al remover componente de entidad inexistente", () => {
      expect(() => {
        em.removerComponente(999, TransformComponent);
      }).not.toThrow();
    });
  });

  describe("agregarSistema", () => {
    it("debe agregar un sistema al ECS", () => {
      const sistema = new SistemaTiempo();
      em.agregarSistema(sistema);

      expect(sistema.ecsManager).toBe(em);
    });

    /*it('debe procesar entidades existentes al agregar sistema', () => {
            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad, new Velocidad(1, 1));
          
            const sistema = new SistemaMovimiento();
            em.agregarSistema(sistema);
          
            em.actualizar();
          
            const pos = em.getComponentes(entidad)?.get(TransformComponent);
            expect(pos?.x).toBe(1);
        });*/

    /*it('debe permitir múltiples sistemas', () => {
            const sistema1 = new SistemaMovimiento();
            const sistema2 = new SistemaAtaque();
          
            em.agregarSistema(sistema1);
            em.agregarSistema(sistema2);
          
            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad, new Velocidad(1, 1));
            em.agregarComponente(entidad, new TiempoComponent(0, false));
          
            em.actualizar();
          
            expect(sistema1.actualizacionesRealizadas).toBe(1);
        });*/
  });

  //describe('removerSistema', () => {
  /*it('debe remover un sistema del ECS', () => {
            const sistema = new SistemaMovimiento();
            em.agregarSistema(sistema);
            em.removerSistema(sistema);

            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad, new Velocidad(1, 1));

            em.actualizar();

            // El sistema no debe haber actualizado
            expect(sistema.actualizacionesRealizadas).toBe(0);
        });*/
  //});

  //describe('actualizar', () => {
  /*it('debe llamar a actualizar en todos los sistemas', () => {
            const sistema1 = new SistemaMovimiento();
            const sistema2 = new SistemaAtaque();

            em.agregarSistema(sistema1);
            em.agregarSistema(sistema2);

            em.actualizar();

            expect(sistema1.actualizacionesRealizadas).toBe(1);
        });*/

  /*it('debe pasar las entidades correctas a cada sistema', () => {
            const sistema1 = new SistemaMovimiento();
            const sistema2 = new SistemaAtaque();

            em.agregarSistema(sistema1);
            em.agregarSistema(sistema2);

            const entidad1 = em.agregarEntidad();
            em.agregarComponente(entidad1, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad1, new Velocidad(1, 1));

            const entidad2 = em.agregarEntidad();
            em.agregarComponente(entidad2, new TiempoComponent(0, false));

            em.actualizar();

            // sistema1 solo debe procesar entidad1
            const pos = em.getComponentes(entidad1)?.get(TransformComponent);
            expect(pos?.x).toBe(1);
        });*/

  /*it('debe actualizar múltiples veces correctamente', () => {
            const sistema = new SistemaMovimiento();
            em.agregarSistema(sistema);

            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad, new Velocidad(2, 3));

            em.actualizar();
            em.actualizar();
            em.actualizar();

            const pos = em.getComponentes(entidad)?.get(TransformComponent);
            expect(pos?.x).toBe(6); // 2 * 3
            expect(pos?.z).toBe(9); // 3 * 3
            expect(sistema.actualizacionesRealizadas).toBe(3);
        });*/
  //});

  /*describe('removerEntidad', () => {
        /*it('debe marcar entidad para destrucción', () => {
            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));

            em.removerEntidad(entidad);
            em.actualizar(); // Las entidades se destruyen en actualizar()

            const componentes = em.getComponentes(entidad);
            expect(componentes).toBeUndefined();
        });*/

  /*it('debe remover entidad de todos los sistemas', () => {
            const sistema = new SistemaMovimiento();
            em.agregarSistema(sistema);

            const entidad = em.agregarEntidad();
            em.agregarComponente(entidad, new TransformComponent(0, 0, 0, 0));
            em.agregarComponente(entidad, new Velocidad(1, 1));

            em.actualizar();
            expect(sistema.actualizacionesRealizadas).toBe(1);

            em.removerEntidad(entidad);
            em.actualizar();

            // El sistema ya no debe procesar la entidad
            expect(sistema.actualizacionesRealizadas).toBe(2); // Se llamó pero sin entidades
        });*/

  /*it('debe procesar múltiples entidades a destruir en un frame', () => {
            const entidad1 = em.agregarEntidad();
            const entidad2 = em.agregarEntidad();
            const entidad3 = em.agregarEntidad();

            em.removerEntidad(entidad1);
            em.removerEntidad(entidad2);
            em.removerEntidad(entidad3);

            em.actualizar();

            expect(em.getComponentes(entidad1)).toBeUndefined();
            expect(em.getComponentes(entidad2)).toBeUndefined();
            expect(em.getComponentes(entidad3)).toBeUndefined();
        });*/

  /* it('no debe causar error al remover entidad inexistente', () => {
            expect(() => {
                em.removerEntidad(999);
                em.actualizar();
            }).not.toThrow();
        });*/
  //});
});
