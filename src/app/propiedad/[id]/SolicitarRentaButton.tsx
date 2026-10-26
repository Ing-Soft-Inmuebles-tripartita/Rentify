// src/app/propiedad/[id]/SolicitarRentaButton.tsx
'use client'

import { useActionState, useState } from 'react'
import {
  X,
  Calendar,
  Video,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { agendarVisitaAction, VisitaState } from '@/app/actions/visitas'

const initialState: VisitaState = {}

interface Props {
  publicacionId: number
  titulo: string
  usuarioNombre?: string
  usuarioTelefono?: string
}

// Genera los próximos 7 días a partir de hoy
function generarDias() {
  const dias = []
  const hoy = new Date()
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  for (let i = 1; i <= 7; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    dias.push({
      iso: fecha.toISOString().split('T')[0],
      diaSemana: diasSemana[fecha.getDay()],
      dia: fecha.getDate(),
      mes: meses[fecha.getMonth()],
      label: i === 1 ? 'Mañana' : diasSemana[fecha.getDay()],
    })
  }
  return dias
}

const HORARIOS = [
  { value: '10:30', label: '10:30 AM', periodo: 'mañana' },
  { value: '11:45', label: '11:45 AM', periodo: 'mañana' },
  { value: '16:00', label: '04:00 PM', periodo: 'tarde' },
  { value: '17:15', label: '05:15 PM', periodo: 'tarde' },
  { value: '18:30', label: '06:30 PM', periodo: 'tarde' },
]

export default function SolicitarRentaButton({
  publicacionId,
  titulo,
  usuarioNombre = '',
  usuarioTelefono = '',
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [modalidad, setModalidad] = useState<'presencial' | 'videollamada'>('presencial')
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  const [state, formAction, isPending] = useActionState(
    agendarVisitaAction,
    initialState
  )

  const dias = generarDias()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!fechaSeleccionada || !horaSeleccionada) {
      e.preventDefault()
      alert('Selecciona una fecha y una hora')
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition font-semibold flex items-center justify-center gap-2 shadow-sm"
      >
        <Calendar size={18} />
        Solicitar visita
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-primary/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <div className="px-6 pt-6 pb-4 bg-surface-container-low/70 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold mb-2">
                    <CheckCircle2 size={12} />
                    Inmueble Certificado
                  </div>
                  <h2 className="text-xl font-bold text-primary">
                    Agendar visita guiada
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {titulo}
                  </p>
                </div>
                <button
                  onClick={() => setAbierto(false)}
                  className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modalidad */}
              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex p-1 bg-surface-container-high/80 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setModalidad('presencial')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      modalidad === 'presencial'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <User size={14} />
                    Presencial
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalidad('videollamada')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      modalidad === 'videollamada'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Video size={14} />
                    Videollamada
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-status-success text-[11px] font-semibold">
                  <CheckCircle2 size={14} />
                  Confirmación instantánea
                </div>
              </div>
            </div>

            {/* Cuerpo scrolleable */}
            <form
              action={formAction}
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto"
            >
              <div className="px-6 py-4 space-y-5">
                <input type="hidden" name="publicacion_id" value={publicacionId} />
                <input type="hidden" name="modalidad" value={modalidad} />
                <input type="hidden" name="fecha" value={fechaSeleccionada} />
                <input type="hidden" name="hora" value={horaSeleccionada} />

                {/* Paso 1: Fecha y hora */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-bold text-primary">
                      Selecciona día y hora
                    </h3>
                  </div>

                  {/* Días */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                    {dias.map((dia) => (
                      <button
                        key={dia.iso}
                        type="button"
                        onClick={() => setFechaSeleccionada(dia.iso)}
                        className={`p-2 rounded-xl text-left transition ${
                          fechaSeleccionada === dia.iso
                            ? 'bg-primary text-white shadow-sm ring-2 ring-primary'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="block text-[10px] font-medium uppercase opacity-80">
                          {dia.label}
                        </span>
                        <span className="block text-sm font-bold mt-0.5">
                          {dia.diaSemana} {dia.dia}
                        </span>
                        <span className="block text-[10px] opacity-70">
                          {dia.mes}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Horarios */}
                  <div className="bg-surface-container-lowest p-3 rounded-xl space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1 mb-2">
                        ☀️ Mañana
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {HORARIOS.filter((h) => h.periodo === 'mañana').map((h) => (
                          <button
                            key={h.value}
                            type="button"
                            onClick={() => setHoraSeleccionada(h.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                              horaSeleccionada === h.value
                                ? 'bg-primary text-white'
                                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1 mb-2">
                        🌇 Tarde
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {HORARIOS.filter((h) => h.periodo === 'tarde').map((h) => (
                          <button
                            key={h.value}
                            type="button"
                            onClick={() => setHoraSeleccionada(h.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                              horaSeleccionada === h.value
                                ? 'bg-primary text-white'
                                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Paso 2: Datos de contacto */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-bold text-primary">
                      Tus datos de contacto
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">
                        Nombre y apellido
                      </label>
                      <div className="relative">
                        <User
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                        />
                        <input
                          type="text"
                          name="nombre"
                          required
                          defaultValue={usuarioNombre}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest border border-gray-200 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                        />
                        <input
                          type="tel"
                          name="telefono"
                          required
                          defaultValue={usuarioTelefono}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest border border-gray-200 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
                          placeholder="+52 33 1234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-primary mb-1">
                      ¿Dudas o requerimientos? (opcional)
                    </label>
                    <div className="relative">
                      <MessageSquare
                        size={16}
                        className="absolute left-3 top-3 text-on-surface-variant"
                      />
                      <textarea
                        name="notas"
                        rows={2}
                        placeholder="Ej. Me gustaría revisar la iluminación para home office..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-lowest border border-gray-200 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Beneficios */}
                <section className="bg-surface-container-low rounded-xl p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-primary">100% sin costo</p>
                        <p className="text-on-surface-variant">Sin cobros ni compromiso</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-primary">Puntualidad</p>
                        <p className="text-on-surface-variant">Aviso 2 hrs antes con GPS</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-primary">Reglas de visita</p>
                        <p className="text-on-surface-variant">Máx. 2 personas, 10 min tolerancia</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Errores/Éxito */}
                {state?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {state.error}
                  </div>
                )}
                {state?.success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {state.mensaje}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t shadow-[0_-4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0">
                <div className="flex items-center gap-1 text-on-surface-variant text-[11px]">
                  <CheckCircle2 size={14} className="text-status-success" />
                  <span>Tus datos están protegidos</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition font-semibold text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !fechaSeleccionada || !horaSeleccionada}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-status-success text-white shadow-md hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      'Agendando...'
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Confirmar visita
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}