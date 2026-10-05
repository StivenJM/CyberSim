-- ===========================================
-- Script de inicialización para Docker
-- ===========================================
-- Este script se ejecuta automáticamente cuando
-- se crea el contenedor por primera vez.
--
-- Las tablas reales las crea Prisma con migrate.
-- Aquí solo configuramos extensiones si es necesario.
-- ===========================================

-- Habilitar extensión UUID si se necesita
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos cybersim inicializada correctamente';
END $$;
