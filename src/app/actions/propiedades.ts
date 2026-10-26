'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export interface PublicarState {
  error?: string
  success?: boolean
}

export async function publicarPropiedadAction(
  prevState: PublicarState,
  formData: FormData
): Promise<PublicarState> {
  const usuario = await getCurrentUser()
  if (!usuario) return { error: 'Debes iniciar sesión para publicar' }

  const tipo_inmueble = formData.get('tipo_inmueble') as string
  const direccion = formData.get('direccion') as string
  const numero_habitaciones = parseInt(formData.get('numero_habitaciones') as string)
  const numero_banos = parseInt(formData.get('numero_banos') as string)
  const metros_cuadrados = parseFloat(formData.get('metros_cuadrados') as string)
  const precio_renta = parseFloat(formData.get('precio_renta') as string)
  const deposito = parseFloat(formData.get('deposito') as string)
  const descripcion = formData.get('descripcion') as string
  const reglas = formData.get('reglas') as string
  const mantenimientoIncluido = formData.get('mantenimiento_incluido') === 'on'
  const plazoMinimo = parseInt(formData.get('plazo_minimo_meses') as string) || 12
  const caracteristicasNombres = formData.getAll('caracteristicas') as string[]
  
  // Múltiples imágenes
  const imagenes = formData.getAll('imagenes') as string[]
  const imagenesValidas = imagenes.filter((url) => url && url.trim() !== '')

  if (
    !tipo_inmueble ||
    !direccion ||
    !numero_habitaciones ||
    !numero_banos ||
    !metros_cuadrados ||
    !precio_renta ||
    !deposito ||
    !descripcion ||
    imagenesValidas.length === 0
  ) {
    return { error: 'Todos los campos obligatorios deben estar completos (incluye al menos 1 foto)' }
  }

  if (precio_renta <= 0 || deposito < 0) {
    return { error: 'El precio y el depósito deben ser mayores a 0' }
  }

  try {
    let propietarioId: number

    if (usuario.propietario) {
      propietarioId = usuario.propietario.usuario_id
    } else {
      const nuevoPropietario = await prisma.propietario.create({
        data: {
          usuario_id: usuario.id,
          estado_verificacion: 'pendiente',
        },
      })
      propietarioId = nuevoPropietario.usuario_id
    }

    await prisma.$transaction(async (tx) => {
      const inmueble = await tx.inmueble.create({
        data: {
          propietario_id: propietarioId,
          tipo_inmueble,
          direccion,
          numero_habitaciones,
          numero_banos,
          metros_cuadrados,
          mantenimiento_incluido: mantenimientoIncluido,
          plazo_minimo_meses: plazoMinimo,
        },
      })

      // Asociar características
      for (const nombre of caracteristicasNombres) {
        let caracteristica = await tx.caracteristica.findFirst({
          where: { nombre },
        })

        if (!caracteristica) {
          caracteristica = await tx.caracteristica.create({
            data: { nombre },
          })
        }

        await tx.inmuebleCaracteristica.create({
          data: {
            inmueble_id: inmueble.id,
            caracteristica_id: caracteristica.id,
          },
        })
      }

      const publicacion = await tx.publicacion.create({
        data: {
          inmueble_id: inmueble.id,
          precio_renta,
          deposito,
          descripcion,
          reglas: reglas || null,
          estado: 'activa',
        },
      })

      // Crear todas las fotos
      for (let i = 0; i < imagenesValidas.length; i++) {
        await tx.foto.create({
          data: {
            publicacion_id: publicacion.id,
            ruta_archivo: imagenesValidas[i],
            orden: i + 1,
          },
        })
      }
    })

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error al publicar propiedad:', error)
    return { error: 'Error al publicar la propiedad. Intenta de nuevo.' }
  }

  redirect('/dashboard')
}