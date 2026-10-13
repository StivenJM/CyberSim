# Guía de Desarrollo

## Requisitos

- [Node.js](https://nodejs.org/) >= 20.19.0
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Configuración Inicial (solo una vez)

```bash
git clone https://github.com/TIC-GR17-2025B/TIC-Laboratorios-GR17.git
cd TIC-Laboratorios-GR17
npm install
cp apps/backend/.env.example apps/backend/.env
npm run docker:up
npm run db:push
```

## Desarrollo

```bash
npm run dev
```

Requiere Docker Desktop abierto.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
