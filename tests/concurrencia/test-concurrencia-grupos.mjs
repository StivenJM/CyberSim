// ============================================================
// Prueba de concurrencia — Unión a grupo por código (CyberSim)

// Objetivo: verificar si el endpoint POST /groups/join permite
// que un mismo estudiante quede matriculado más de una vez
// cuando varias solicitudes llegan de forma simultánea.

const BASE_URL = process.env.CYBERSIM_API_URL || "URL_NO_DEFINIDA";

const CREDENCIALES_ESTUDIANTE = {
  correo_electronico: process.env.TEST_EMAIL || "CORREO",
  contrasenia: process.env.TEST_PASSWORD || "CONTRASENIA",
};

const NUM_SOLICITUDES_SIMULTANEAS = 10;

// ------------------------------------------------------------
// Utilidades

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDENCIALES_ESTUDIANTE),
  });

  if (!res.ok) {
    throw new Error(`Login falló con status ${res.status}`);
  }

  const data = await res.json();
  return data; // se espera { token, role, id_estudiante, ... }
}

async function intentarUnirseAGrupo(token, codigoAcceso, idEstudiante, intentoNum) {
  const inicio = performance.now();

  try {
    const res = await fetch(`${BASE_URL}/groups/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo_acceso: codigoAcceso,
        id_estudiante: idEstudiante,
      }),
    });

    const duracionMs = Math.round(performance.now() - inicio);
    const body = await res.json().catch(() => ({}));

    return {
      intento: intentoNum,
      status: res.status,
      ok: res.ok,
      mensaje: body?.message || body?.error || JSON.stringify(body),
      duracionMs,
    };
  } catch (err) {
    const duracionMs = Math.round(performance.now() - inicio);
    return {
      intento: intentoNum,
      status: "ERROR_RED",
      ok: false,
      mensaje: err.message,
      duracionMs,
    };
  }
}

// ------------------------------------------------------------
// Limpieza previa: salir del grupo si ya está matriculado
// (para que la prueba parta de un estado limpio y repetible)

async function salirDeGrupoSiExiste(token, idEstudiante) {
  try {
    // Primero consultamos en qué grupo está, si en alguno
    const res = await fetch(`${BASE_URL}/groups/estudiante/${idEstudiante}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const cursos = await res.json();
    if (Array.isArray(cursos) && cursos.length > 0) {
      for (const curso of cursos) {
        await fetch(`${BASE_URL}/groups/leave/${curso.id_curso}/${idEstudiante}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`  (Limpieza) Estudiante removido del curso ${curso.id_curso}`);
      }
    }
  } catch (err) {
    console.log("  (Limpieza) No se pudo verificar/limpiar matrícula previa:", err.message);
  }
}

// ------------------------------------------------------------
// Ejecución principal

async function main() {
  const CODIGO_ACCESO = process.env.TEST_CODIGO || "CODIGO_DE_PRUEBA";

  console.log("=== Prueba de concurrencia: unión a grupo ===\n");

  console.log("1. Iniciando sesión como estudiante de prueba...");
  const sesion = await login();
  
  const token = sesion.data.token;
  const idEstudiante = sesion.data.user.id_estudiante;
  console.log(`   Sesión iniciada. id_estudiante=${idEstudiante}\n`);

  console.log("2. Verificando y limpiando matrícula previa...");
  await salirDeGrupoSiExiste(token, idEstudiante);
  console.log("   Estado limpio.\n");

  console.log(`3. Disparando ${NUM_SOLICITUDES_SIMULTANEAS} solicitudes simultáneas de unión con el código "${CODIGO_ACCESO}"...\n`);

  const solicitudes = Array.from({ length: NUM_SOLICITUDES_SIMULTANEAS }, (_, i) =>
    intentarUnirseAGrupo(token, CODIGO_ACCESO, idEstudiante, i + 1)
  );

  const resultados = await Promise.all(solicitudes);

  console.log("=== Resultados individuales ===");
  resultados
    .sort((a, b) => a.intento - b.intento)
    .forEach((r) => {
      console.log(
        `  Intento ${r.intento}: status=${r.status} | ok=${r.ok} | ${r.duracionMs}ms | ${r.mensaje}`
      );
    });

  const exitosas = resultados.filter((r) => r.ok);
  const fallidas = resultados.filter((r) => !r.ok);

  console.log("\n=== Resumen ===");
  console.log(`Total de solicitudes enviadas: ${resultados.length}`);
  console.log(`Solicitudes exitosas (matrícula creada): ${exitosas.length}`);
  console.log(`Solicitudes rechazadas: ${fallidas.length}`);

  if (exitosas.length > 1) {
    console.log(
      "\n⚠ RESULTADO: se detectó una condición de carrera. Más de una solicitud logró crear una matrícula para el mismo estudiante de forma simultánea."
    );
  } else if (exitosas.length === 1) {
    console.log(
      "\n✓ RESULTADO: comportamiento correcto. Solo una solicitud tuvo éxito; las demás fueron rechazadas correctamente."
    );
  } else {
    console.log(
      "\n? RESULTADO: ninguna solicitud tuvo éxito. Verifica que el código de acceso usado sea válido y no haya expirado."
    );
  }

  console.log("\n4. Verificación posterior en base de datos...");
  const resVerif = await fetch(`${BASE_URL}/groups/estudiante/${idEstudiante}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const cursosFinales = await resVerif.json().catch(() => []);
  console.log(
    `   Cursos en los que quedó matriculado el estudiante tras la prueba: ${
      Array.isArray(cursosFinales) ? cursosFinales.length : "no determinado"
    }`
  );
  console.log(JSON.stringify(cursosFinales, null, 2));
}

main().catch((err) => {
  console.error("\nError fatal en la ejecución de la prueba:", err);
  process.exit(1);
});
