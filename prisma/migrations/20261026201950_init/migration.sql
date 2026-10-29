-- Purpose: Crea el esquema inicial de usuarios, inmuebles, publicaciones y operaciones de renta.
-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "contrasena" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "telefono" TEXT,
    "foto_perfil" TEXT,
    "verificado_email" BOOLEAN NOT NULL DEFAULT false,
    "email_token" TEXT,
    "email_token_expira" TIMESTAMP(3),
    "ultimo_acceso" TIMESTAMP(3),
    "preferencias_email" JSONB,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propietario" (
    "usuario_id" INTEGER NOT NULL,
    "estado_verificacion" TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "Propietario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "Inquilino" (
    "usuario_id" INTEGER NOT NULL,
    "estado_verificacion" TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "usuario_id" INTEGER NOT NULL,
    "nivel_acceso" TEXT NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "Inmueble" (
    "id" SERIAL NOT NULL,
    "propietario_id" INTEGER NOT NULL,
    "tipo_inmueble" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "numero_habitaciones" INTEGER NOT NULL,
    "numero_banos" INTEGER NOT NULL,
    "metros_cuadrados" DOUBLE PRECISION NOT NULL,
    "estado_inventario" TEXT NOT NULL DEFAULT 'disponible',
    "documento_verificado" BOOLEAN NOT NULL DEFAULT false,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,

    CONSTRAINT "Inmueble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caracteristica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Caracteristica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InmuebleCaracteristica" (
    "inmueble_id" INTEGER NOT NULL,
    "caracteristica_id" INTEGER NOT NULL,

    CONSTRAINT "InmuebleCaracteristica_pkey" PRIMARY KEY ("inmueble_id","caracteristica_id")
);

-- CreateTable
CREATE TABLE "Publicacion" (
    "id" SERIAL NOT NULL,
    "inmueble_id" INTEGER NOT NULL,
    "precio_renta" DOUBLE PRECISION NOT NULL,
    "deposito" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT NOT NULL,
    "reglas" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "fecha_publicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_finalizacion" TIMESTAMP(3),

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "inmueble_id" INTEGER,
    "tipo_documento" TEXT NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "fecha_carga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "verificado_por_admin" BOOLEAN NOT NULL DEFAULT false,
    "motivo_rechazo" TEXT,
    "revisado_por" INTEGER,
    "fecha_revision" TIMESTAMP(3),

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verificacion" (
    "id" SERIAL NOT NULL,
    "documento_id" INTEGER NOT NULL,
    "administrador_id" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_revision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,

    CONSTRAINT "Verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudRenta" (
    "id" SERIAL NOT NULL,
    "inquilino_id" INTEGER NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "mensaje" TEXT,

    CONSTRAINT "SolicitudRenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visita" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'agendada',
    "notas" TEXT,

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienciaRenta" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'activa',

    CONSTRAINT "ExperienciaRenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" SERIAL NOT NULL,
    "experiencia_renta_id" INTEGER NOT NULL,
    "usuario_evaluador_id" INTEGER NOT NULL,
    "tipo_evaluacion" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha_evaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_envio" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'no_leida',
    "enviada_email" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderacion" (
    "id" SERIAL NOT NULL,
    "reporte_id" INTEGER NOT NULL,
    "administrador_id" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "fecha_moderacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,

    CONSTRAINT "Moderacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "ExperienciaRenta_solicitud_id_key" ON "ExperienciaRenta"("solicitud_id");

-- AddForeignKey
ALTER TABLE "Propietario" ADD CONSTRAINT "Propietario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inmueble" ADD CONSTRAINT "Inmueble_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "Propietario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InmuebleCaracteristica" ADD CONSTRAINT "InmuebleCaracteristica_inmueble_id_fkey" FOREIGN KEY ("inmueble_id") REFERENCES "Inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InmuebleCaracteristica" ADD CONSTRAINT "InmuebleCaracteristica_caracteristica_id_fkey" FOREIGN KEY ("caracteristica_id") REFERENCES "Caracteristica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_inmueble_id_fkey" FOREIGN KEY ("inmueble_id") REFERENCES "Inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_inmueble_id_fkey" FOREIGN KEY ("inmueble_id") REFERENCES "Inmueble"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacion" ADD CONSTRAINT "Verificacion_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacion" ADD CONSTRAINT "Verificacion_administrador_id_fkey" FOREIGN KEY ("administrador_id") REFERENCES "Administrador"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudRenta" ADD CONSTRAINT "SolicitudRenta_inquilino_id_fkey" FOREIGN KEY ("inquilino_id") REFERENCES "Inquilino"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudRenta" ADD CONSTRAINT "SolicitudRenta_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "SolicitudRenta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienciaRenta" ADD CONSTRAINT "ExperienciaRenta_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "SolicitudRenta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_experiencia_renta_id_fkey" FOREIGN KEY ("experiencia_renta_id") REFERENCES "ExperienciaRenta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_usuario_evaluador_id_fkey" FOREIGN KEY ("usuario_evaluador_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderacion" ADD CONSTRAINT "Moderacion_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "Reporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderacion" ADD CONSTRAINT "Moderacion_administrador_id_fkey" FOREIGN KEY ("administrador_id") REFERENCES "Administrador"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
