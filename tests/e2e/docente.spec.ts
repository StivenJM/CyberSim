import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { sembrarSesion } from './helpers/auth';

// Vistas del docente: el profesor accede a su panel de cursos y consulta el
// detalle de un grupo. Se intercepta GET /groups/profesor/:id (el patrón cubre
// tanto la base "/api" como la URL absoluta del backend de dev) con un curso
// controlado; así la vista no depende del servidor.
const cursoMock = { id_curso: 1, nombre: 'Curso E2E', codigo_acceso: 'ABC123' };

async function mockApiDocente(page: Page) {
  await page.route('**/groups/profesor/**', (route) =>
    route.fulfill({ json: { success: true, data: [cursoMock] } }),
  );
}

test.describe('Vistas del docente', () => {
  test('el panel docente lista los cursos del profesor', async ({ page }) => {
    await mockApiDocente(page);
    await sembrarSesion(page, { role: 'profesor', confirmado: true });

    await page.goto('/docente');

    await expect(page.getByRole('heading', { name: 'Mis Cursos' })).toBeVisible();
    await expect(page.getByText('Curso E2E')).toBeVisible();
  });

  test('abrir un curso navega a su detalle', async ({ page }) => {
    await mockApiDocente(page);
    await sembrarSesion(page, { role: 'profesor', confirmado: true });

    await page.goto('/docente');

    await page.getByRole('button', { name: 'Abrir curso Curso E2E' }).click();

    await expect(page).toHaveURL(/\/docente\/grupo\/1/);
  });
});
