-- Purpose: Agrega la modalidad de visita presencial o virtual.
-- AlterTable
ALTER TABLE "Visita" ADD COLUMN     "modalidad" TEXT NOT NULL DEFAULT 'presencial';
