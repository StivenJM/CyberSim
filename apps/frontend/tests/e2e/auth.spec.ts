import { test, expect } from '@playwright/test';
import { mockLogin, mockLoginInvalido, mockDatosVacios } from './helpers/auth';

test.describe('Autenticación', () => {
  test('login válido de estudiante redirige a selección de niveles', async ({ page }) => {
    await mockDatosVacios(page);
    await mockLogin(page, { role: 'estudiante', confirmado: true });

    await page.goto('/login');
    await page.getByPlaceholder('usuario@epn.edu.ec').fill('estudiante@epn.edu.ec');
    await page.getByPlaceholder('••••••••').fill('Password123');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/seleccion-niveles/);
  });

  test('login válido de profesor redirige al panel docente', async ({ page }) => {
    await mockDatosVacios(page);
    await mockLogin(page, { role: 'profesor', confirmado: true });

    await page.goto('/login');
    await page.getByPlaceholder('usuario@epn.edu.ec').fill('profesor@epn.edu.ec');
    await page.getByPlaceholder('••••••••').fill('Password123');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/docente/);
  });

  test('login inválido muestra error y no guarda token', async ({ page }) => {
    await mockLoginInvalido(page);

    await page.goto('/login');
    await page.getByPlaceholder('usuario@epn.edu.ec').fill('malo@epn.edu.ec');
    await page.getByPlaceholder('••••••••').fill('incorrecta');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
  });
});
