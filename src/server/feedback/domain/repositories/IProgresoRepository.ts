export interface IProgresoRepository {
  countByEstudianteYEscenario(idEstudiante: number, slugEscenario: string): Promise<number>;
}
