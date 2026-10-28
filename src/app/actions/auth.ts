'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { createSession, destroySession } from '@/lib/auth'
import { generarToken, calcularExpiracion, estaExpirado, hashToken } from '@/lib/tokens'
import { enviarEmailRecuperacion } from '@/lib/email'

export interface FormState {
  error?: string
  success?: boolean
  mensaje?: string
}

export async function registroAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const correo = formData.get('correo') as string
  const contrasena = formData.get('contrasena') as string
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string

  if (!nombre || !apellido || !correo || !contrasena || !fecha_nacimiento) {
    return { error: 'Todos los campos son obligatorios' }
  }

  if (contrasena.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const existe = await prisma.usuario.findUnique({ where: { correo } })
  if (existe) {
    return { error: 'Este correo ya está registrado' }
  }

  const contrasenaHash = await hashPassword(contrasena)

  try {
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        correo,
        contrasena: contrasenaHash,
        fecha_nacimiento: new Date(fecha_nacimiento),
        estado: 'activo',
        verificado_email: false,
        preferencias_email: {
          solicitudes: true,
          visitas: true,
          evaluaciones: true,
          marketing: false,
        },
      },
    })

    await createSession({
      usuarioId: usuario.id,
      correo: usuario.correo,
      esAdmin: false,
    })
  } catch (error) {
    console.error('Error registro:', error)
    return { error: 'Error al crear la cuenta. Intenta de nuevo.' }
  }

  redirect('/dashboard')
}

export async function loginAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const correo = formData.get('correo') as string
  const contrasena = formData.get('contrasena') as string

  if (!correo || !contrasena) {
    return { error: 'Correo y contraseña son obligatorios' }
  }

  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    include: {
      propietario: true,
      inquilino: true,
      administrador: true,
    },
  })

  if (!usuario) {
    return { error: 'Correo o contraseña incorrectos' }
  }

  const valida = await verifyPassword(contrasena, usuario.contrasena)
  if (!valida) {
    return { error: 'Correo o contraseña incorrectos' }
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimo_acceso: new Date() },
  })

  await createSession({
    usuarioId: usuario.id,
    correo: usuario.correo,
    esAdmin: !!usuario.administrador,
  })

  redirect('/dashboard')
}

export async function logoutAction() {
  await destroySession()
  redirect('/')
}

export async function solicitarRecuperacionAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const correo = formData.get('correo') as string

  if (!correo) {
    return { error: 'El correo es obligatorio' }
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo } })

  if (!usuario) {
    // Responder igual exista o no la cuenta evita revelar qué correos están registrados.
    return {
      success: true,
      mensaje:
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    }
  }

  try {
    const token = generarToken()
    const expiracion = calcularExpiracion(1)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        email_token: hashToken(token),
        email_token_expira: expiracion,
      },
    })

    await enviarEmailRecuperacion(usuario.correo, usuario.nombre, token)
  } catch (error) {
    console.error('Error solicitar recuperación:', error)
    return { error: 'Error al procesar la solicitud. Intenta de nuevo.' }
  }

  return {
    success: true,
    mensaje:
      'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
  }
}

export async function restablecerContrasenaAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = formData.get('token') as string
  const contrasena = formData.get('contrasena') as string
  const confirmar = formData.get('confirmar') as string

  if (!token || !contrasena || !confirmar) {
    return { error: 'Todos los campos son obligatorios' }
  }

  if (contrasena.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  if (contrasena !== confirmar) {
    return { error: 'Las contraseñas no coinciden' }
  }

  const usuario = await prisma.usuario.findFirst({
    // Acepta temporalmente tokens antiguos en claro para no invalidar enlaces aún vigentes.
    where: { email_token: { in: [hashToken(token), token] } },
  })

  if (!usuario) {
    return { error: 'El enlace de recuperación es inválido' }
  }

  if (estaExpirado(usuario.email_token_expira)) {
    return { error: 'El enlace ha expirado. Solicita uno nuevo.' }
  }

  try {
    const contrasenaHash = await hashPassword(contrasena)

    // Al cambiar la contraseña se invalida el enlace para impedir que se vuelva a usar.
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        contrasena: contrasenaHash,
        email_token: null,
        email_token_expira: null,
      },
    })
  } catch (error) {
    console.error('Error restablecer contraseña:', error)
    return { error: 'Error al restablecer la contraseña. Intenta de nuevo.' }
  }

  redirect('/login?recuperado=1')
}