// Purpose: Acciones de servidor para Actualiza perfiles y contrasenas y registra documentos privados.
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { hashPassword } from '@/lib/password'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
  if (!usuario?.auth_user_id) return { error: 'No autorizado' }

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

  if (nueva.length < 8 || !/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) {
    return { error: 'La contraseña nueva debe tener al menos 8 caracteres, una letra y un número' }
  }

  if (nueva !== confirmar) {
    return { error: 'Las contraseñas nuevas no coinciden' }
  }

  const supabase = await createSupabaseServerClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: usuario.correo,
    password: actual,
  })
  if (loginError) {
    return { error: 'La contraseña actual es incorrecta' }
  }

  try {
    const { error: cambioError } = await supabase.auth.updateUser({ password: nueva })
    if (cambioError) {
      console.error('Error al cambiar contraseña en Supabase Auth:', cambioError)
      return { error: 'No se pudo actualizar la contraseña' }
    }

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

export async function subirDocumentoAction(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getCurrentUser()
  if (!usuario?.auth_user_id) return { error: 'No autorizado' }

  const tipo_documento = formData.get('tipo_documento')
  const ruta_archivo = formData.get('ruta_archivo')

  if (typeof tipo_documento !== 'string' || typeof ruta_archivo !== 'string') {
    return { error: 'Debes seleccionar un tipo y proporcionar el archivo' }
  }

  const tiposPermitidos = ['INE', 'COMPROBANTE_INGRESOS', 'COMPROBANTE_DOMICILIO', 'OTRO']
  const prefijoSeguro = `documentos/${usuario.auth_user_id}/`
  const nombreArchivo = ruta_archivo.startsWith(prefijoSeguro)
    ? ruta_archivo.slice(prefijoSeguro.length)
    : ''
  if (
    !tiposPermitidos.includes(tipo_documento) ||
    !/^[a-zA-Z0-9-]+\.(pdf|jpg|jpeg|png)$/i.test(nombreArchivo)
  ) {
    return { error: 'El tipo o la ruta del documento no son válidos' }
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

export async function subirDocumentoPropiedadAction(
  _prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getCurrentUser()
  if (!usuario?.propietario || !usuario.auth_user_id) {
    return { error: 'Debes iniciar sesión como propietario para subir documentos' }
  }

  const inmuebleId = Number(formData.get('inmueble_id'))
  const tipoDocumento = formData.get('tipo_documento')
  const rutaArchivo = formData.get('ruta_archivo')
  if (!Number.isInteger(inmuebleId) || inmuebleId <= 0) {
    return { error: 'El inmueble seleccionado no es válido' }
  }
  if (
    typeof tipoDocumento !== 'string' ||
    !['ESCRITURA', 'TITULO_PROPIEDAD', 'PREDIAL'].includes(tipoDocumento) ||
    typeof rutaArchivo !== 'string' ||
    !new RegExp(`^documentos/${usuario.auth_user_id}/[a-zA-Z0-9-]+\\.(pdf|jpg|jpeg|png)$`, 'i').test(rutaArchivo)
  ) {
    return { error: 'El tipo o la ruta del documento no son válidos' }
  }

  const inmueble = await prisma.inmueble.findUnique({
    where: { id: inmuebleId },
    select: { propietario_id: true },
  })
  if (!inmueble || inmueble.propietario_id !== usuario.id) {
    return { error: 'No tienes permiso para verificar este inmueble' }
  }

  try {
    await prisma.documento.create({
      data: {
        inmueble_id: inmuebleId,
        tipo_documento: tipoDocumento,
        ruta_archivo: rutaArchivo,
        estado: 'pendiente',
      },
    })
    revalidatePath('/dashboard/admin')
    revalidatePath('/perfil')
    return { success: true, mensaje: 'Documento legal enviado para revisión.' }
  } catch (error) {
    console.error('Error al subir documento legal:', error)
    return { error: 'No se pudo registrar el documento legal.' }
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