# Guía de Desarrollo

## Requisitos

- [Node.js](https://nodejs.org/) >= 20.19.0
- PostgreSQL disponible y configurado mediante las variables de conexión del backend

## Configuración Inicial (solo una vez)

```bash
git clone https://github.com/TIC-GR17-2025B/TIC-Laboratorios-GR17.git
cd TIC-Laboratorios-GR17
npm install
cp apps/backend/.env.example apps/backend/.env
```

Completá las variables de `apps/backend/.env` con la conexión a PostgreSQL y los servicios utilizados. Luego sincronizá el esquema:

```bash
npm run db:push --workspace @cybersim/backend
```

## Desarrollo

Abrí dos terminales desde la raíz del repositorio:

```bash
# Terminal del frontend
npm run dev --workspace @cybersim/frontend
```

```bash
# Terminal del backend
npm run dev --workspace @cybersim/backend
```

También podés entrar a `apps/frontend` o `apps/backend` y ejecutar `npm run dev` directamente. Los scripts de cada aplicación están definidos en su propio workspace; la raíz mantiene la instalación conjunta de dependencias.

El backend requiere PostgreSQL disponible en la conexión configurada.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
