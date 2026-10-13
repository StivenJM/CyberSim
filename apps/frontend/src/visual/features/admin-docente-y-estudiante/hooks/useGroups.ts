import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { useAsyncState } from "../../../common/hooks";

const API_URL = API_BASE_URL;

export interface Grupo {
  id_curso: number;
  id_profesor: number;
  nombre: string;
  codigo_acceso: string | null;
  codigo_expira: Date | null;
}

export interface Estudiante {
  id_estudiante: number;
  primernombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo_electronico: string;
  codigo_unico: number;
}

export const useGroups = (idProfesor: number | null) => {
  const { loading, error, runAsync } = useAsyncState();
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const fetchGrupos = useCallback(async () => {
    if (!idProfesor) return;
    const result = await runAsync(async () => {
      const response = await fetch(`${API_URL}/groups/profesor/${idProfesor}`);
      if (!response.ok) throw new Error("Error al obtener los grupos");
      return response.json();
    });
    if (result) setGrupos(result.data ?? []);
  }, [idProfesor, runAsync]);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  const createGrupo = async (nombre: string): Promise<boolean> => {
    if (!idProfesor) return false;
    const ok = await runAsync(async () => {
      const response = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profesor: idProfesor, nombre }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al crear el grupo");
      }
      return true;
    });
    if (ok) await fetchGrupos();
    return ok === true;
  };

  const updateGrupo = async (idCurso: number, nombre: string): Promise<boolean> => {
    const ok = await runAsync(async () => {
      const response = await fetch(`${API_URL}/groups/edit/${idCurso}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al actualizar el grupo");
      }
      return true;
    });
    if (ok) await fetchGrupos();
    return ok === true;
  };

  const deleteGrupo = async (idCurso: number): Promise<boolean> => {
    const ok = await runAsync(async () => {
      const response = await fetch(`${API_URL}/groups/delete/${idCurso}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al eliminar el grupo");
      }
      return true;
    });
    if (ok) await fetchGrupos();
    return ok === true;
  };

  const generateCode = async (idCurso: number): Promise<string | null> => {
    const codigo = await runAsync(async () => {
      const response = await fetch(`${API_URL}/groups/${idCurso}/generate-code`, {
        method: "POST",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al generar código");
      }
      const result = await response.json();
      return result.data.codigo_acceso as string;
    });
    if (codigo !== null) await fetchGrupos();
    return codigo;
  };

  const removeStudent = async (
    idCurso: number,
    idEstudiante: number
  ): Promise<boolean> => {
    if (!idProfesor) return false;
    const ok = await runAsync(async () => {
      const response = await fetch(
        `${API_URL}/groups/${idCurso}/remove-student/${idEstudiante}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_profesor: idProfesor }),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al eliminar estudiante");
      }
      return true;
    });
    return ok === true;
  };

  const getEstudiantesByGrupo = async (idCurso: number): Promise<Estudiante[]> => {
    const result = await runAsync(async () => {
      const response = await fetch(`${API_URL}/groups/${idCurso}/estudiantes`);
      if (!response.ok) throw new Error("Error al obtener estudiantes");
      return response.json();
    });
    return result?.data ?? [];
  };

  return {
    grupos,
    loading,
    error,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    generateCode,
    removeStudent,
    getEstudiantesByGrupo,
    refetch: fetchGrupos,
  };
};
