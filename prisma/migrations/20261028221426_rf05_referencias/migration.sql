-- Purpose: Agrega referencias de renta asociadas a perfiles de inquilino.
-- CreateTable
CREATE TABLE "ReferenciaRenta" (
    "id" SERIAL NOT NULL,
    "inquilino_id" INTEGER NOT NULL,
    "nombre_contacto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "relacion" TEXT NOT NULL,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenciaRenta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferenciaRenta_inquilino_id_idx" ON "ReferenciaRenta"("inquilino_id");

-- AddForeignKey
ALTER TABLE "ReferenciaRenta" ADD CONSTRAINT "ReferenciaRenta_inquilino_id_fkey" FOREIGN KEY ("inquilino_id") REFERENCES "Inquilino"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
