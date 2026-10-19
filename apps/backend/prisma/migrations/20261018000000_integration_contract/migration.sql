CREATE TABLE "revision_indice_conocimiento" (
 "id" UUID PRIMARY KEY, "installation_id" UUID NOT NULL, "estado" TEXT NOT NULL DEFAULT 'preparacion',
 "firma" JSONB NOT NULL, "colecciones" JSONB NOT NULL, "inventario" JSONB NOT NULL DEFAULT '{}',
 "calibracion" JSONB NOT NULL DEFAULT '{}', "creado_en" TIMESTAMPTZ NOT NULL DEFAULT now(), "publicado_en" TIMESTAMPTZ
);
CREATE TABLE "coordinacion_integracion" (
 "id" INTEGER PRIMARY KEY CHECK ("id" = 1), "installation_id" UUID NOT NULL DEFAULT gen_random_uuid(),
 "generacion" INTEGER NOT NULL DEFAULT 1, "pausada" BOOLEAN NOT NULL DEFAULT false,
 "activa" UUID, "esperando" UUID, "revision_id" UUID REFERENCES "revision_indice_conocimiento"("id"),
 "exclusiones_version" INTEGER NOT NULL DEFAULT 0, "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "operacion_integracion" (
 "id" UUID PRIMARY KEY, "installation_id" UUID NOT NULL, "generacion" INTEGER NOT NULL,
 "actor" TEXT NOT NULL, "request_id" TEXT NOT NULL, "clase" TEXT NOT NULL,
 "estado" TEXT NOT NULL CHECK ("estado" IN ('esperando','activa','completada','fallida','cancelada','incierta')),
 "huella" TEXT NOT NULL, "deadline" TIMESTAMPTZ NOT NULL, "revision_id" UUID,
 "ejecucion_n8n" TEXT, "hija" JSONB, "uso" JSONB NOT NULL DEFAULT '{}',
 "resultado_ref" JSONB, "error" TEXT, "creado_en" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE ("installation_id","actor","request_id")
);
CREATE INDEX "operacion_estado" ON "operacion_integracion"("estado","deadline");
CREATE TABLE "documento_conocimiento" (
 "id" TEXT PRIMARY KEY, "origen" TEXT NOT NULL, "revision" TEXT NOT NULL, "hash" TEXT NOT NULL,
 "tipo" TEXT NOT NULL, "estado" TEXT NOT NULL, "metadata" JSONB NOT NULL DEFAULT '{}',
 "confirmaciones" INTEGER NOT NULL DEFAULT 0, "observado_en" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "retirado_en" TIMESTAMPTZ, "ronda" UUID
);

