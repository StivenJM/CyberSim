import type { Page } from '@playwright/test';

// Helpers de sesión para E2E. La idea es no depender del backend: sembramos el
// localStorage que leen ProtectedRoute/ProtectedRouteByRole, o interceptamos
// /auth/login cuando el test sí ejercita el formulario.

export type Rol = 'estudiante' | 'profesor';

interface SesionMock {
  role?: Rol;
  confirmado?: boolean;
}

const TOKEN_FALSO = 'e2e-token';

export function usuarioMock(role: Rol) {
  return {
    id: role === 'profesor' ? 'prof-1' : 'est-1',
    nombre_completo: role === 'profesor' ? 'Profe Test' : 'Estudiante Test',
    correo_electronico: `${role}@epn.edu.ec`,
    rol: role,
    ...(role === 'profesor' ? { id_profesor: 1 } : { id_estudiante: 1 }),
  };
}

// Siembra el localStorage antes de que cargue la app para pasar las rutas
// protegidas sin ejecutar el login real.
export async function sembrarSesion(page: Page, { role = 'estudiante', confirmado = true }: SesionMock = {}) {
  await page.addInitScript(
    ({ token, role, confirmado, user }) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('emailConfirmado', String(confirmado));
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token: TOKEN_FALSO, role, confirmado, user: usuarioMock(role) },
  );
}

// Intercepta POST /auth/login devolviendo una respuesta controlada exitosa.
export async function mockLogin(page: Page, { role = 'estudiante', confirmado = true }: SesionMock = {}) {
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      json: { success: true, data: { token: TOKEN_FALSO, role, confirmado, user: usuarioMock(role) } },
    }),
  );
}

export async function mockLoginInvalido(page: Page) {
  await page.route('**/auth/login', (route) =>
    route.fulfill({ status: 401, json: { success: false, error: 'Credenciales inválidas' } }),
  );
}

// Silencia las GET de datos de las vistas post-login para que no dependan del backend.
export async function mockDatosVacios(page: Page) {
  await page.route('**/api/**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { success: true, data: [] } });
    }
    return route.continue();
  });
}
