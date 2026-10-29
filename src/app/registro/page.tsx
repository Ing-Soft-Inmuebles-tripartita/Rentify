// Purpose: Pagina de Next.js para la ruta /registro.
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Mail, Lock, User, Calendar, Phone, MapPin, Image as ImageIcon } from 'lucide-react'
import { registroAction, FormState } from '@/app/actions/auth'
import { ESTADOS_MEXICO } from '@/lib/estados-mexico'

const initialState: FormState = {}

export default function RegistroPage() {
  const [state, formAction, isPending] = useActionState(registroAction, initialState)

  return (
    <main className="min-h-screen bg-[#F3F1EB] flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#3A4D39] font-medium mb-6 hover:opacity-80"
        >
          <ArrowLeft size={18} /> Volver
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3A4D39] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F1F1F]">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-2">
            Únete a Rentify: renta y publica sin límites
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Juan"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                name="apellido"
                required
                placeholder="Pérez"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="correo"
                required
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="fecha_nacimiento"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="telefono"
                  required
                  autoComplete="tel"
                  minLength={7}
                  maxLength={25}
                  placeholder="+52 33 1234 5678"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado donde vives</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  name="estado_residencia"
                  required
                  defaultValue=""
                  autoComplete="address-level1"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
                >
                  <option value="" disabled>Selecciona tu estado</option>
                  {ESTADOS_MEXICO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil (opcional)</label>
            <div className="relative">
              <ImageIcon size={18} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                name="foto_perfil"
                placeholder="https://sitio.com/mi-foto.jpg"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Pega un enlace público a tu imagen. Podrás cambiarlo desde tu perfil.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="contrasena"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres, incluye letras y números"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {state?.success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold">Confirma tu correo</p>
              <p>{state.mensaje}</p>
            </div>
          ) : state?.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {state.error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending || state?.success}
            className="w-full bg-[#3A4D39] text-white py-3 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creando cuenta...' : state?.success ? 'Correo enviado' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#3A4D39] font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}