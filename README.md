# 🏠 Rentify

Plataforma de renta de viviendas en Guadalajara que conecta inquilinos con propietarios de forma segura, con verificación de identidad y moderación de contenido.

**Proyecto académico** — Universidad de Guadalajara  
Centro Universitario de Ciencias Exactas e Ingenierías  
Ingeniería en Computación

---

## 👥 Equipo

- Juan Elias Gutierrez Torres — 212547129
- Samuel García Rodríguez — 223992361
- Juan Jose Maldonado Pérez — 221139866
- Oswaldo Santiago Aceves Rodriguez — 221105244

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Estilos** | Tailwind CSS v4 |
| **Backend** | Next.js Server Actions |
| **Base de datos** | PostgreSQL (Supabase) |
| **ORM** | Prisma 6 |
| **Autenticación** | JWT (jose) + bcryptjs |
| **Storage** | Supabase Storage |
| **Iconos** | Lucide React |

---

## 🛠️ Instalación

### Requisitos previos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/rentify.git
cd rentify
2. Instalar dependencias
bash
npm install
3. Configurar variables de entorno
Crea un archivo .env en la raíz con:

env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
JWT_SECRET=tu-clave-secreta-aleatoria-de-64-caracteres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
4. Configurar la base de datos
bash
npx prisma migrate dev
npm run db:seed
5. Configurar Supabase Storage
Ir a Supabase → Storage

Crear un bucket privado llamado rentify

En Policies, añadir:

SELECT: true

INSERT: true

DELETE: true

6. Ejecutar el servidor
bash
npm run dev
Abre http://localhost:3000

🔑 Usuarios de prueba
Correo	Contraseña	Roles
carlos@rentify.com	test123	Propietario
maria@rentify.com	test123	Propietaria
ana@rentify.com	test123	Inquilina + Propietaria
admin@rentify.com	test123	Administrador + Propietario
📧 Emails en desarrollo
En desarrollo, los emails se simulan imprimiendo su contenido en la terminal (console.log). Para ver el enlace de recuperación de contraseña, revisa la terminal donde corre npm run dev después de solicitar la recuperación.

En producción, se integraría un servicio real como Resend o SendGrid.

📁 Estructura del proyecto
text
rentify/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── actions/
│   │   ├── dashboard/
│   │   ├── perfil/
│   │   ├── login/
│   │   ├── registro/
│   │   ├── recuperar/
│   │   ├── restablecer/
│   │   ├── propiedad/
│   │   ├── propiedades/
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   └── middleware.ts
└── README.md
🎯 Scripts disponibles
bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run db:seed      # Poblar la base de datos
📄 Licencia
Proyecto académico — Universidad de Guadalajara, 2026.

text

---

## 🎉 ¡PROYECTO COMPLETO!

Ya tienes los 36 archivos con contenido. Ahora vamos a **probar todo**:

### 1. Detener el servidor (si está corriendo)

```cmd
Ctrl + C
2. Borrar caché
cmd
rmdir /s /q .next
3. Ejecutar el seed (por si acaso)
cmd
npm run db:seed
4. Arrancar el servidor
cmd
npm run dev
5. Abrir el navegador
text
http://localhost:3000
🎯 Prueba el flujo completo
#	Prueba	Credenciales / URL
1	Home	http://localhost:3000 → deberías ver Hero + 4 propiedades
2	Login	carlos@rentify.com / test123 → dashboard con 2 inmuebles
3	Buscar	En el Hero, escribe "Americana" → buscar → 1 resultado
4	Detalle	Clic en cualquier tarjeta → página completa con foto
5	Solicitar	Como ana@rentify.com, solicitar una propiedad de Carlos
6	Aprobar	Como carlos@rentify.com, aprobar la solicitud de Ana
7	Perfil	Clic en "Perfil" → 3 tabs (datos, seguridad, preferencias)
8	Recuperar	http://localhost:3000/recuperar → email simulado en terminal
9	Publicar	Como ana@rentify.com → botón verde "Publicar propiedad"
10	Admin	Como admin@rentify.com → panel con stats
11	404	http://localhost:3000/pagina-inexistente → página 404 bonita
12	Middleware	Sin sesión, ir a /dashboard → redirige a /login
