import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EditarPropiedadForm from './EditarPropiedadForm'

interface Props {
  params: Promise<{ id: string }>
}

async function EditarContent({ params }: Props) {
  const { id } = await params
  const inmuebleId = parseInt(id)

  if (isNaN(inmuebleId)) notFound()

  const usuario = await getCurrentUser()
  if (!usuario) redirect('/login')
  if (!usuario.propietario) redirect('/dashboard')

  const inmueble = await prisma.inmueble.findUnique({
    where: { id: inmuebleId },
    include: {
      publicaciones: {
        take: 1,
        orderBy: { fecha_publicacion: 'desc' },
        include: {
          fotos: { orderBy: { orden: 'asc' } },
        },
      },
    },
  })

  if (!inmueble) notFound()
  if (inmueble.propietario_id !== usuario.propietario.usuario_id) {
    redirect('/dashboard')
  }

  const publicacion = inmueble.publicaciones[0]

  return (
    <EditarPropiedadForm
      inmueble={{
        id: inmueble.id,
        tipo_inmueble: inmueble.tipo_inmueble,
        direccion: inmueble.direccion,
        numero_habitaciones: inmueble.numero_habitaciones,
        numero_banos: inmueble.numero_banos,
        metros_cuadrados: inmueble.metros_cuadrados,
        servicios_incluidos: inmueble.servicios_incluidos,
        plazo_minimo_meses: inmueble.plazo_minimo_meses,
        mantenimiento_incluido: inmueble.mantenimiento_incluido,
        publicacion: publicacion
          ? {
              id: publicacion.id,
              precio_renta: publicacion.precio_renta,
              deposito: publicacion.deposito,
              descripcion: publicacion.descripcion,
              reglas: publicacion.reglas,
              fotos: publicacion.fotos.map((f) => f.ruta_archivo),
            }
          : null,
      }}
    />
  )
}

export default function EditarPropiedadPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto space-y-4 py-8">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      }
    >
      <EditarContent params={params} />
    </Suspense>
  )
}