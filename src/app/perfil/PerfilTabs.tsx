'use client'

import { useActionState, useState } from 'react'
import { User, Lock, Bell } from 'lucide-react'
import type { Prisma } from '@prisma/client'
import {
  actualizarPerfilAction,
  cambiarContrasenaAction,
  actualizarPreferenciasAction,
  PerfilState,
} from '@/app/actions/perfil'
import ReferenciasSection from '@/components/perfil/ReferenciasSection'

const initialState: PerfilState = {}

interface Props {
  usuario: {
    nombre: string
    apellido: string
    telefono: string | null
    foto_perfil: string | null
    preferencias_email: Prisma.JsonValue | null
  }
  referencias: {
    id: number
    nombre_contacto: string
    telefono: string
    relacion: string
    comentario: string | null
  }[]
}

export default function PerfilTabs({ usuario, referencias }: Props) {
  const [tab, setTab] = useState<'datos' | 'seguridad' | 'preferencias'>('datos')

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex border-b">
        <TabButton active={tab === 'datos'} onClick={() => setTab('datos')} icon={<User size={16} />}>
          Datos personales
        </TabButton>
        <TabButton active={tab === 'seguridad'} onClick={() => setTab('seguridad')} icon={<Lock size={16} />}>
          Seguridad
        </TabButton>
        <TabButton active={tab === 'preferencias'} onClick={() => setTab('preferencias')} icon={<Bell size={16} />}>
          Notificaciones
        </TabButton>
      </div>

      <div className="p-6">
        {tab === 'datos' && (
          <TabDatos usuario={usuario} referencias={referencias} />
        )}
        {tab === 'seguridad' && <TabSeguridad />}
        {tab === 'preferencias' && <TabPreferencias usuario={usuario} />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
        active
          ? 'text-[#3A4D39] border-b-2 border-[#3A4D39] bg-[#3A4D39]/5'
          : 'text-gray-500 hover:text-[#3A4D39] hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}

function TabDatos({ usuario, referencias }: Props) {
  const [state, formAction, isPending] = useActionState(actualizarPerfilAction, initialState)

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre" name="nombre" defaultValue={usuario.nombre} required />
          <Field label="Apellido" name="apellido" defaultValue={usuario.apellido} required />
        </div>
        <Field label="Teléfono" name="telefono" type="tel" defaultValue={usuario.telefono || ''} placeholder="+52 33 1234 5678" />
        <Field label="URL de foto de perfil" name="foto_perfil" type="url" defaultValue={usuario.foto_perfil || ''} placeholder="https://..." />

        {state?.error && <Alert type="error">{state.error}</Alert>}
        {state?.success && <Alert type="success">{state.mensaje}</Alert>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#3A4D39] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <ReferenciasSection referencias={referencias} />
    </div>
  )
}

function TabSeguridad() {
  const [state, formAction, isPending] = useActionState(cambiarContrasenaAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Contraseña actual" name="actual" type="password" required />
      <Field label="Contraseña nueva" name="nueva" type="password" required minLength={6} />
      <Field label="Confirmar contraseña nueva" name="confirmar" type="password" required minLength={6} />

      {state?.error && <Alert type="error">{state.error}</Alert>}
      {state?.success && <Alert type="success">{state.mensaje}</Alert>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#3A4D39] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50"
      >
        {isPending ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

function TabPreferencias({ usuario }: Pick<Props, 'usuario'>) {
  const [state, formAction, isPending] = useActionState(actualizarPreferenciasAction, initialState)
  const preferencias = usuario.preferencias_email
  const prefs =
    preferencias && typeof preferencias === 'object' && !Array.isArray(preferencias)
      ? preferencias
      : {}

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Elige qué emails quieres recibir de Rentify.
      </p>

      <Checkbox name="solicitudes" defaultChecked={prefs.solicitudes !== false} label="Solicitudes de renta" description="Cuando alguien solicite una de tus propiedades o cuando actualicen tu solicitud" />
      <Checkbox name="visitas" defaultChecked={prefs.visitas !== false} label="Visitas agendadas" description="Recordatorios de visitas presenciales o virtuales" />
      <Checkbox name="evaluaciones" defaultChecked={prefs.evaluaciones !== false} label="Evaluaciones" description="Cuando recibas una calificación" />
      <Checkbox name="marketing" defaultChecked={prefs.marketing === true} label="Novedades y marketing" description="Consejos, propiedades destacadas y promociones" />

      {state?.error && <Alert type="error">{state.error}</Alert>}
      {state?.success && <Alert type="success">{state.mensaje}</Alert>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#3A4D39] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar preferencias'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  required,
  minLength,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
      />
    </div>
  )
}

function Checkbox({ name, defaultChecked, label, description }: { name: string; defaultChecked: boolean; label: string; description: string }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 w-4 h-4 accent-[#3A4D39]"
      />
      <div>
        <p className="font-medium text-[#1F1F1F] text-sm">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  )
}

function Alert({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const styles = type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
  return <div className={`px-4 py-2 rounded-lg text-sm border ${styles}`}>{children}</div>
}