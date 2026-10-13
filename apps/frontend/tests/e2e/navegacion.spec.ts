import { test, expect } from '@playwright/test';
import { sembrarSesion, mockDatosVacios } from './helpers/auth';

// Flujo troncal del estudiante: ver el mapa de niveles y entrar al laboratorio
// desde un nivel. Los escenarios provienen de datos locales (NivelController),
// así que la vista se renderiza sin backend; el progreso/leaderboard se silencian
// con mockDatosVacios.
test.describe('Selección y progresión de niveles', () => {
  test('el estudiante ve el mapa de niveles con sus estados', async ({ page }) => {
    await mockDatosVacios(page);
    await sembrarSesion(page, { role: 'estudiante', confirmado: true });

    await page.goto('/seleccion-niveles');

    // Sin progreso previo, el primer nodo es el sugerido ("Empezar") y hay
    // al menos un nivel disponible en el recorrido.
    await expect(page.getByRole('button', { name: /Disponible/ }).first()).toBeVisible();
    await expect(page.getByText('Empezar').first()).toBeVisible();
  });

  test('seleccionar un nivel entra al laboratorio', async ({ page }) => {
    await mockDatosVacios(page);
    await sembrarSesion(page, { role: 'estudiante', confirmado: true });

    await page.goto('/seleccion-niveles');

    // Abrir el primer nodo disponible y lanzarlo desde su tooltip.
    await page.getByRole('button', { name: /Disponible/ }).first().click();
    await page.getByRole('button', { name: 'Empezar' }).click();

    // El recorrido nos lleva a la ruta del juego ('/').
    await expect(page).toHaveURL(/\/$/);
  });
});
