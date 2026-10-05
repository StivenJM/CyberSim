export function generarCodigoAcceso(length: number = 8): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres[randomIndex];
  }
  
  return codigo;
}

export function generarFechaExpiracion(dias: number = 7): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

export function generarCodigoConExpiracion(
  longitudCodigo: number = 8,
  diasExpiracion: number = 7
) {
  return {
    codigo_acceso: generarCodigoAcceso(longitudCodigo),
    codigo_expira: generarFechaExpiracion(diasExpiracion),
  };
}