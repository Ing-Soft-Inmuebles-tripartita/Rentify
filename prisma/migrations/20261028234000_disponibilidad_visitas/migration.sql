-- Purpose: Agrega disponibilidad semanal de visitas por inmueble.
ALTER TABLE "Inmueble"
ADD COLUMN "disponibilidad_visitas" JSONB;
