-- Purpose: Agrega el identificador de Supabase Auth asociado a perfiles Rentify.
ALTER TABLE "Usuario" ADD COLUMN "auth_user_id" TEXT;

CREATE UNIQUE INDEX "Usuario_auth_user_id_key" ON "Usuario"("auth_user_id");
