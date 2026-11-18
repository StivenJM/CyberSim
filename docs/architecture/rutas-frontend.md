# Rutas del frontend

Rutas registradas en [`main.tsx`](../../apps/frontend/src/visual/main.tsx): 15 rutas y un comodín para páginas no encontradas.

La columna **Acceso** distingue entre Público (sin sesión obligatoria) y Privado (sesión iniciada y correo confirmado). **Docente** corresponde al rol `profesor` del código. ✅ indica que el control de acceso permite ese rol y ❌ que lo rechaza. En las rutas públicas ambos roles tienen acceso, al igual que los visitantes sin sesión.

| Ruta | Pantalla o función | Acceso | Docente | Estudiante |
|---|---|---|:---:|:---:|
| `/login` | Iniciar sesión | Público | ✅ | ✅ |
| `/signup` | Registrarse | Público | ✅ | ✅ |
| `/verificar-email` | Verificación del correo | Público | ✅ | ✅ |
| `/auth/confirm` | Confirmar el correo mediante token | Público | ✅ | ✅ |
| `/recuperar-contrasenia` | Solicitar recuperación de contraseña | Público | ✅ | ✅ |
| `/auth/reset-password` | Establecer una nueva contraseña | Público | ✅ | ✅ |
| `/docente` | Panel del docente | Privado | ✅ | ❌ |
| `/docente/grupo/:id` | Detalle de un grupo | Privado | ✅ | ❌ |
| `/docente/estudiante/:idEstudiante` | Detalle de un estudiante | Privado | ✅ | ❌ |
| `/seleccion-niveles` | Selección de niveles | Privado | ❌ | ✅ |
| `/perfil` | Perfil del usuario | Privado | ❌ | ✅ |
| `/` | Oficina del simulador | Privado | ✅ | ✅ |
| `/dispositivos` | Gestión y protección de dispositivos | Privado | ✅ | ✅ |
| `/redes` | Simulación de redes | Privado | ✅ | ✅ |
| `/fases-partida` | Fases de la partida | Privado | ✅ | ✅ |
| `*` | Página no encontrada para cualquier otra ruta | Público | ✅ | ✅ |

## Condiciones de acceso

- [`ProtectedRoute`](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/components/ProtectedRoute.tsx) protege las cuatro rutas del juego (`/`, `/dispositivos`, `/redes` y `/fases-partida`). Exige sesión y correo confirmado, sin restringir el rol.
- [`ProtectedRouteByRole`](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/components/ProtectedRouteByRole.tsx) añade la comprobación de rol a las rutas de docente y estudiante. Si el rol no coincide, redirige al panel correspondiente.
- Los controles privados redirigen a `/login` si falta la sesión y a `/verificar-email` si el correo no está confirmado.
- Las marcas de la tabla describen los permisos del enrutador. Las rutas del juego también necesitan un escenario en memoria: [`EscenarioProvider`](../../apps/frontend/src/visual/common/contexts/EscenarioContext.tsx) redirige a `/seleccion-niveles` cuando falta. Esa pantalla solo admite estudiantes, por lo que un docente sin escenario termina redirigido a `/docente`.
- Los segmentos `:id` y `:idEstudiante` son parámetros variables; por ejemplo, `/docente/grupo/12`.

Para la organización de componentes y estado, consultar [Frontend](frontend.md).
