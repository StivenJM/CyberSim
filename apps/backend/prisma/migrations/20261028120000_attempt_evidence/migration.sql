-- Evidencia de intentos de los cinco ejercicios investigados.
-- Migración aditiva: no altera ni elimina tablas existentes y no toca `progreso`.
CREATE TABLE "intento_evidencia" (
    "id_intento" VARCHAR(64) NOT NULL,
    "actor_pseudonym" VARCHAR(64) NOT NULL,
    "case_id" VARCHAR(64) NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(32) NOT NULL,
    "content_hash" VARCHAR(80) NOT NULL,
    "record" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "intento_evidencia_pkey" PRIMARY KEY ("id_intento")
);

CREATE INDEX "intento_evidencia_actor_pseudonym_idx" ON "intento_evidencia"("actor_pseudonym");
