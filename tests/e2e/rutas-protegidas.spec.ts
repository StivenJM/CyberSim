import { test, expect } from '@playwright/test';
import { sembrarSesion, mockDatosVacios } from './helpers/auth';

test.describe('Rutas protegidas y roles', () => {
  test('sin sesión, una ruta de juego redirige a /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('sin sesión, /redes redirige a /login', async ({ page }) => {
    await page.goto('/redes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('un estudiante no puede entrar al panel docente', async ({ page }) => {
    await mockDatosVacios(page);
    await sembrarSesion(page, { role: 'estudiante', confirmado: true });

    await page.goto('/docente');
    await expect(page).toHaveURL(/\/seleccion-niveles/);
  });

  test('sesión sin email confirmado va a /verificar-email', async ({ page }) => {
    await sembrarSesion(page, { role: 'estudiante', confirmado: false });

    await page.goto('/');
    await expect(page).toHaveURL(/\/verificar-email/);
  });
});
