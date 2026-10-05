import type { EstadoAtaqueDispositivo, TipoDispositivo } from "../../shared/types/DeviceEnums";
import type { SoftwareApp } from "../../shared/types/EscenarioTypes";
import { Componente, type Entidad } from "../core/Componente";

export class DispositivoComponent extends Componente {
  constructor(
    public nombre: string = "",
    public sistemaOperativo: string = "",
    public hardware: string = "",
    public tipo: TipoDispositivo,
    public estadoAtaque: EstadoAtaqueDispositivo,
    public nombreEquipo: string, 
    public usuario: string,
    public contrasenia: string,
    public redes: Entidad[] = [],
    public personaEncargada?: string,
    public apps?: SoftwareApp[],
    // Marca un dispositivo como puramente decorativo: se renderiza en 3D pero
    // NO aparece en la vista de redes/topología ni en el escaneo, y no es
    // interactivo. Útil para vestir escenas sin contaminar el nivel.
    public decorativo: boolean = false
  ) {
    super();
  }
}
