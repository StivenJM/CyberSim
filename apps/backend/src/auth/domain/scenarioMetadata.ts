const scenarioTitles: Record<string, string> = {
  tutorial: "Tutorial: Introducción a la Seguridad",
  amenazas: "Amenazas y Ataques Comunes",
  criptografia: "Criptografía: Firma Digital y Comunicación Segura",
  "control-acceso": "Control de Acceso y Protocolos Seguros",
  "hacking-etico": "Hacking Ético y Análisis de Vulnerabilidades",
};

export function getNombreEscenario(slug: string): string {
  return scenarioTitles[slug] ?? `Escenario: ${slug}`;
}
