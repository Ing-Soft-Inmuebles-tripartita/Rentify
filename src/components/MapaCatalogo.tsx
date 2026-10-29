// Purpose: Componente reutilizable de interfaz. Muestra inmuebles del catalogo en un mapa con enlaces a sus fichas.
'use client'

import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string })
  ._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export interface PropiedadMapa {
  id: number
  titulo: string
  precio: number
  latitud: number | null
  longitud: number | null
}

export default function MapaCatalogo({ propiedades }: { propiedades: PropiedadMapa[] }) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMontado(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const ubicadas = propiedades.filter(
    (propiedad): propiedad is PropiedadMapa & { latitud: number; longitud: number } =>
      propiedad.latitud !== null && propiedad.longitud !== null
  )
  const centro: [number, number] = ubicadas.length
    ? [ubicadas[0].latitud, ubicadas[0].longitud]
    : [20.6597, -103.3496]

  if (!montado) {
    return <div className="h-[65vh] min-h-96 animate-pulse rounded-2xl bg-gray-100" />
  }

  return (
    <div className="h-[65vh] min-h-96 overflow-hidden rounded-2xl bg-gray-100">
      {ubicadas.length ? (
        <MapContainer center={centro} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {ubicadas.map((propiedad) => (
            <Marker key={propiedad.id} position={[propiedad.latitud, propiedad.longitud]}>
              <Popup>
                <Link href={`/propiedad/${propiedad.id}`} className="font-semibold">
                  {propiedad.titulo}
                </Link>
                <p>${propiedad.precio.toLocaleString('es-MX')} MXN / mes</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-600">
          No hay coordenadas disponibles para las propiedades encontradas.
        </div>
      )}
    </div>
  )
}
