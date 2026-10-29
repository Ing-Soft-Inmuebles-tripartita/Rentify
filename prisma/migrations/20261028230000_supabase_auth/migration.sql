ALTER TABLE "Usuario" ADD COLUMN "auth_user_id" TEXT;

CREATE UNIQUE INDEX "Usuario_auth_user_id_key" ON "Usuario"("auth_user_id");
