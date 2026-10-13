export const LogCategory = {
  ATAQUE: "ATAQUE",
  ADVERTENCIA: "ADVERTENCIA",
  COMPLETADO: "COMPLETADO",
  INFORMACION: "INFORMACION",
} as const;

export type LogCategory = (typeof LogCategory)[keyof typeof LogCategory];
