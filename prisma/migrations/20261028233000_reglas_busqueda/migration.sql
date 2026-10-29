-- Purpose: Agrega las reglas de publicacion para mascotas y ninos.
ALTER TABLE "Publicacion"
ADD COLUMN "permite_mascotas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "permite_ninos" BOOLEAN NOT NULL DEFAULT true;
