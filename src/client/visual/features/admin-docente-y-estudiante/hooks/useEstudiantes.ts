import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { useAsyncData } from "../../../common/hooks";

const API_URL = API_BASE_URL;

interface Estudiante {
  id_estudiante: number;
  primernombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo_electronico: string;
  codigo_unico: number;
  id_profesor: number;
}

interface Progreso {
  id_progreso: number;
  id_estudiante: number;
  slug_escenario: string;
  nombre_escenario: string;
  terminado: boolean;
  tiempo: number | null;
  fecha_creacion?: string;
}

export type { Progreso };

export const useEstudiantes = (idProfesor: number | null) => {
  const { data, loading, error } = useAsyncData<Estudiante[]>(
    async () => {
      if (!idProfesor) return null;
      const response = await fetch(`${API_URL}/auth/profesor/${idProfesor}/estudiantes`);
      if (!response.ok) throw new Error("Error al obtener estudiantes");
      const result = await response.json();
      return result.data ?? [];
    },
    [idProfesor]
  );

  return { estudiantes: data ?? [], loading, error };
};

export const useProgresoEstudiante = (idEstudiante: number | null) => {
  const { data, loading, error } = useAsyncData<Progreso[]>(
    async () => {
      if (!idEstudiante) return null;
      const response = await fetch(`${API_URL}/progreso/estudiante/${idEstudiante}`);
      if (!response.ok) throw new Error("Error al obtener progresos");
      const result = await response.json();
      return result.data ?? [];
    },
    [idEstudiante]
  );

  return { progresos: data ?? [], loading, error };
};
