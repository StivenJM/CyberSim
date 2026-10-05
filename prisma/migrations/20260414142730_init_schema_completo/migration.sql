-- CreateTable
CREATE TABLE "curso" (
    "id_curso" SERIAL NOT NULL,
    "id_profesor" INTEGER NOT NULL,
    "nombre" VARCHAR NOT NULL,
    "codigo_acceso" VARCHAR,
    "codigo_expira" TIMESTAMP(6),

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "estudiante" (
    "id_estudiante" SERIAL NOT NULL,
    "codigo_unico" INTEGER NOT NULL,
    "primernombre" VARCHAR NOT NULL,
    "segundo_nombre" VARCHAR NOT NULL,
    "primer_apellido" VARCHAR NOT NULL,
    "segundo_apellido" VARCHAR NOT NULL,
    "id_usuario_auth" INTEGER,

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("id_estudiante")
);

-- CreateTable
CREATE TABLE "matricula" (
    "id_matricula" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "matricula_pkey" PRIMARY KEY ("id_matricula")
);

-- CreateTable
CREATE TABLE "profesor" (
    "id_profesor" SERIAL NOT NULL,
    "primernombre" VARCHAR NOT NULL,
    "segundo_nombre" VARCHAR NOT NULL,
    "primer_apellido" VARCHAR NOT NULL,
    "segundo_apellido" VARCHAR NOT NULL,
    "id_usuario_auth" INTEGER,

    CONSTRAINT "profesor_pkey" PRIMARY KEY ("id_profesor")
);

-- CreateTable
CREATE TABLE "progreso" (
    "id_progreso" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "slug_escenario" VARCHAR NOT NULL,
    "terminado" BOOLEAN DEFAULT false,
    "tiempo" DOUBLE PRECISION,
    "acciones" TEXT,

    CONSTRAINT "progreso_pkey" PRIMARY KEY ("id_progreso")
);

-- CreateTable
CREATE TABLE "usuario_auth" (
    "id_usuario_auth" SERIAL NOT NULL,
    "correo_electronico" VARCHAR NOT NULL,
    "contrasenia_hash" VARCHAR NOT NULL,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "token_confirmacion" VARCHAR,
    "token_recuperacion" VARCHAR,
    "token_expira" TIMESTAMP(6),
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_auth_pkey" PRIMARY KEY ("id_usuario_auth")
);

-- CreateTable
CREATE TABLE "retroalimentacion_estudiante" (
    "id_retro_est" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "slug_escenario" VARCHAR NOT NULL,
    "analisis" TEXT NOT NULL,
    "fortaleza" TEXT NOT NULL,
    "area_mejora" TEXT NOT NULL,
    "consejo" TEXT NOT NULL,
    "fecha" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retroalimentacion_estudiante_pkey" PRIMARY KEY ("id_retro_est")
);

-- CreateTable
CREATE TABLE "retroalimentacion_curso" (
    "id_retro_curso" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_profesor" INTEGER NOT NULL,
    "resumen" TEXT NOT NULL,
    "patrones" TEXT NOT NULL,
    "fortalezas" TEXT NOT NULL,
    "areas_mejora" TEXT NOT NULL,
    "recomendaciones" TEXT NOT NULL,
    "fecha" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retroalimentacion_curso_pkey" PRIMARY KEY ("id_retro_curso")
);

-- CreateIndex
CREATE UNIQUE INDEX "curso_codigo_acceso_key" ON "curso"("codigo_acceso");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_codigo_unico_key" ON "estudiante"("codigo_unico");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_id_usuario_auth_key" ON "estudiante"("id_usuario_auth");

-- CreateIndex
CREATE UNIQUE INDEX "profesor_id_usuario_auth_key" ON "profesor"("id_usuario_auth");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_auth_correo_electronico_key" ON "usuario_auth"("correo_electronico");

-- AddForeignKey
ALTER TABLE "curso" ADD CONSTRAINT "fk_curso_profesor" FOREIGN KEY ("id_profesor") REFERENCES "profesor"("id_profesor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "fk_estudiante_usuario_auth" FOREIGN KEY ("id_usuario_auth") REFERENCES "usuario_auth"("id_usuario_auth") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matricula" ADD CONSTRAINT "fk_matricula_curso" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matricula" ADD CONSTRAINT "fk_matricula_estudiante" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profesor" ADD CONSTRAINT "fk_profesor_usuario_auth" FOREIGN KEY ("id_usuario_auth") REFERENCES "usuario_auth"("id_usuario_auth") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "progreso" ADD CONSTRAINT "fk_progreso_estudiante" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "retroalimentacion_estudiante" ADD CONSTRAINT "fk_retro_estudiante" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "retroalimentacion_curso" ADD CONSTRAINT "fk_retro_curso" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE NO ACTION;
