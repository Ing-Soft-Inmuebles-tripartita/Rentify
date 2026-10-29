// Purpose: Genera tokens aleatorios y huellas criptograficas para enlaces de un solo uso.
import { randomBytes, createHash } from 'crypto'

export function generarToken(): string {
  // El token aleatorio se puede incluir en enlaces enviados al usuario.
  return randomBytes(32).toString('hex')
}

export function calcularExpiracion(horas: number = 1): Date {
  return new Date(Date.now() + horas * 60 * 60 * 1000)
}

export function estaExpirado(fechaExpiracion: Date | null): boolean {
  if (!fechaExpiracion) return true
  return fechaExpiracion.getTime() < Date.now()
}

export function hashToken(token: string): string {
  // La base de datos conserva solo esta huella; el token original se comparte únicamente con el usuario.
  return createHash('sha256').update(token).digest('hex')
}