export interface EsquemaConfigWorkstation {
    nombreConfig: string,
    costoActivacion: number,
    activado: boolean
}

export const ConfiguracionWorkstation: ReadonlyArray<EsquemaConfigWorkstation> = Object.freeze([
    { "nombreConfig": "Actualizaciones automáticas de antivirus", "costoActivacion": 40, "activado": false},
    { "nombreConfig": "Antivirus gestionado", "costoActivacion": 40, "activado": false},
    { "nombreConfig": "Usuario aplica parches", "costoActivacion": 35, "activado": false},
    { "nombreConfig": "Actualización automática de parches", "costoActivacion": 20, "activado": false},
    { "nombreConfig": "Actualizar parches al publicarse", "costoActivacion": 35, "activado": false},
    { "nombreConfig": "Actualización regular de parches", "costoActivacion": 30, "activado": false},
    { "nombreConfig": "Aplicar política de contraseñas", "costoActivacion": 35, "activado": true},
    { "nombreConfig": "Usar contraseña única", "costoActivacion": 20, "activado": true},
    { "nombreConfig": "Bloqueo automático por inactividad", "costoActivacion": 10, "activado": true},
    { "nombreConfig": "Bloquear o cerrar sesión por inactividad", "costoActivacion": 10, "activado": true},
    { "nombreConfig": "Bloquear medios extraíbles", "costoActivacion": 20, "activado": false},
    { "nombreConfig": "Bloquear almacenamiento local", "costoActivacion": 25, "activado": false},
    { "nombreConfig": "Cuidado con adjuntos de email", "costoActivacion": 30, "activado": false},
    { "nombreConfig": "Sin software externo", "costoActivacion": 25, "activado": false}
]);
