import type { SoftwareApp } from "../shared/types/EscenarioTypes";

/** Catálogo global de aplicaciones disponibles en todos los escenarios. */
export const APPS: SoftwareApp[] = [
  {
    nombre: "Net-Scan Viz",
    descripcion: "Aplicación de escaneo de dispositivos en un dominio.",
    precio: 0,
  },
  {
    nombre: "Company Social-Searcher",
    descripcion:
      "Aplicación OSINT para obtener información de empleados de una empresa.",
    precio: 0,
  },
  {
    nombre: "Phish-Matic",
    descripcion: "Aplicación para enviar correos tipo phishing.",
    precio: 0,
  },
  {
    nombre: "FirmaChecker",
    descripcion: "Verificador de firmas digitales en documentos.",
    precio: 0,
  },
];
