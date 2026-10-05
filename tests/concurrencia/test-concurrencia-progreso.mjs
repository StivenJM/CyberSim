// ============================================================
// Prueba de concurrencia — Guardado de progreso (CyberSim)

// Objetivo: verificar que el sistema responda correctamente
// cuando múltiples solicitudes de guardado de progreso para el
// mismo estudiante y escenario llegan de forma simultánea,
// sin errores ni pérdida de datos

const BASE_URL = process.env.CYBERSIM_API_URL || "URL";

const CREDENCIALES_ESTUDIANTE = {
  correo_electronico: process.env.TEST_EMAIL || "CORREO",
  contrasenia: process.env.TEST_PASSWORD || "CONTRASENIA",
};

const NUM_SOLICITUDES_SIMULTANEAS = 10;
const SLUG_ESCENARIO = process.env.TEST_SLUG || "ESCENARIO";

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDENCIALES_ESTUDIANTE),
  });
  if (!res.ok) throw new Error(`Login falló con status ${res.status}`);
  return res.json();
}

async function enviarProgreso(token, idEstudiante, intentoNum) {
  const inicio = performance.now();

  try {
    const res = await fetch(`${BASE_URL}/progreso`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id_estudiante: idEstudiante,
        slug_escenario: SLUG_ESCENARIO,
        terminado: true,
        tiempo: 60 + intentoNum, // tiempo distinto por intento para identificarlos luego
        acciones: JSON.stringify({
          accionesEsperadas: [],
          accionesRealizadas: [{ accion: "click", objeto: "prueba-concurrencia", tiempo: intentoNum }],
        }),
      }),
    });

    const duracionMs = Math.round(performance.now() - inicio);
    const body = await res.json().catch(() => ({}));

    return {
      intento: intentoNum,
      status: res.status,
      ok: res.ok,
      idProgreso: body?.data?.id_progreso,
      mensaje: body?.message || body?.error || "",
      duracionMs,
    };
    
  } catch (err) {
    const duracionMs = Math.round(performance.now() - inicio);
    return { intento: intentoNum, status: "ERROR_RED", ok: false, mensaje: err.message, duracionMs };
  }
}

async function main() {
  console.log("=== Prueba de concurrencia: guardado de progreso ===\n");

  console.log("1. Iniciando sesión como estudiante de prueba...");
  const sesion = await login();

  const token = sesion.data.token;
  const idEstudiante = sesion.data.user.id_estudiante;
  console.log(`   Sesión iniciada. id_estudiante=${idEstudiante}\n`);

  console.log(`2. Disparando ${NUM_SOLICITUDES_SIMULTANEAS} solicitudes simultáneas de guardado de progreso...\n`);

  const solicitudes = Array.from({ length: NUM_SOLICITUDES_SIMULTANEAS }, (_, i) =>
    enviarProgreso(token, idEstudiante, i + 1)
  );

  const resultados = await Promise.all(solicitudes);

  console.log("=== Resultados individuales ===");
  resultados
    .sort((a, b) => a.intento - b.intento)
    .forEach((r) => {
      console.log(
        `  Intento ${r.intento}: status=${r.status} | ok=${r.ok} | id_progreso=${r.idProgreso ?? "-"} | ${r.duracionMs}ms`
      );
    });

  const exitosas = resultados.filter((r) => r.ok);
  const idsUnicos = new Set(exitosas.map((r) => r.idProgreso).filter(Boolean));

  console.log("\n=== Resumen ===");
  console.log(`Total de solicitudes enviadas: ${resultados.length}`);
  console.log(`Solicitudes exitosas: ${exitosas.length}`);
  console.log(`Registros con id_progreso único generados: ${idsUnicos.size}`);

  if (exitosas.length === NUM_SOLICITUDES_SIMULTANEAS && idsUnicos.size === NUM_SOLICITUDES_SIMULTANEAS) {
    console.log(
      "\n RESULTADO: el sistema procesó correctamente todas las solicitudes concurrentes, generando un registro independiente y consistente para cada una."
    );
  } else {
    console.log(
      "\n RESULTADO: no todas las solicitudes se completaron o generaron registros independientes. Revisar el detalle individual arriba."
    );
  }
}

main().catch((err) => {
  console.error("\nError fatal en la ejecución de la prueba:", err);
  process.exit(1);
});
