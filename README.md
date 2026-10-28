# Rentify

Rentify es una aplicación web académica para explorar y administrar propiedades en renta en Guadalajara. Conecta a inquilinos y propietarios e incluye publicación de inmuebles, solicitudes, visitas, documentos de verificación y herramientas de moderación.

> **Proyecto académico:** Universidad de Guadalajara, Centro Universitario de Ciencias Exactas e Ingenierías, Ingeniería en Computación.

## Equipo

- Juan Elias Gutierrez Torres — 212547129
- Samuel García Rodríguez — 223992361
- Juan Jose Maldonado Pérez — 221139866
- Oswaldo Santiago Aceves Rodriguez — 221105244

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Interfaz y rutas | Next.js 16 App Router, React 19 y TypeScript |
| Estilos | Tailwind CSS 4 |
| Operaciones del servidor | Next.js Server Actions |
| Base de datos | PostgreSQL, configurada para Supabase |
| ORM | Prisma 6 |
| Sesiones | JWT con `jose`; contraseñas con `bcryptjs` |
| Archivos | Supabase Storage |
| Mapas | Leaflet y React Leaflet |
| Iconos | Lucide React |

## Requisitos

- Node.js 20.9 o posterior.
- npm.
- Una base de datos PostgreSQL accesible desde la aplicación.
- Un proyecto Supabase para la base de datos y Storage.

## Instalación local

1. Clona el repositorio y entra al directorio del proyecto:

   ```bash
   git clone https://github.com/Ing-Soft-Inmuebles-tripartita/Rentify.git
   cd rentify
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto:

   ```env
   DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://USUARIO:CONTRASENA@HOST:5432/postgres"
   JWT_SECRET="reemplaza-por-un-secreto-aleatorio-largo"
   NEXT_PUBLIC_SUPABASE_URL="https://PROJECT-REF.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="clave-publica-anon"
   ```

   Usa las URL de conexión de tu propio proyecto y conserva como privadas las credenciales de base de datos. `JWT_SECRET` debe ser un secreto aleatorio y no debe publicarse ni compartirse.

4. Aplica las migraciones y carga datos de demostración:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   > **Advertencia:** el seed elimina los datos existentes de las tablas de Rentify antes de recrearlos. Úsalo solamente con una base local o de pruebas; nunca lo ejecutes contra datos que necesites conservar.

5. Configura Supabase Storage:

   - Crea un bucket llamado `rentify`.
   - Mantén el bucket privado para los documentos personales.
   - Configura políticas de Storage compatibles con la carga y lectura que usa la aplicación.
   - No uses políticas públicas amplias de lectura, escritura o borrado en producción. La aplicación usa una clave pública de Supabase y su propia sesión JWT; esa sesión no autentica automáticamente al usuario ante las políticas de Supabase Storage.

   Antes de desplegar, revisa las políticas de acceso y protege las operaciones de archivos. Los documentos de identidad e ingresos son información sensible.

6. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Cuentas de demostración

El seed crea estas cuentas con la contraseña `test123`:

| Correo | Perfil |
| --- | --- |
| `carlos@rentify.com` | Propietario |
| `maria@rentify.com` | Propietaria |
| `ana@rentify.com` | Inquilina y propietaria |
| `admin@rentify.com` | Administrador y propietario |

Son credenciales públicas para pruebas locales, no las uses en un despliegue real.

## Funcionalidades principales

- Explorar propiedades y filtrar por ubicación, tipo, presupuesto y número de recámaras.
- Ver detalles, fotografías, amenidades, condiciones y ubicación de una propiedad.
- Crear cuenta, iniciar sesión, cerrar sesión y cambiar o recuperar la contraseña.
- Administrar datos del perfil, preferencias de correo y documentos.
- Publicar propiedades con amenidades, fotos, renta, depósito y plazo mínimo.
- Solicitar una renta y agendar visitas presenciales o por videollamada.
- Consultar las solicitudes, visitas y propiedades desde el dashboard.
- Moderar publicaciones, revisar documentos y resolver reportes desde `/dashboard/admin`.

El rol de administrador se comprueba tanto al mostrar el panel como en cada acción del servidor. Los propietarios pendientes de verificación pueden publicar; sus anuncios se muestran como pendientes hasta que la verificación correspondiente esté registrada.

## Correos y cuentas

El envío de correo está simulado: los mensajes y enlaces de recuperación se imprimen en la terminal de `npm run dev`. No hay un proveedor de correo configurado. El registro deja el correo como no verificado, pero actualmente permite iniciar sesión; el flujo de confirmación de correo no está implementado.

Al bloquear una cuenta, se impiden nuevos inicios de sesión. El bloqueo no revoca de forma inmediata una sesión que ya estuviera abierta.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción (después de compilar) |
| `npm run lint` | ESLint sobre el código de aplicación y el seed |
| `npx tsc --noEmit` | Comprobación de tipos TypeScript |
| `npx prisma validate` | Validación del esquema de Prisma |
| `npx prisma migrate dev` | Crear o aplicar migraciones en desarrollo |
| `npx prisma migrate deploy` | Aplicar migraciones ya creadas en despliegues |
| `npm run db:seed` | Borrar y volver a cargar datos de demostración |

No hay un comando de pruebas automatizadas configurado actualmente.

## Estructura

```text
prisma/
  migrations/       Historial de cambios de la base de datos
  schema.prisma     Modelos y relaciones
  seed.ts           Datos de demostración (destructivo)
src/
  app/
    actions/        Mutaciones y validaciones del servidor
    dashboard/      Panel de usuario y herramientas de administración
    propiedad/      Detalle y visitas de una propiedad
    propiedades/    Búsqueda y filtros
    perfil/         Perfil y documentos
  components/       Componentes compartidos
  lib/              Prisma, autenticación, tokens, correo y Storage
```

## Licencia

Proyecto académico de la Universidad de Guadalajara, 2026.
