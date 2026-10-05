import { ColoresRed } from "../../data/colores";
import { ConfiguracionProtocolos } from "../../data/configuraciones/configProtocolos";
import { ConfiguracionWorkstation } from "../../data/configuraciones/configWorkstation";
/**
 * Convierte el array de configuraciones a formato de lista
 */
export function obtenerConfiguracionesWorkstation() {
  return ConfiguracionWorkstation.map(({ nombreConfig, costoActivacion }) => ({
    configuracion: nombreConfig,
    precio: costoActivacion,
  }));
}

export function obtenerConfiguracionesProtocolos() {
  return ConfiguracionProtocolos;
}

export function obtenerColoresRed() {
  return ColoresRed;
}
