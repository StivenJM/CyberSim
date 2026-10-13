import { API_BASE_URL } from "../../shared/config/apiConfig";

export class ProgresoController {

  private API_URL = API_BASE_URL;

  private static instance: ProgresoController | null = null;

  public static getInstance(): ProgresoController {
    if (!ProgresoController.instance) {
      ProgresoController.instance = new ProgresoController();
    }
    return ProgresoController.instance;
  }

  public async guardarProgresoEstudiante(
      terminado: boolean,
      tiempo: number,
      accionesEsperadas: unknown[],
      accionesRealizadas: [string, string, number | undefined, unknown?][]
  ) {

    const {id_estudiante, slug_escenario} = await this.getDatosSesion();
    const acciones = this.formatearAcciones(accionesEsperadas ?? [], accionesRealizadas ?? []);
    const data = {
      id_estudiante: id_estudiante,
      slug_escenario: slug_escenario,
      terminado: terminado,
      tiempo: tiempo,
      acciones: acciones
    };

    try {
      const response = await fetch(`${this.API_URL}/progreso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        console.error(
          `Error del servidor: No se recibió una respuesta JSON válida.`
        );
        return null;
      }

    } catch (err) {
      console.error("Error completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      console.error(
        `${errorMessage}. ¿Está el servidor backend corriendo en /progreso?`
      );
      return null;
    }
  }

  public async getProgresoEstudiante(
    id_estudiante: number,
    slug_escenario: string
  ): Promise<{
      terminado: boolean;
      intentos: number;
  } | null> {

    try {
      const response = await fetch(`${this.API_URL}/progreso/estudiante/${id_estudiante}/escenario/${slug_escenario}`, {
        method: "GET",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        console.error(
          `Error del servidor: No se recibió una respuesta JSON válida.`
        );
        return null;
      }

      return await response.json();

    } catch (err) {
      console.error("Error completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión";
      console.error(
        `${errorMessage}. ¿Está el servidor backend corriendo en /progreso?`
      );
      return null;
    }
  }

  private async getDatosSesion(): Promise<{id_estudiante: number; slug_escenario: string}> {
    const id_estudiante = JSON.parse(localStorage.getItem("user")!).id_estudiante;
    const slug_escenario = localStorage.getItem("slug_escenario_actual")!;
    return { id_estudiante, slug_escenario };
  }

  private formatearAcciones(
      accionesEsperadas: unknown[],
      accionesRealizadas: [string, string, number | undefined, unknown?][]
  ) {
    let resultado = "{\"accionesEsperadas\":[";

    for (let i = 0; i < accionesEsperadas.length; i++) {
      if (i < accionesEsperadas.length - 1) resultado += `${JSON.stringify(accionesEsperadas[i])},`;
      else resultado += `${JSON.stringify(accionesEsperadas[i])}`;
    }

    resultado += "],\"accionesRealizadas\":[";

    for (let i = 0; i < accionesRealizadas.length; i++) {
      resultado += `{"accion":"${accionesRealizadas[i][0]}",`;
      resultado += `"objeto":"${accionesRealizadas[i][1]}",`;
      resultado += `"tiempo":${accionesRealizadas[i][2]},`;

      if (i < accionesRealizadas.length - 1) resultado += `"val":${JSON.stringify(accionesRealizadas[i][3])}},`;
      else resultado += `"val":${JSON.stringify(accionesRealizadas[i][3])}}`;
    }

    resultado += "]}";

    return resultado;
  }
}
