-- Purpose: Agrega metadatos y relaciones para moderacion y administracion.
-- AlterTable
ALTER TABLE "Publicacion" ADD COLUMN     "fecha_suspension" TIMESTAMP(3),
ADD COLUMN     "motivo_suspension" TEXT,
ADD COLUMN     "suspendida_por" INTEGER;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "bloqueado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_bloqueo" TIMESTAMP(3),
ADD COLUMN     "motivo_bloqueo" TEXT;

-- AlterTable
ALTER TABLE "Visita" ADD COLUMN     "cancelada_en" TIMESTAMP(3),
ADD COLUMN     "completada_en" TIMESTAMP(3),
ADD COLUMN     "motivo_cancelacion" TEXT;
