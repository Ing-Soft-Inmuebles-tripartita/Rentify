'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { solicitarRecuperacionAction, FormState } from '@/app/actions/auth'

const initialState: FormState = {}

export default function RecuperarPage() {
  const [state, formAction, isPending] = useActionState(
    solicitarRecuperacionAction,
    initialState
  )

  return (
    <main className="min-h-screen bg-[#F3F1EB] flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
        <Link
          href="/login"
          className="flex items-center gap-2 text-[#3A4D39] font-medium mb-6 hover:opacity-80"
        >
          <ArrowLeft size={18} /> Volver al login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3A4D39] rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F1F1F]">Recuperar contraseña</h1>
          <p className="text-gray-500 text-sm mt-2">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {state?.success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-sm text-center">
            <p className="font-medium mb-1">Revisa tu correo</p>
            <p>{state.mensaje}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
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

            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#3A4D39] text-white py-3 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50"
            >
              {isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}