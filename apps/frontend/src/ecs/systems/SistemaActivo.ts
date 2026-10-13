import { AccionesRealizables, ObjetosManejables } from "../../shared/types/AccionesEnums";
import type { Activo, RegistroVeredictoFirma } from "../../shared/types/EscenarioTypes";
// import { ActivoComponent } from "../components";
import { Sistema/*, type ClaseComponente*/ } from "../core";
import { SistemaTiempo } from "./SistemaTiempo";

export class SistemaActivo extends Sistema {
    // public componentesRequeridos: Set<ClaseComponente> = new Set([ActivoComponent]);
    public registroVeredictosFirmas: Array<RegistroVeredictoFirma> = [];

    public async calcularHashDocumento(contenido: string) {
      return await this.calcularHash(contenido);
    }

    // Verifica primero el propietario de la firma y de la clave, si coinciden entonces
    // se calcula el hash del contenido de la firma (que es el mismo contenido del docuemento),
    // por lo cual el hash saliente será igual al del documento.
    // Si los propietarios no coinciden, entonces se extrae el hash del nombre de la clave,
    // lo cual dará un hash diferente al del documento.
    public async calcularHashFirma(firma: Activo, clave: Activo) {
      return firma.propietario == clave.propietario ? 
        await this.calcularHash(firma.contenido!) :
        await this.calcularHash(clave.nombre!);
    }

    public registrarVeredictoFirma(registro: RegistroVeredictoFirma) {
      this.registroVeredictosFirmas.push(registro);
      this.ecsManager.registrarAccion(
          AccionesRealizables.AGREGAR,
          ObjetosManejables.VEREDICTO_FIRMA_DIGITAL,
          this.getTiempoSimulacion(),
          {
            nombreDocumento: registro.nombreDocumento,
            nombreFirma: registro.nombreFirma,
            nombreClave: registro.nombreClave,
            veredicto: registro.veredicto
          }
      );
    }

    // Calcula el hash con SHA256 de la entrada que se proporcione.
    // Por simplicidad para el jugador, se devuelven sólo los primeros 15 caracteres del hash.
    private async calcularHash(texto: string) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(texto);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0,15);
    }

    private getTiempoSimulacion(): number | undefined {
      return this.ecsManager.getSistema(SistemaTiempo)?.getTiempoSimulacion();
    }
}
