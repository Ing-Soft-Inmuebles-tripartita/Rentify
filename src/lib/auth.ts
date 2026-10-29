import { prisma } from './prisma'
import { createSupabaseServerClient } from './supabase-server'

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error al validar la sesión de Supabase:', error)
    throw new Error('No se pudo validar la sesión. Intenta de nuevo.')
  }

  if (!user?.email) return null

  let usuario = await prisma.usuario.findUnique({
    where: { auth_user_id: user.id },
    include: {
      propietario: true,
      inquilino: true,
      administrador: true,
    },
  })

  if (!usuario) {
    const cuentaExistente = await prisma.usuario.findFirst({
      where: { correo: { equals: user.email, mode: 'insensitive' } },
    })

    if (!cuentaExistente) return null

    usuario = await prisma.usuario.update({
      where: { id: cuentaExistente.id },
      data: {
        auth_user_id: user.id,
        verificado_email: Boolean(user.email_confirmed_at),
      },
      include: {
        propietario: true,
        inquilino: true,
        administrador: true,
      },
    })
  }

  if (usuario.bloqueado) return null
  return usuario
}
