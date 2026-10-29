// Purpose: Componente reutilizable de interfaz. Despliega reputacion, verificacion, referencias y rentas previas.
'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Home,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react'

interface Props {
  historial: {
    verificado: boolean
    calificacion_promedio: number
    total_evaluaciones: number
    referencias: {
      id: number
      nombre_contacto: string
      telefono: string
      relacion: string
      comentario: string | null
    }[]
    experiencias: {
      id: number
      inmueble_tipo: string
      calificacion: number
      estado: string
    }[]
  }
}

export default function HistorialSolicitante({ historial }: Props) {
  const [abierto, setAbierto] = useState(false)
  const { verificado, calificacion_promedio, total_evaluaciones, referencias, experiencias } = historial

  return (
    <div className="mt-3 rounded-lg border border-secondary/20 bg-surface overflow-hidden">
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((actual) => !actual)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-container transition"
      >
        <span className="flex items-center gap-2">
          {verificado ? (
            <ShieldCheck size={16} className="text-status-success" />
          ) : (
            <ShieldAlert size={16} className="text-yellow-600" />
          )}
          <span className="text-xs font-semibold text-primary">
            Historial del solicitante
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              verificado
                ? 'bg-status-success/15 text-status-success'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {verificado ? 'Verificado' : 'Sin verificar'}
          </span>
        </span>
        {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 pt-1 text-sm space-y-3 border-t border-secondary/10">
          <section aria-label="Reputación del inquilino">
            <h3 className="text-xs font-semibold text-primary mb-1">Calificación como inquilino</h3>
            <p className="text-xs text-on-surface-variant">
              {total_evaluaciones > 0
                ? `${calificacion_promedio.toFixed(1)}/5 · ${total_evaluaciones} evaluación(es)`
                : 'Sin evaluaciones previas'}
            </p>
          </section>

          <section aria-label="Rentas previas">
            <h3 className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
              <Home size={12} /> Rentas previas
            </h3>
            {experiencias.length === 0 ? (
              <p className="text-xs text-on-surface-variant">
                Sin historial registrado.
              </p>
            ) : (
              <ul className="space-y-1">
                {experiencias.map((experiencia) => (
                  <li
                    key={experiencia.id}
                    className="text-xs text-on-surface-variant"
                  >
                    {experiencia.inmueble_tipo} —{' '}
                    {experiencia.calificacion > 0
                      ? `${experiencia.calificacion}/5`
                      : 'Sin calificaciones'}{' '}
                    {experiencia.calificacion > 0 && '⭐'} ({experiencia.estado})
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Referencias de renta">
            <h3 className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
              <User size={12} /> Referencias
            </h3>
            {referencias.length === 0 ? (
              <p className="text-xs text-on-surface-variant">
                Sin referencias.
              </p>
            ) : (
              <ul className="space-y-2">
                {referencias.map((referencia) => (
                  <li
                    key={referencia.id}
                    className="text-xs text-on-surface-variant"
                  >
                    <p>
                      <strong className="text-on-surface">
                        {referencia.nombre_contacto}
                      </strong>{' '}
                      ({referencia.relacion}) — {referencia.telefono}
                    </p>
                    {referencia.comentario && (
                      <p className="mt-0.5 text-on-surface-variant">
                        {referencia.comentario}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
