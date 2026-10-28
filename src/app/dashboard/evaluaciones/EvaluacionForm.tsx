'use client'

import { useActionState, useState } from 'react'
import { Star, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { crearEvaluacionAction, EvaluacionState } from '@/app/actions/evaluaciones'

const initialState: EvaluacionState = {}

interface Props {
  experienciaId: number
  tipo: 'inmueble' | 'propietario' | 'inquilino'
  titulo: string
  yaEvaluado: boolean
}

export default function EvaluacionForm({ experienciaId, tipo, titulo, yaEvaluado }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [calificacion, setCalificacion] = useState(5)
  const [state, formAction, isPending] = useActionState(crearEvaluacionAction, initialState)

  if (yaEvaluado) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
        <CheckCircle2 size={12} /> {titulo} ✓
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-secondary transition"
      >
        <Star size={12} /> {titulo}
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
              <h3 className="text-lg font-bold text-primary">{titulo}</h3>
              <button onClick={() => setAbierto(false)} className="text-on-surface-variant">
                <X size={20} />
              </button>
            </div>

            {state?.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle2 size={18} /> {state.mensaje}
                </div>
                <button
                  onClick={() => setAbierto(false)}
                  className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-secondary font-semibold"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="experiencia_renta_id" value={experienciaId} />
                <input type="hidden" name="tipo_evaluacion" value={tipo} />
                <input type="hidden" name="calificacion" value={calificacion} />

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Calificación
                  </label>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCalificacion(n)}
                        className="p-1 transition"
                      >
                        <Star
                          size={32}
                          className={
                            n <= calificacion
                              ? 'fill-rating-gold text-rating-gold'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-on-surface-variant mt-1">
                    {calificacion} de 5 estrellas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1.5">
                    Comentario (opcional)
                  </label>
                  <textarea
                    name="comentario"
                    rows={3}
                    placeholder="Comparte tu experiencia..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-canvas border border-gray-200 focus:ring-2 focus:ring-secondary outline-none text-sm resize-none"
                  />
                </div>

                {state?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {state.error}
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
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-secondary font-semibold text-sm disabled:opacity-50"
                  >
                    {isPending ? 'Enviando...' : 'Enviar evaluación'}
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