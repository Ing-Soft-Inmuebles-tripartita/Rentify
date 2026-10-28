'use client'

import { cambiarEstadoInmuebleAction } from '@/app/actions/inmuebles'

const ESTADOS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_negociacion', label: 'En negociación' },
  { value: 'rentado', label: 'Rentado' },
  { value: 'pausado', label: 'Pausado' },
]

interface Props {
  inmuebleId: number
  estadoActual: string
}

export default function CambiarEstadoInmuebleForm({
  inmuebleId,
  estadoActual,
}: Props) {
  const color =
    estadoActual === 'disponible'
      ? 'bg-green-100 text-green-700'
      : estadoActual === 'en_negociacion'
      ? 'bg-yellow-100 text-yellow-700'
      : estadoActual === 'rentado'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-700'

  return (
    <form action={cambiarEstadoInmuebleAction} className="mt-3">
      <input type="hidden" name="inmueble_id" value={inmuebleId} />
      <label className="sr-only" htmlFor={`estado-inmueble-${inmuebleId}`}>
        Estado del inmueble
      </label>
      <select
        id={`estado-inmueble-${inmuebleId}`}
        name="estado"
        defaultValue={estadoActual}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={`w-full text-xs font-semibold rounded-lg px-2 py-1.5 cursor-pointer border-0 ${color}`}
      >
        {ESTADOS.map((estado) => (
          <option key={estado.value} value={estado.value}>
            {estado.label}
          </option>
        ))}
      </select>
    </form>
  )
}
