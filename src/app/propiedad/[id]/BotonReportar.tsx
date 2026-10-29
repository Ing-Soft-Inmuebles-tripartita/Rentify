// Purpose: Abre el flujo de reporte desde la ficha de propiedad.
'use client'

import { useActionState, useState } from 'react'
import { Flag, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { crearReporteAction, ReporteState } from '@/app/actions/reportes'

const initialState: ReporteState = {}

const MOTIVOS = [
  'Información falsa',
  'Fotos engañosas',
  'Precio engañoso',
  'Propiedad ya no disponible',
  'Contenido discriminatorio',
  'Posible fraude',
  'Spam o duplicado',
  'Otro',
]

interface Props {
  publicacionId: number
}

export default function BotonReportar({ publicacionId }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [state, formAction, isPending] = useActionState(
    crearReporteAction,
    initialState
  )

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-red-600 transition"
      >
        <Flag size={14} /> Reportar
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Flag size={20} /> Reportar publicación
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Ayúdanos a mantener Rentify seguro. Tu reporte es anónimo.
                </p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {state?.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl text-sm flex items-start gap-3">
                  <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Reporte enviado</p>
                    <p>{state.mensaje}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAbierto(false)}
                  className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-secondary transition font-semibold"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="publicacion_id" value={publicacionId} />

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1.5">
                    Motivo del reporte *
                  </label>
                  <select
                    name="motivo"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm"
                  >
                    <option value="">Selecciona un motivo</option>
                    {MOTIVOS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    placeholder="Cuéntanos con más detalle qué pasa con esta publicación..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm resize-none"
                  />
                </div>

                {state?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {state.error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    className="flex-1 border-2 border-gray-200 text-on-surface-variant py-2.5 rounded-xl hover:bg-gray-50 font-semibold text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Flag size={14} /> Enviar reporte
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}