'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import {
  subirDocumentoAction,
  subirDocumentoPropiedadAction,
} from '@/app/actions/perfil'

export default function SubirDocumento({ inmuebleId }: { inmuebleId?: number }) {
  const router = useRouter()
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setExito(false)

    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const tipoSelect = form.querySelector('select') as HTMLSelectElement

    const file = fileInput?.files?.[0]
    if (!file) {
      setError('Selecciona un archivo')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar los 5 MB')
      return
    }

    setSubiendo(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Inicia sesión de nuevo para subir documentos.')

      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
        throw new Error('El archivo debe ser PDF, JPG o PNG.')
      }
      const fileName = `${crypto.randomUUID()}.${extension}`
      const path = `documentos/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('rentify')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        throw new Error(`Error al subir: ${uploadError.message}`)
      }

      const formData = new FormData()
      formData.set('tipo_documento', tipoSelect.value)
      formData.set('ruta_archivo', path)
      if (inmuebleId) formData.set('inmueble_id', String(inmuebleId))

      const result = inmuebleId
        ? await subirDocumentoPropiedadAction({}, formData)
        : await subirDocumentoAction({}, formData)

      if (result.error) {
        throw new Error(result.error)
      }

      setExito(true)
      form.reset()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
          <select
            name="tipo_documento"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A4D39] focus:border-transparent outline-none bg-white"
          >
            {inmuebleId ? (
              <>
                <option value="ESCRITURA">Escritura</option>
                <option value="TITULO_PROPIEDAD">Título de propiedad</option>
                <option value="PREDIAL">Predial</option>
              </>
            ) : (
              <>
                <option value="INE">INE / Identificación oficial</option>
                <option value="COMPROBANTE_INGRESOS">Comprobante de ingresos</option>
                <option value="COMPROBANTE_DOMICILIO">Comprobante de domicilio</option>
                <option value="OTRO">Otro</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo (PDF, JPG, PNG · máx 5 MB)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#3A4D39] file:text-white file:font-medium hover:file:opacity-90 file:cursor-pointer"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      {exito && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          ✓ Documento subido correctamente
        </p>
      )}

      <button
        type="submit"
        disabled={subiendo}
        className="w-full md:w-auto bg-[#3A4D39] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {subiendo ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Subiendo...
          </>
        ) : (
          <>
            <Upload size={16} /> Subir documento
          </>
        )}
      </button>
    </form>
  )
}