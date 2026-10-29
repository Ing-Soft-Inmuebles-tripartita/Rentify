-- Purpose: Agrega el estado de residencia del usuario capturado durante el registro.
ALTER TABLE "Usuario"
ADD COLUMN "estado_residencia" TEXT;
