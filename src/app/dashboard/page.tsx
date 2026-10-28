import { Suspense } from 'react'
import Link from 'next/link'
import { Home, FileText, Plus, Eye, ShieldCheck, Calendar, Star } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SolicitudRecibidaCard from './SolicitudRecibidaCard'

async function DashboardContent() {
  const usuario = await getCurrentUser()
  if (!usuario) return null

  const misSolicitudes = usuario.inquilino
    ? await prisma.solicitudRenta.findMany({
        where: { inquilino_id: usuario.inquilino.usuario_id },
        include: {
          publicacion: {
            include: {
              inmueble: true,
              fotos: { take: 1, orderBy: { orden: 'asc' } },
            },
          },
        },
        orderBy: { fecha_solicitud: 'desc' },
        take: 5,
      })
    : []

  const misInmuebles = usuario.propietario
    ? await prisma.inmueble.findMany({
        where: { propietario_id: usuario.propietario.usuario_id },
        include: {
          publicaciones: {
            include: {
              fotos: { take: 1, orderBy: { orden: 'asc' } },
              _count: { select: { solicitudes: true } },
            },
          },
        },
        orderBy: { id: 'desc' },
      })
    : []

  const solicitudesRecibidas = usuario.propietario
    ? await prisma.solicitudRenta.findMany({
        where: {
          publicacion: {
            inmueble: {
              propietario_id: usuario.propietario.usuario_id,
            },
          },
        },
        include: {
          inquilino: {
            include: { usuario: true },
          },
          publicacion: {
            include: {
              inmueble: true,
              fotos: { take: 1, orderBy: { orden: 'asc' } },
            },
          },
        },
        orderBy: { fecha_solicitud: 'desc' },
      })
    : []

  const visitasRecibidas = usuario.propietario
    ? await prisma.visita.findMany({
        where: {
          solicitud: {
            publicacion: {
              inmueble: {
                propietario_id: usuario.propietario.usuario_id,
              },
            },
          },
        },
        include: {
          solicitud: {
            include: {
              inquilino: { include: { usuario: true } },
              publicacion: { include: { inmueble: true } },
            },
          },
        },
        orderBy: { fecha_hora: 'asc' },
      })
    : []

  let statsAdmin = { usuarios: 0, inmuebles: 0, verificaciones: 0, reportes: 0 }
  if (usuario.administrador) {
    const [usuarios, inmuebles, verificaciones, reportes] = await Promise.all([
      prisma.usuario.count(),
      prisma.inmueble.count(),
      prisma.documento.count({ where: { estado: 'pendiente' } }),
      prisma.reporte.count({ where: { estado: 'pendiente' } }),
    ])
    statsAdmin = { usuarios, inmuebles, verificaciones, reportes }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Hola, {usuario.nombre} 👋
        </h1>
        <p className="text-on-surface-variant mt-2">
          {usuario.administrador
            ? 'Panel de administración'
            : usuario.propietario
            ? 'Administra tus propiedades y solicitudes'
            : 'Explora propiedades y gestiona tus rentas'}
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/propiedades"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Eye size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-primary">Buscar propiedades</p>
            <p className="text-sm text-on-surface-variant">Explora rentas disponibles</p>
          </div>
        </Link>

        <Link
          href="/dashboard/publicar"
          className="bg-primary text-white rounded-xl p-6 shadow-sm hover:shadow-md hover:bg-secondary transition flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <div>
            <p className="font-bold">Publicar propiedad</p>
            <p className="text-sm text-white/80">Sube tu primer inmueble</p>
          </div>
        </Link>

        <Link
          href="/dashboard/evaluaciones"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Star size={24} className="text-rating-gold fill-rating-gold" />
          </div>
          <div>
            <p className="font-bold text-primary">Mis evaluaciones</p>
            <p className="text-sm text-on-surface-variant">Califica tus rentas</p>
          </div>
        </Link>
      </div>

      {/* Panel Admin */}
      {usuario.administrador && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <ShieldCheck size={22} /> Panel de administración
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-on-surface-variant">Usuarios</p>
              <p className="text-2xl font-bold text-primary">{statsAdmin.usuarios}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-on-surface-variant">Inmuebles</p>
              <p className="text-2xl font-bold text-primary">{statsAdmin.inmuebles}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-on-surface-variant">Verificaciones</p>
              <p className="text-2xl font-bold text-yellow-600">{statsAdmin.verificaciones}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-on-surface-variant">Reportes</p>
              <p className="text-2xl font-bold text-red-600">{statsAdmin.reportes}</p>
            </div>
          </div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-secondary transition font-semibold text-sm"
          >
            <ShieldCheck size={18} /> Ir al panel de administración
          </Link>
        </div>
      )}

      {/* Mis inmuebles */}
      {usuario.propietario && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Home size={22} /> Mis inmuebles
            </h2>
            <span className="text-sm text-on-surface-variant">
              {misInmuebles.length} inmueble{misInmuebles.length !== 1 && 's'}
            </span>
          </div>

          {misInmuebles.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Home size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-on-surface-variant">Aún no has publicado inmuebles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {misInmuebles.map((inm) => (
                <div key={inm.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  {inm.publicaciones[0]?.fotos[0] && (
                    <img
                      src={inm.publicaciones[0].fotos[0].ruta_archivo}
                      alt={inm.tipo_inmueble}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-primary text-sm">
                        {inm.tipo_inmueble}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                          inm.estado_inventario === 'disponible'
                            ? 'bg-green-100 text-green-700'
                            : inm.estado_inventario === 'en_negociacion'
                            ? 'bg-yellow-100 text-yellow-700'
                            : inm.estado_inventario === 'rentado'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {inm.estado_inventario}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{inm.direccion}</p>
                    {inm.publicaciones[0] && (
                      <p className="text-sm font-semibold text-secondary mt-2">
                        ${inm.publicaciones[0].precio_renta.toLocaleString('en-US')} MXN
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Solicitudes recibidas */}
      {usuario.propietario && solicitudesRecibidas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <FileText size={22} /> Solicitudes recibidas
            <span className="text-sm font-normal text-on-surface-variant">
              ({solicitudesRecibidas.filter((s) => s.estado === 'pendiente').length} pendientes)
            </span>
          </h2>
          <div className="space-y-3">
            {solicitudesRecibidas.map((sol) => (
              <SolicitudRecibidaCard
                key={sol.id}
                solicitud={{
                  id: sol.id,
                  estado: sol.estado,
                  mensaje: sol.mensaje,
                  fecha_solicitud: sol.fecha_solicitud,
                  inquilino_nombre: sol.inquilino.usuario.nombre,
                  inquilino_apellido: sol.inquilino.usuario.apellido,
                  inmueble_tipo: sol.publicacion.inmueble.tipo_inmueble,
                  inmueble_direccion: sol.publicacion.inmueble.direccion,
                  imagen:
                    sol.publicacion.fotos[0]?.ruta_archivo ||
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Visitas agendadas */}
      {usuario.propietario && visitasRecibidas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Calendar size={22} /> Visitas agendadas
            <span className="text-sm font-normal text-on-surface-variant">
              ({visitasRecibidas.filter((v) => v.estado === 'agendada').length} pendientes)
            </span>
          </h2>
          <div className="space-y-3">
            {visitasRecibidas.map((visita) => (
              <div
                key={visita.id}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-lg bg-surface-container flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-on-surface-variant">
                    {new Date(visita.fecha_hora).toLocaleDateString('es-MX', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {new Date(visita.fecha_hora).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary text-sm truncate">
                    {visita.solicitud.publicacion.inmueble.tipo_inmueble}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {visita.solicitud.inquilino.usuario.nombre}{' '}
                    {visita.solicitud.inquilino.usuario.apellido} ·{' '}
                    {new Date(visita.fecha_hora).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Modalidad: <span className="capitalize">{visita.modalidad}</span>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    visita.estado === 'agendada'
                      ? 'bg-yellow-100 text-yellow-700'
                      : visita.estado === 'completada'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {visita.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mis solicitudes */}
      {usuario.inquilino && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <FileText size={22} /> Mis solicitudes
          </h2>

          {misSolicitudes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-on-surface-variant mb-3">
                Aún no has solicitado ninguna propiedad
              </p>
              <Link
                href="/propiedades"
                className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm"
              >
                Explorar propiedades
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {misSolicitudes.map((sol) => (
                <div key={sol.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                  {sol.publicacion.fotos[0] && (
                    <img
                      src={sol.publicacion.fotos[0].ruta_archivo}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">
                      {sol.publicacion.inmueble.tipo_inmueble}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {sol.publicacion.inmueble.direccion}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sol.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-700'
                        : sol.estado === 'aprobada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sol.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sin actividad */}
      {!usuario.propietario && !usuario.inquilino && !usuario.administrador && (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-on-surface-variant mb-2">Aún no tienes actividad en Rentify</p>
          <p className="text-sm text-on-surface-variant">
            Explora propiedades o publica tu primer inmueble para comenzar
          </p>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}