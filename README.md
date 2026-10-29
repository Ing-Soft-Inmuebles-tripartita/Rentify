# Rentify

Rentify es una aplicación web académica para descubrir y administrar inmuebles en renta en Guadalajara, Jalisco. La plataforma conecta a personas que buscan vivienda con propietarios y permite publicar inmuebles, gestionar solicitudes y visitas, revisar documentos y moderar publicaciones.

> **Contexto académico:** Universidad de Guadalajara, Centro Universitario de Ciencias Exactas e Ingenierías (CUCEI), Ingeniería en Computación.

## Contenido

- [Objetivo y alcance](#objetivo-y-alcance)
- [Funciones](#funciones)
- [Roles y permisos](#roles-y-permisos)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Tecnologías y arquitectura](#tecnologías-y-arquitectura)
- [Modelo de datos](#modelo-de-datos)
- [Requisitos](#requisitos)
- [Configuración local](#configuración-local)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos y datos de demostración](#base-de-datos-y-datos-de-demostración)
- [Supabase Storage y documentos](#supabase-storage-y-documentos)
- [Cuentas de demostración](#cuentas-de-demostración)
- [Correo electrónico y autenticación](#correo-electrónico-y-autenticación)
- [Comandos disponibles](#comandos-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Estado y limitaciones conocidas](#estado-y-limitaciones-conocidas)
- [Equipo](#equipo)
- [Licencia](#licencia)

## Objetivo y alcance

El proyecto proporciona un flujo de renta de principio a fin para una aplicación académica:

1. Explorar publicaciones disponibles y consultar los detalles de un inmueble.
2. Registrarse e iniciar sesión con una cuenta de Rentify.
3. Publicar y administrar inmuebles como propietario.
4. Enviar solicitudes de renta o proponer visitas presenciales o virtuales.
5. Revisar solicitudes, visitas, documentos y actividad desde el dashboard.
6. Moderar publicaciones, documentos, reportes y cuentas desde el panel de administración.

El producto está orientado a Guadalajara y su zona metropolitana. No procesa pagos ni sustituye un contrato de arrendamiento; las solicitudes de la aplicación son herramientas de contacto y gestión.

## Funciones

### Exploración de inmuebles

- Página principal con acceso al catálogo.
- Listado y filtrado por ubicación, tipo de inmueble, presupuesto y número de habitaciones.
- Página de detalle con fotografías, descripción, renta, depósito, reglas, amenidades, condiciones y ubicación en mapa cuando hay coordenadas.
- Calificaciones y reseñas asociadas a publicaciones.
- Opción para reportar una publicación.

### Cuentas y perfil

- Registro, inicio y cierre de sesión.
- Restablecimiento de contraseña mediante un enlace temporal.
- Edición de datos de perfil, cambio de contraseña y preferencias de correo.
- Roles independientes de propietario e inquilino: una cuenta puede tener ambos perfiles.
- Carga y seguimiento de documentos para revisión administrativa.

### Publicación y renta

- Creación y edición de inmuebles y sus publicaciones.
- Administración de precio de renta, depósito, descripción, reglas, fotografías, amenidades, servicios y plazo mínimo.
- Solicitudes de renta que el propietario puede revisar, aprobar o rechazar.
- Agendamiento de visitas con fecha, hora y modalidad.
- Dashboard con la actividad de las cuentas, propiedades y solicitudes.
- Evaluaciones asociadas a experiencias de renta.

### Administración

- Moderación: suspender, reactivar o retirar publicaciones.
- Verificación: revisar y aprobar o rechazar documentos.
- Reportes: resolver o descartar reportes recibidos.
- Cuentas: bloquear y desbloquear usuarios.
- Registro de acciones de moderación y motivos de suspensión/rechazo en los datos correspondientes.

## Roles y permisos

| Rol/perfil | Responsabilidades principales |
| --- | --- |
| Visitante | Explorar las páginas públicas y consultar propiedades. |
| Usuario registrado | Administrar su perfil, preferencias y documentos; enviar solicitudes y agendar visitas. |
| Inquilino | Gestionar solicitudes de renta y participar en visitas y evaluaciones asociadas a una renta. |
| Propietario | Publicar y administrar sus inmuebles y atender solicitudes recibidas. |
| Administrador | Moderar publicaciones, verificar documentos, atender reportes y gestionar bloqueos de usuarios. |

Una cuenta puede ser propietaria e inquilina al mismo tiempo. El perfil se crea cuando se necesita; por ejemplo, algunas acciones crean el perfil de inquilino automáticamente si todavía no existe.

Las rutas `/dashboard` y `/perfil` requieren sesión. La administración no depende únicamente de ocultar una pantalla: las acciones administrativas verifican el rol en el servidor antes de modificar información.

## Rutas de la aplicación

| Ruta | Uso |
| --- | --- |
| `/` | Página principal. |
| `/propiedades` | Catálogo y búsqueda de publicaciones. |
| `/propiedad/[id]` | Detalle de una publicación, solicitud/visita y reporte. |
| `/guia` | Guía informativa sobre Guadalajara. |
| `/login` | Inicio de sesión. |
| `/registro` | Registro de cuenta. |
| `/recuperar` | Solicitud de recuperación de contraseña. |
| `/restablecer/[token]` | Formulario para establecer una contraseña nueva. |
| `/seguridad` | Información de seguridad. |
| `/perfil` | Datos, preferencias y documentos de la cuenta autenticada. |
| `/dashboard` | Panel principal de usuario; cambia según su información y roles. |
| `/dashboard/publicar` | Formulario para publicar un inmueble. |
| `/dashboard/editar-propiedad/[id]` | Edición de una propiedad propia. |
| `/dashboard/evaluaciones` | Evaluaciones relacionadas con la experiencia de renta. |
| `/dashboard/admin` | Panel administrativo. |

La interfaz está en español. Las rutas dinámicas usan el identificador de la publicación, propiedad o token correspondiente.

## Tecnologías y arquitectura

| Área | Tecnología | Uso |
| --- | --- | --- |
| Aplicación web | Next.js 16 App Router | Rutas, renderizado y funciones de servidor. |
| Interfaz | React 19 y TypeScript | Componentes y lógica de interfaz tipada. |
| Estilos | Tailwind CSS 4 | Estilos y diseño adaptable. |
| Mutaciones | Next.js Server Actions | Operaciones de autenticación, perfil, propiedades, solicitudes y administración. |
| Persistencia | PostgreSQL | Base de datos relacional. |
| ORM | Prisma 6 | Modelos, consultas y migraciones. |
| Sesiones | `jose` | JWT firmado en una cookie HTTP-only. |
| Contraseñas | `bcryptjs` | Hash y verificación de contraseñas. |
| Archivos | Supabase Storage | Archivos de documentos subidos por usuarios. |
| Mapas | Leaflet y React Leaflet | Ubicación de inmuebles con coordenadas. |
| Iconografía | Lucide React | Iconos de la interfaz. |

### Organización de una operación

- Las páginas de `src/app` representan las rutas del App Router.
- Las operaciones que cambian datos se agrupan como Server Actions en `src/app/actions`.
- `src/lib/auth.ts` centraliza lectura, creación y eliminación de sesión, además de la consulta del usuario actual.
- `src/lib/prisma.ts` comparte el cliente de Prisma durante el desarrollo para reducir conexiones durante las recargas.
- El middleware realiza una comprobación inicial de la firma JWT para rutas privadas; cada operación de servidor vuelve a consultar la identidad y debe validar sus permisos.
- Las mutaciones revalidan las rutas afectadas para refrescar el contenido del dashboard y de las páginas públicas.

## Modelo de datos

El esquema está en [`prisma/schema.prisma`](./prisma/schema.prisma). Sus entidades principales son:

| Área | Modelos | Descripción |
| --- | --- | --- |
| Cuentas y roles | `Usuario`, `Propietario`, `Inquilino`, `Administrador` | Identidad, estado, datos de cuenta y perfiles/roles asociados. |
| Inmuebles y publicaciones | `Inmueble`, `Publicacion`, `Foto`, `Caracteristica`, `InmuebleCaracteristica`, `Resena` | Datos físicos del inmueble, anuncio, imágenes, amenidades y reseñas. |
| Documentos | `Documento`, `Verificacion` | Archivos enviados y decisiones de revisión administrativa. |
| Solicitudes y visitas | `SolicitudRenta`, `Visita`, `ExperienciaRenta`, `Evaluacion` | Solicitud, agenda de visitas y evaluaciones vinculadas a una experiencia de renta. |
| Actividad y moderación | `Notificacion`, `Reporte`, `Moderacion` | Avisos internos, reportes de publicaciones y acciones administrativas. |

Los estados de roles, publicaciones, solicitudes y documentos se guardan como cadenas en el esquema. Las relaciones y eliminaciones en cascada se definen en Prisma; consulta el esquema y las migraciones para conocer la estructura exacta vigente.

## Requisitos

- Node.js 20.9 o posterior.
- npm.
- PostgreSQL accesible desde la aplicación.
- Proyecto de Supabase para Storage.
- Conexión a Internet para acceder a las dependencias, recursos externos de imágenes y servicios de Supabase.

## Configuración local

1. Clona el repositorio y entra al directorio de la aplicación:

   ```bash
   git clone https://github.com/Ing-Soft-Inmuebles-tripartita/Rentify.git
   cd rentify
   ```

   Si ya tienes el repositorio, cambia a la carpeta `rentify` que contiene `package.json`.

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la carpeta donde está `package.json`. Configura las variables descritas en [Variables de entorno](#variables-de-entorno). No compartas ni subas ese archivo al repositorio.

4. Aplica las migraciones existentes:

   ```bash
   npx prisma migrate dev
   ```

5. (Opcional) Carga los datos de demostración en una base local o desechable:

   ```bash
   npm run db:seed
   ```

   **El seed elimina primero los datos de las tablas de Rentify y los vuelve a crear. No lo ejecutes en una base con datos que deban conservarse.**

6. Configura el bucket de Storage (consulta [Supabase Storage y documentos](#supabase-storage-y-documentos)).

7. Inicia Next.js en modo de desarrollo:

   ```bash
   npm run dev
   ```

8. Abre [http://localhost:3000](http://localhost:3000).

Para comprobar la aplicación antes de desplegar, ejecuta el lint, la comprobación de tipos y el build indicados en [Comandos disponibles](#comandos-disponibles).

## Variables de entorno

Define estas variables en `.env` en la raíz de la aplicación:

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | URL de conexión PostgreSQL usada por Prisma en tiempo de ejecución. |
| `DIRECT_URL` | Sí | URL de conexión directa que Prisma usa para operaciones de migración. |
| `JWT_SECRET` | Sí | Secreto largo, aleatorio y privado para firmar y verificar las sesiones. |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase. Tiene prefijo público porque se utiliza en el cliente de Storage. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública anon del proyecto Supabase; las políticas de Storage deben limitar su acceso. |
| `PRISMA_LOG_QUERIES` | No | Si vale exactamente `true`, Prisma registra consultas además de advertencias y errores. |

Ejemplo de formato, usando valores propios:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USUARIO:CONTRASENA@HOST:5432/postgres"
JWT_SECRET="genera-un-secreto-aleatorio-largo"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="CLAVE-PUBLICA-ANON"
PRISMA_LOG_QUERIES="false"
```

Los puertos y parámetros dependen de tu proveedor. Si usas Supabase, utiliza la URL de pool para `DATABASE_URL` cuando corresponda y una conexión directa para `DIRECT_URL`. No copies credenciales reales a documentación, issues o commits. Aunque la clave anon es pública por diseño, no la confundas con una clave de servicio privada ni la uses para sustituir políticas de acceso.

## Base de datos y datos de demostración

Las migraciones versionadas están en `prisma/migrations/`. La configuración de Prisma define PostgreSQL y lee `DATABASE_URL` y `DIRECT_URL` desde el entorno.

```bash
# Crear una migración nueva y aplicarla en desarrollo
npx prisma migrate dev --name nombre_del_cambio

# Aplicar migraciones ya creadas en un entorno de despliegue
npx prisma migrate deploy

# Comprobar el esquema
npx prisma validate

# Regenerar el cliente si se requiere
npx prisma generate
```

El seed crea usuarios, perfiles, amenidades, inmuebles, publicaciones, fotos, reseñas y registros de ejemplo para probar solicitudes, visitas, reportes, documentos, notificaciones y experiencias de renta. El script está en [`prisma/seed.ts`](./prisma/seed.ts) y borra primero los registros existentes de las tablas que utiliza.

## Supabase Storage y documentos

1. Crea un bucket llamado `rentify` en el proyecto Supabase configurado.
2. La interfaz carga archivos bajo la ruta `documentos/` del bucket.
3. El formulario acepta PDF, JPG y PNG, con un límite de 5 MB por archivo.
4. Al cargar, la aplicación genera una URL firmada y guarda esa referencia con el registro del documento en PostgreSQL.
5. Los documentos aparecen como pendientes para revisión administrativa.

Configura las políticas de Storage para permitir únicamente las operaciones necesarias. La aplicación usa una clave anon en el cliente; el JWT propio de Rentify no autentica automáticamente al usuario ante Supabase ni reemplaza las políticas del bucket. Mantén privados los documentos de identidad e ingresos y evita políticas amplias de lectura, escritura o borrado.

**Consideración de despliegue:** actualmente la URL firmada que genera el formulario tiene vigencia de un año y se guarda como `ruta_archivo`. Revisa si esa duración y el tratamiento de esas URL son adecuados para producción antes de almacenar documentos reales.

## Cuentas de demostración

El seed asigna la contraseña `test123` a las cuentas que crea:

| Correo | Perfiles |
| --- | --- |
| `carlos@rentify.com` | Propietario. |
| `maria@rentify.com` | Propietaria. |
| `ana@rentify.com` | Inquilina y propietaria. |
| `admin@rentify.com` | Administrador y propietario. |

También se crean cuentas de ejemplo para las reseñas. Todas estas credenciales son públicas y exclusivamente para pruebas locales. Cámbialas o elimina estos datos antes de cualquier entorno accesible públicamente.

## Correo electrónico y autenticación

- Las sesiones duran siete días y se almacenan en una cookie `rentify_session` con atributos `HttpOnly` y `SameSite=Lax`; en producción se activa `Secure`.
- Las contraseñas se almacenan como hashes generados con `bcryptjs`.
- Las solicitudes de recuperación guardan un token con expiración de una hora. En el entorno actual el correo es simulado: el mensaje, su contenido y el enlace se imprimen en la terminal del servidor.
- Los enlaces generados por el servicio de correo apuntan a `http://localhost:3000`; un despliegue requiere integrar un proveedor real y configurar una URL pública adecuada.
- El registro guarda la cuenta con correo no verificado, pero actualmente ese estado no impide iniciar sesión; no hay un flujo completo de confirmación de correo.
- Bloquear una cuenta impide nuevos inicios de sesión, pero no revoca de inmediato una sesión que ya estuviera abierta.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo Next.js. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Servidor de producción; requiere ejecutar primero `npm run build`. |
| `npm run lint` | ESLint sobre `src` y `prisma/seed.ts`. |
| `npx tsc --noEmit` | Comprobación de tipos de TypeScript. |
| `npx prisma validate` | Validación del esquema Prisma. |
| `npx prisma generate` | Generación del cliente Prisma. |
| `npx prisma migrate dev` | Crear/aplicar migraciones en desarrollo. |
| `npx prisma migrate deploy` | Aplicar migraciones existentes en un despliegue. |
| `npm run db:seed` | Borrar y volver a cargar datos de demostración. |

No hay un comando ni una suite de pruebas automatizadas configurados actualmente.

## Estructura del proyecto

```text
rentify/
├── prisma/
│   ├── migrations/             Historial versionado de cambios en PostgreSQL
│   ├── schema.prisma           Modelos y relaciones de datos
│   └── seed.ts                 Datos de demostración (borra datos existentes)
├── public/                     Recursos estáticos
└── src/
    ├── app/
    │   ├── actions/            Server Actions por dominio
    │   ├── dashboard/          Panel usuario, publicaciones y administración
    │   ├── guia/               Guía de Guadalajara
    │   ├── login/              Inicio de sesión
    │   ├── perfil/             Perfil y carga de documentos
    │   ├── propiedad/[id]/     Detalle y acciones de una publicación
    │   ├── propiedades/        Catálogo y filtros
    │   ├── recuperar/          Solicitud de recuperación de contraseña
    │   ├── registro/            Alta de usuario
    │   ├── restablecer/[token]/ Cambio de contraseña mediante token
    │   └── seguridad/          Información de seguridad
    ├── components/             Componentes reutilizables de interfaz
    ├── lib/
    │   ├── auth.ts             Sesiones y usuario actual
    │   ├── email.ts            Correo simulado
    │   ├── password.ts         Hash y verificación de contraseñas
    │   ├── prisma.ts           Cliente de base de datos
    │   ├── supabase-client.ts  Cliente Supabase Storage
    │   └── tokens.ts           Tokens y expiraciones
    └── middleware.ts           Protección inicial de rutas privadas
```

Las acciones de servidor están separadas por dominio:

| Archivo | Responsabilidad |
| --- | --- |
| `src/app/actions/auth.ts` | Registro, login, logout y recuperación de contraseña. |
| `src/app/actions/perfil.ts` | Perfil, contraseña, preferencias y documentos. |
| `src/app/actions/propiedades.ts` | Publicación de inmuebles. |
| `src/app/actions/inmuebles.ts` | Edición, estado y eliminación de inmuebles. |
| `src/app/actions/solicitudes.ts` | Solicitudes de renta y decisiones del propietario. |
| `src/app/actions/visitas.ts` | Agendamiento de visitas. |
| `src/app/actions/evaluaciones.ts` | Evaluaciones de experiencias de renta. |
| `src/app/actions/reportes.ts` | Creación de reportes. |
| `src/app/actions/admin.ts` | Moderación, verificaciones y gestión de usuarios. |

## Estado y limitaciones conocidas

- Es un proyecto académico; antes de usarlo con usuarios o documentos reales se deben revisar seguridad, privacidad, políticas de Storage, manejo de correo y operación de producción.
- No existe integración de pagos.
- Los correos son simulados y los enlaces usan localhost.
- La verificación de correo no está implementada como requisito de acceso.
- No se ha configurado una suite de pruebas automatizadas.
- El seed es destructivo y las cuentas de prueba tienen contraseñas conocidas.
- El panel de guía contiene actualmente contenido introductorio básico.
- Para producción se requiere configurar secretos, base de datos, Storage, políticas y variables de entorno propias; no se incluye aquí una configuración de despliegue específica del proveedor.

## Equipo

- Juan Elias Gutierrez Torres — 212547129
- Samuel García Rodríguez — 223992361
- Juan Jose Maldonado Pérez — 221139866
- Oswaldo Santiago Aceves Rodriguez — 221105244

## Licencia

Proyecto académico de la Universidad de Guadalajara, 2026. No se especifica una licencia de software en este repositorio.
