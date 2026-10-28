'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'

export interface PerfilState {
  error?: string
  success?: boolean
  mensaje?: string
}

export async function actualizarPerfilAction(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getCurrentUser()
  if (!usuario) return { error: 'No autorizado' }

  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const telefono = formData.get('telefono') as string
  const foto_perfil = formData.get('foto_perfil') as string

  if (!nombre || !apellido) {
    return { error: 'Nombre y apellido son obligatorios' }
  }

  try {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        nombre,
        apellido,
        telefono: telefono || null,
        foto_perfil: foto_perfil || null,
      },
    })

    revalidatePath('/perfil')
    revalidatePath('/dashboard')
    return { success: true, mensaje: 'Perfil actualizado correctamente' }
  } catch (error) {
    console.error('Error actualizar perfil:', error)
    return { error: 'Error al actualizar el perfil' }
  }
}

export async function cambiarContrasenaAction(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getCurrentUser()
  if (!usuario) return { error: 'No autorizado' }

  const actual = formData.get('actual') as string
  const nueva = formData.get('nueva') as string
  const confirmar = formData.get('confirmar') as string

  if (!actual || !nueva || !confirmar) {
    return { error: 'Todos los campos son obligatorios' }
  }

  if (nueva.length < 6) {
    return { error: 'La contraseña nueva debe tener al menos 6 caracteres' }
  }

  if (nueva !== confirmar) {
    return { error: 'Las contraseñas nuevas no coinciden' }
  }

  const valida = await verifyPassword(actual, usuario.contrasena)
  if (!valida) {
    return { error: 'La contraseña actual es incorrecta' }
  }

  try {
    const nuevaHash = await hashPassword(nueva)
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { contrasena: nuevaHash },
    })
    return { success: true, mensaje: 'Contraseña actualizada correctamente' }
  } catch (error) {
    console.error('Error cambiar contraseña:', error)
    return { error: 'Error al cambiar la contraseña' }
  }
}

export async function actualizarPreferenciasAction(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getCurrentUser()
  if (!usuario) return { error: 'No autorizado' }

  const preferencias = {
    solicitudes: formData.get('solicitudes') === 'on',
    visitas: formData.get('visitas') === 'on',
    evaluaciones: formData.get('evaluaciones') === 'on',
    marketing: formData.get('marketing') === 'on',
  }

  try {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { preferencias_email: preferencias },
    })

    revalidatePath('/perfil')
    return { success: true, mensaje: 'Preferencias guardadas' }
  } catch (error) {
    console.error('Error actualizar preferencias:', error)
    return { error: 'Error al guardar las preferencias' }
  }
}

export async function subirDocumentoAction(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getCurrentUser()
  if (!usuario) return { error: 'No autorizado' }

  const tipo_documento = formData.get('tipo_documento') as string
  const ruta_archivo = formData.get('ruta_archivo') as string

  if (!tipo_documento || !ruta_archivo) {
    return { error: 'Debes seleccionar un tipo y proporcionar el archivo' }
  }

  try {
    await prisma.documento.create({
      data: {
        usuario_id: usuario.id,
        tipo_documento,
        ruta_archivo,
        estado: 'pendiente',
      },
    })

    revalidatePath('/perfil')
    return { success: true, mensaje: 'Documento subido. Será revisado por un admin.' }
  } catch (error) {
    console.error('Error subir documento:', error)
    return { error: 'Error al subir el documento' }
  }
}

export async function eliminarDocumentoAction(formData: FormData) {
  const usuario = await getCurrentUser()
  if (!usuario) return

  const documentoId = parseInt(formData.get('documento_id') as string)
  if (!documentoId) return

  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
  })

  // El usuario solo puede borrar sus propios documentos mientras sigan pendientes de revisión.
  if (!documento) return
  if (documento.usuario_id !== usuario.id) return
  if (documento.estado === 'aprobado') return

  await prisma.documento.delete({ where: { id: documentoId } })
  revalidatePath('/perfil')
}