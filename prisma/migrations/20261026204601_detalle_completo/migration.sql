-- Purpose: Agrega campos y relaciones del detalle de inmuebles.
-- AlterTable
ALTER TABLE "Inmueble" ADD COLUMN     "mantenimiento_incluido" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "piso" INTEGER DEFAULT 1,
ADD COLUMN     "servicios_incluidos" TEXT;

-- AlterTable
ALTER TABLE "Publicacion" ADD COLUMN     "calificacion_promedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_resenas" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Resena" (
    "id" SERIAL NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracion_meses" INTEGER,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
