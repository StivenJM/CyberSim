// Catálogo de metadatos de escenarios para el backend.
// Fuente de verdad: los archivos escenario*.ts en este directorio.
// Si agregas/renombras un escenario, actualiza este mapa.

interface EscenarioMeta {
  slug: string;
  titulo: string;
}

const escenarioMap = new Map<string, EscenarioMeta>([
  [
    "tutorial",
    { slug: "tutorial", titulo: "Tutorial: Introducción a la Seguridad" },
  ],
  ["amenazas", { slug: "amenazas", titulo: "Amenazas y Ataques Comunes" }],
  [
    "criptografia",
    {
      slug: "criptografia",
      titulo: "Criptografía: Firma Digital y Comunicación Segura",
    },
  ],
  /*[
    "certificados",
    { slug: "certificados", titulo: "Certificados Digitales y PKI" },
  ],*/
  /*[
    "autenticacion",
    { slug: "autenticacion", titulo: "Autenticación y Control de Acceso" },
  ],*/
  [
    "control-acceso",
    {
      slug: "control-acceso",
      titulo: "Control de Acceso y Protocolos Seguros",
    },
  ],
  /*[
    "redes",
    {
      slug: "redes",
      titulo: "Seguridad de Redes: Firewall, Segmentación y VPN",
    },
  ],*/
  /*[
    "segmentacion-pci",
    {
      slug: "segmentacion-pci",
      titulo: "Segmentación PCI-DSS: Empresa Retail",
    },
  ],*/
  [
    "hacking-etico",
    {
      slug: "hacking-etico",
      titulo: "Hacking Ético y Análisis de Vulnerabilidades",
    },
  ],
  /*[
    "ransomware",
    {
      slug: "ransomware",
      titulo: "Gestión de Riesgos: Respuesta a Incidentes",
    },
  ],*/
  /*[
    "auditoria",
    { slug: "auditoria", titulo: "Auditoría de Seguridad Empresarial" },
  ],*/
  /*["iot", { slug: "iot", titulo: "Seguridad IoT e Infraestructura Crítica" }],*/
]);

export function getNombreEscenario(slug: string): string {
  return escenarioMap.get(slug)?.titulo ?? `Escenario: ${slug}`;
}

export { escenarioMap };
