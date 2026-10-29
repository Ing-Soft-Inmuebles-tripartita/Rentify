'use client'

import { useActionState } from 'react'
import { Plus, Trash2, Phone, User, MessageSquare } from 'lucide-react'
import {
  crearReferenciaAction,
  eliminarReferenciaAction,
  ReferenciaState,
} from '@/app/actions/referencias'

const initialState: ReferenciaState = {}

interface Props {
  referencias: {
    id: number
    nombre_contacto: string
    telefono: string
    relacion: string
    comentario: string | null
  }[]
}

export default function ReferenciasSection({ referencias }: Props) {
  const [state, formAction, isPending] = useActionState(
    crearReferenciaAction,
    initialState
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary">Referencias de renta</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Los propietarios las verán al revisar tus solicitudes
          </p>
        </div>
      </div>

      {referencias.length === 0 ? (
        <p className="text-sm text-on-surface-variant mb-4">
          Aún no has agregado referencias.
        </p>
      ) : (
        <ul className="space-y-2 mb-5">
          {referencias.map((r) => (
            <li
              key={r.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-surface-canvas border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <User size={14} className="text-secondary" />
                  <span className="font-semibold text-primary text-sm">
                    {r.nombre_contacto}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                    {r.relacion}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <Phone size={12} /> {r.telefono}
                </p>
                {r.comentario && (
                  <p className="text-xs text-gray-500 mt-1 italic flex items-start gap-1">
                    <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
                    {r.comentario}
                  </p>
                )}
              </div>
              <form action={eliminarReferenciaAction}>
                <input type="hidden" name="referencia_id" value={r.id} />
                <button
                  type="submit"
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                  aria-label="Eliminar referencia"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 pt-3 border-t border-gray-100">
        <p className="text-sm font-semibold text-primary">Agregar referencia</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            name="nombre_contacto"
            required
            placeholder="Nombre del contacto"
            className="px-3 py-2 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm"
          />
          <input
            name="telefono"
            required
            placeholder="Teléfono"
            className="px-3 py-2 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm"
          />
          <select
            name="relacion"
            required
            defaultValue=""
            className="px-3 py-2 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm"
          >
            <option value="" disabled>
              Relación...
            </option>
            <option value="Propietario anterior">Propietario anterior</option>
            <option value="Familiar">Familiar</option>
            <option value="Trabajo">Trabajo</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <textarea
          name="comentario"
          rows={2}
          placeholder="Comentario (opcional)"
          className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm resize-none"
        />

        {state?.error && (
          <p className="text-xs text-red-600">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-xs text-status-success">{state.mensaje}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl hover:bg-secondary transition font-semibold text-sm disabled:opacity-50"
        >
          <Plus size={14} /> {isPending ? 'Guardando...' : 'Agregar referencia'}
        </button>
      </form>
    </div>
  )
}   