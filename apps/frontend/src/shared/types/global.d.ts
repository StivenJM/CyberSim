import { LogCategory } from "./LogCategory";

declare global {
  interface Transform {
    x: number;
    y: number;
    z: number;
    rotacionY: number;
  }

  interface BaseEntity {
    id: Entidad;
    position: [number, number, number];
    rotation: number;
  }
  interface EspacioEntity extends BaseEntity {
    type: "espacio";
    espacio: Espacio;
  }
  interface DispositivoEntity extends BaseEntity {
    type: "dispositivo";
    dispositivo: Dispositivo;
  }
  type ECSSceneEntity = EspacioEntity | DispositivoEntity;

  type Log = {
    time: string;
    content: string;
    category: LogCategory;
  };
}

export {};
