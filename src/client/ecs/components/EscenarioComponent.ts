import type { LogGeneral, SoftwareApp } from "../../shared/types/EscenarioTypes";
import { Componente, type Entidad } from "../core/Componente";
import type { AtaqueComponent } from "./AtaqueComponent";
import type { EventoComponent } from "./EventoComponent";
import type { FaseComponent } from "./FaseComponent";

export class EscenarioComponent extends Componente {
  constructor(
    public readonly id: number,
    public titulo: string,
    public descripcion: string,
    public presupuestoInicial: number,
    public zonas: Entidad[] = [],
    public ataques: AtaqueComponent[] = [],
    public fases: FaseComponent[] = [],
    public tipo: string = "escenario",
    public logsGenerales: LogGeneral[] = [],
    public apps: SoftwareApp[] = [],
    public eventos: EventoComponent[] = [],
    public redes: Entidad[] = [],
    public slug: string = "",
    public accionesEsperadas: unknown[] = [],
  ) {
    super();
  }
}
