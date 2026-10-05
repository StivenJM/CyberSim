import { test, expect } from '@playwright/test';
import { sembrarSesion, mockDatosVacios } from './helpers/auth';
import { escenarioMock } from './fixtures/escenarioMock';

test.describe('Escenario (con mock)', () => {
  // @slow: depende de WebGL (SwiftShader en CI headless). Se corre aparte y no
  // bloquea el pipeline si la GPU por software falla.
  test('inyecta el escenario mock y monta la escena 3D en /', { tag: '@slow' }, async ({ page }) => {
    await mockDatosVacios(page);
    await sembrarSesion(page, { role: 'estudiante', confirmado: true });

    // Inyecta el escenario controlado vía el seam de SelectedLevelContext.
    await page.addInitScript((esc) => {
      (window as unknown as { __E2E_ESCENARIO__?: unknown }).__E2E_ESCENARIO__ = esc;
    }, escenarioMock as object);

    await page.goto('/');

    // No nos echó a /login ni a selección: estamos dentro del juego.
    await expect(page).toHaveURL(/\/$/);
    // La escena 3D montó su canvas sin crashear.
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15_000 });
  });
});
