'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export interface ReferenciaState {
  error?: string
  success?: boolean
  mensaje?: string
}

function obtenerTexto(formData: FormData, campo: string): string {
  const valor = formData.get(campo)
  return typeof valor === 'string' ? valor.trim() : ''
}

export async function crearReferenciaAction(
  prevState: ReferenciaState,
  formData: FormData
): Promise<ReferenciaState> {
  void prevState

  const usuario = await getCurrentUser()
  if (!usuario) return { error: 'No autorizado' }

  const nombre_contacto = obtenerTexto(formData, 'nombre_contacto')
  const telefono = obtenerTexto(formData, 'telefono')
  const relacion = obtenerTexto(formData, 'relacion')
  const comentario = obtenerTexto(formData, 'comentario') || null

  if (!nombre_contacto || !telefono || !relacion) {
    return { error: 'Nombre, teléfono y relación son obligatorios' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const inquilino = await tx.inquilino.upsert({
        where: { usuario_id: usuario.id },
        create: {
          usuario_id: usuario.id,
          estado_verificacion: 'pendiente',
        },
        update: {},
      })

      await tx.referenciaRenta.create({
        data: {
          inquilino_id: inquilino.usuario_id,
          nombre_contacto,
          telefono,
          relacion,
          comentario,
        },
      })
    })

    revalidatePath('/perfil')
    return { success: true, mensaje: 'Referencia agregada' }
  } catch (error) {
    console.error('Error crear referencia:', error)
    return { error: 'Error al guardar la referencia' }
  }
}

export async function eliminarReferenciaAction(formData: FormData): Promise<void> {
  const usuario = await getCurrentUser()
  if (!usuario) {
    throw new Error('No autorizado')
  }

  const id = Number(formData.get('referencia_id'))
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('La referencia indicada no es válida')
  }

  const resultado = await prisma.referenciaRenta.deleteMany({
    where: {
      id,
      inquilino_id: usuario.id,
    },
  })

  if (resultado.count !== 1) {
    throw new Error('La referencia no existe o no tienes permiso para eliminarla')
  }

  revalidatePath('/perfil')
}