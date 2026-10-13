import type { Progreso, ProgresoInput, ProgresoConNombreEscenario, ProgresoResumen} from "../models/Progreso.js"

export interface IProgresoRepository {
  guardarProgresoEstudiante(data: ProgresoInput): Promise<Progreso>
  getProgresoEstudiante(idEstudiante: number, slugEscenario: string): Promise<ProgresoResumen | null>
  getTodosProgresosEstudiante(idEstudiante: number): Promise<ProgresoConNombreEscenario[]>
}
