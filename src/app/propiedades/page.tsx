import { Suspense } from 'react'
import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import type { Prisma } from '@prisma/client'
import Navbar from '@/components/Navbar'
import PropertyCard from '@/components/PropertyCard'
import { prisma } from '@/lib/prisma'

interface Props {
  searchParams: Promise<{
    ubicacion?: string
    precio?: string
    tipo?: string
    habitaciones?: string
  }>
}

async function getPropiedades(
  ubicacion?: string,
  precio?: string,
  tipo?: string,
  habitaciones?: string
) {
  // Los filtros vienen de la URL para que la búsqueda se pueda compartir o recargar.
  const where: Prisma.PublicacionWhereInput = {
    estado: 'activa',
  }
  const inmuebleWhere: Prisma.InmuebleWhereInput = {
    estado_inventario: 'disponible',
  }

  if (ubicacion) {
    inmuebleWhere.direccion = {
      contains: ubicacion,
      mode: 'insensitive',
    }
  }

  if (precio) {
    const precioMaximo = Number(precio)
    if (Number.isFinite(precioMaximo) && precioMaximo > 0) {
      where.precio_renta = { lte: precioMaximo }
    }
  }

  if (tipo) {
    inmuebleWhere.tipo_inmueble = { contains: tipo, mode: 'insensitive' }
  }

  if (habitaciones) {
    const cantidad = Number(habitaciones)
    if (Number.isInteger(cantidad) && cantidad > 0) {
      inmuebleWhere.numero_habitaciones = cantidad === 3 ? { gte: 3 } : cantidad
    }
  }

  where.inmueble = { is: inmuebleWhere }

  const publicaciones = await prisma.publicacion.findMany({
    where,
    include: {
      inmueble: { include: { propietario: true } },
      fotos: {
        orderBy: { orden: 'asc' },
        take: 1,
      },
    },
    orderBy: {
      fecha_publicacion: 'desc',
    },
  })

  return publicaciones.map((pub) => ({
    id: pub.id,
    titulo: pub.inmueble.tipo_inmueble,
    ubicacion: pub.inmueble.direccion,
    precio: pub.precio_renta,
    habitaciones: pub.inmueble.numero_habitaciones,
    banos: pub.inmueble.numero_banos,
    estacionamiento: 1,
    metros: pub.inmueble.metros_cuadrados,
    tipo: pub.inmueble.tipo_inmueble,
    verificada:
      pub.inmueble.documento_verificado &&
      pub.inmueble.propietario.estado_verificacion === 'verificado',
    imagen:
      pub.fotos[0]?.ruta_archivo ||
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }))
}

async function PropiedadesContent({ searchParams }: Props) {
  const { ubicacion, precio, tipo, habitaciones } = await searchParams
  const propiedades = await getPropiedades(ubicacion, precio, tipo, habitaciones)
  const filtros = { ubicacion, precio, tipo, habitaciones }
  const urlSinFiltro = (omitido: keyof typeof filtros) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (key !== omitido && value) params.set(key, value)
    })
    const query = params.toString()
    return query ? `/propiedades?${query}` : '/propiedades'
  }

  return (
    <div className="flex flex-col w-full">
      {/* Barra de filtros sticky */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center flex-wrap gap-2">
              {ubicacion && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-semibold shadow-sm">
                  <MapPin size={14} className="text-secondary" />
                  {ubicacion}
                  <Link
                    href={urlSinFiltro('ubicacion')}
                    className="ml-1 text-white/70 hover:text-white"
                    aria-label="Quitar filtro de ubicación"
                  >
                    ×
                  </Link>
                </span>
              )}
              {precio && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-semibold hover:bg-surface-container-high transition">
                  💰 Hasta ${parseInt(precio).toLocaleString()} MXN
                  <Link
                    href={urlSinFiltro('precio')}
                    className="ml-1 text-on-surface-variant hover:text-on-surface"
                    aria-label="Quitar filtro de precio"
                  >
                    ×
                  </Link>
                </span>
              )}
              {tipo && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-semibold">
                  Tipo: {tipo}
                  <Link href={urlSinFiltro('tipo')} className="ml-1 text-on-surface-variant hover:text-on-surface" aria-label="Quitar filtro de tipo">
                    ×
                  </Link>
                </span>
              )}
              {habitaciones && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-on-surface rounded-full text-xs font-semibold">
                  {habitaciones === '3' ? '3 o más recámaras' : `${habitaciones} recámara${habitaciones === '1' ? '' : 's'}`}
                  <Link href={urlSinFiltro('habitaciones')} className="ml-1 text-on-surface-variant hover:text-on-surface" aria-label="Quitar filtro de recámaras">
                    ×
                  </Link>
                </span>
              )}
              {!ubicacion && !precio && !tipo && !habitaciones && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-semibold shadow-sm">
                  <MapPin size={14} className="text-secondary" />
                  Guadalajara, Jalisco
                </span>
              )}
              <Link
                href="/propiedades"
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-low text-on-surface rounded-full text-xs font-semibold hover:bg-surface-container transition"
              >
                Todas las propiedades
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
              <p className="text-sm text-on-surface">
                <strong className="text-base font-bold text-primary">
                  {propiedades.length}
                </strong>{' '}
                viviendas disponibles
                {ubicacion && ` en ${ubicacion}`}
                {precio && ` hasta $${parseInt(precio).toLocaleString()}`}
                {tipo && ` · tipo ${tipo}`}
                {habitaciones && ` · ${habitaciones === '3' ? '3 o más' : habitaciones} recámaras`}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label className="text-xs font-semibold text-on-surface-variant">
                Ordenar por:
              </label>
              <select className="appearance-none bg-white text-on-surface text-xs font-semibold pl-2 pr-7 py-1.5 rounded-lg shadow-sm focus:outline-none cursor-pointer">
                <option>Más recomendados</option>
                <option>Menor a mayor precio</option>
                <option>Mayor a menor precio</option>
                <option>Recientes</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de propiedades */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-8 pb-6">
        {propiedades.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">
              No se encontraron propiedades con esos filtros.
            </p>
            <Link href="/propiedades" className="text-primary font-semibold underline">
              Ver todas las propiedades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propiedades.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}

        {/* Paginación */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant">
            Mostrando <span className="font-bold text-on-surface">1 - {propiedades.length}</span>{' '}
            de {propiedades.length} residencias publicadas
          </p>
          <nav className="flex items-center gap-1.5">
            <button
              disabled
              className="w-10 h-10 rounded-xl bg-white text-on-surface-variant flex items-center justify-center shadow-sm"
            >
              ←
            </button>
            <button className="w-10 h-10 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm">
              1
            </button>
            <button className="px-4 h-10 rounded-xl bg-white hover:bg-surface-container text-primary text-xs font-semibold shadow-sm transition">
              Siguiente →
            </button>
          </nav>
        </div>
      </section>
    </div>
  )
}

export default async function PropiedadesPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-20">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <PropiedadesContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}