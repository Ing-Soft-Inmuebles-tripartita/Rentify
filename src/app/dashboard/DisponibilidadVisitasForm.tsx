// Purpose: Permite configurar los dias y horario semanal de visitas.
import { guardarDisponibilidadVisitasAction } from '@/app/actions/visitas'
import { parsearDisponibilidadVisitas } from '@/lib/disponibilidad-visitas'

const DIAS = [
  { valor: 0, etiqueta: 'Domingo' },
  { valor: 1, etiqueta: 'Lunes' },
  { valor: 2, etiqueta: 'Martes' },
  { valor: 3, etiqueta: 'Miércoles' },
  { valor: 4, etiqueta: 'Jueves' },
  { valor: 5, etiqueta: 'Viernes' },
  { valor: 6, etiqueta: 'Sábado' },
]

export default function DisponibilidadVisitasForm({
  inmuebleId,
  disponibilidadGuardada,
}: {
  inmuebleId: number
  disponibilidadGuardada: unknown
}) {
  const disponibilidad = parsearDisponibilidadVisitas(disponibilidadGuardada)
  const diasSeleccionados =
    disponibilidad === null
      ? DIAS.map((dia) => dia.valor)
      : disponibilidad.map((franja) => franja.dia_semana)
  const primeraFranja = disponibilidad?.[0]

  return (
    <details className="mt-3 rounded-lg border border-secondary/20 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-primary">
        Configurar disponibilidad de visitas
      </summary>
      <form action={guardarDisponibilidadVisitasAction} className="mt-3 space-y-3">
        <input type="hidden" name="inmueble_id" value={inmuebleId} />
        <fieldset className="grid grid-cols-2 gap-2 text-xs">
          <legend className="mb-2 text-on-surface-variant">
            Días disponibles (si no seleccionas ninguno, se desactivan las visitas)
          </legend>
          {DIAS.map((dia) => (
            <label key={dia.valor} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="dias"
                value={dia.valor}
                defaultChecked={diasSeleccionados.includes(dia.valor)}
              />
              {dia.etiqueta}
            </label>
          ))}
        </fieldset>
        <div className="flex items-center gap-2 text-xs">
          <label>
            Desde
            <input
              type="time"
              name="hora_inicio"
              required
              defaultValue={primeraFranja?.hora_inicio ?? '09:00'}
              className="ml-1 rounded border px-2 py-1"
            />
          </label>
          <label>
            Hasta
            <input
              type="time"
              name="hora_fin"
              required
              defaultValue={primeraFranja?.hora_fin ?? '19:00'}
              className="ml-1 rounded border px-2 py-1"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
        >
          Guardar horarios
        </button>
      </form>
    </details>
  )
}
