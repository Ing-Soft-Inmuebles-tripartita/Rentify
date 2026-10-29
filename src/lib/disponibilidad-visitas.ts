export interface FranjaDisponibilidad {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

export function parsearDisponibilidadVisitas(valor: unknown): FranjaDisponibilidad[] | null {
  if (valor === null || valor === undefined) return null
  if (!Array.isArray(valor)) return []

  return valor.filter(
    (franja): franja is FranjaDisponibilidad =>
      typeof franja === 'object' &&
      franja !== null &&
      'dia_semana' in franja &&
      typeof franja.dia_semana === 'number' &&
      Number.isInteger(franja.dia_semana) &&
      franja.dia_semana >= 0 &&
      franja.dia_semana <= 6 &&
      'hora_inicio' in franja &&
      typeof franja.hora_inicio === 'string' &&
      'hora_fin' in franja &&
      typeof franja.hora_fin === 'string'
  )
}

export function horaDisponible(
  disponibilidad: FranjaDisponibilidad[] | null,
  fecha: string,
  hora: string
): boolean {
  if (disponibilidad === null) return true
  const dia = new Date(`${fecha}T12:00:00`).getDay()
  const minutos = (valor: string) => {
    const [horas, minutos] = valor.split(':').map(Number)
    return horas * 60 + minutos
  }
  const horaMinutos = minutos(hora)

  return disponibilidad.some(
    (franja) =>
      franja.dia_semana === dia &&
      horaMinutos >= minutos(franja.hora_inicio) &&
      horaMinutos < minutos(franja.hora_fin)
  )
}
