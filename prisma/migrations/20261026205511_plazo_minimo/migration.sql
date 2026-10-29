-- Purpose: Agrega el plazo minimo de arrendamiento por inmueble.
-- AlterTable
ALTER TABLE "Inmueble" ADD COLUMN     "plazo_minimo_meses" INTEGER NOT NULL DEFAULT 12;
