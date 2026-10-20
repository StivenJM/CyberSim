CREATE TABLE "escenario" (
    "id_escenario" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR NOT NULL,
    "titulo" VARCHAR NOT NULL,
    "categoria" VARCHAR NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "escenario_pkey" PRIMARY KEY ("id_escenario"),
    CONSTRAINT "escenario_slug_key" UNIQUE ("slug")
);

CREATE TABLE "revision_escenario" (
    "id_revision_escenario" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_escenario" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "estado" VARCHAR NOT NULL,
    "manifest" JSONB NOT NULL,
    "content_hash" VARCHAR NOT NULL,
    "engine_version" VARCHAR NOT NULL,
    "asset_catalog_version" VARCHAR NOT NULL,
    "seed" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicado_en" TIMESTAMPTZ,
    CONSTRAINT "revision_escenario_pkey" PRIMARY KEY ("id_revision_escenario"),
    CONSTRAINT "revision_escenario_estado_check" CHECK ("estado" IN ('draft', 'validated', 'published', 'archived')),
    CONSTRAINT "revision_escenario_numero_check" CHECK ("numero" > 0),
    CONSTRAINT "revision_escenario_schema_version_check" CHECK ("schema_version" > 0),
    CONSTRAINT "revision_escenario_seed_check" CHECK ("seed" >= 0),
    CONSTRAINT "revision_escenario_numero_key" UNIQUE ("id_escenario", "numero"),
    CONSTRAINT "revision_escenario_hash_key" UNIQUE ("id_escenario", "content_hash")
);

CREATE INDEX "revision_escenario_estado_idx" ON "revision_escenario"("estado");

ALTER TABLE "revision_escenario"
    ADD CONSTRAINT "fk_revision_escenario"
    FOREIGN KEY ("id_escenario") REFERENCES "escenario"("id_escenario")
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "progreso"
    ADD COLUMN "id_revision_escenario" UUID,
    ADD COLUMN "revision_escenario_numero" INTEGER,
    ADD COLUMN "content_hash_escenario" VARCHAR;
CREATE INDEX "progreso_revision_escenario_idx" ON "progreso"("id_revision_escenario");
ALTER TABLE "progreso"
    ADD CONSTRAINT "fk_progreso_revision_escenario"
    FOREIGN KEY ("id_revision_escenario") REFERENCES "revision_escenario"("id_revision_escenario")
    ON DELETE SET NULL ON UPDATE NO ACTION;

INSERT INTO "escenario" ("slug", "titulo", "categoria", "descripcion") VALUES
('tutorial', 'Tutorial: Introducción a la Seguridad', 'Cap. 1 — Introducción', 'Tu primer día como administrador en TechStart. Aprende los tres pilares de la seguridad: Confidencialidad, Integridad y Disponibilidad (CIA).'),
('amenazas', 'Amenazas y Ataques Comunes', 'Cap. 1 — Introducción', 'Una consultora está bajo alerta. Bloquea accesos no autorizados con firewall y endurece los workstations para frenar un troyano.'),
('criptografia', 'Criptografía: Firma Digital y Comunicación Segura', 'Cap. 2 — Criptografía', 'El bufete Mendoza & Asociados recibe contratos firmados digitalmente. Verifica firmas con PKI, detecta alteraciones y establece un canal VPN cifrado.'),
('control-acceso', 'Control de Acceso y Protocolos Seguros', 'Cap. 3 — Autenticación', 'La universidad TechU debe proteger sus laboratorios de investigación. Aplica hardening, segmenta la red y habilita VPN autenticada para investigadores remotos.'),
('hacking-etico', 'Hacking Ético y Análisis de Vulnerabilidades', 'Cap. 5 — Administración de Riesgos', 'Eres Lisa Rodríguez, aficionada al hacking ético. Sigue las fases del proceso aplicando ingeniería social para obtener información de la empresa ''Corporación''.')
ON CONFLICT ("slug") DO NOTHING;

