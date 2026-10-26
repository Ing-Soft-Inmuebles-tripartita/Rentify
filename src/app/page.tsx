import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import PropertyCard, { PropertyProps } from '@/components/PropertyCard'
import { prisma } from '@/lib/prisma'
import { MapPin, Calendar, Fingerprint, Key, Star } from 'lucide-react'

async function PropiedadesDestacadas() {
  const publicaciones = await prisma.publicacion.findMany({
    take: 6,
    where: { estado: 'activa' },
    include: {
      inmueble: true,
      fotos: { orderBy: { orden: 'asc' }, take: 1 },
    },
  })

  const propiedades: PropertyProps[] = publicaciones.map((pub) => ({
    id: pub.id,
    titulo: pub.inmueble.tipo_inmueble,
    ubicacion: pub.inmueble.direccion,
    precio: pub.precio_renta,
    habitaciones: pub.inmueble.numero_habitaciones,
    banos: pub.inmueble.numero_banos,
    estacionamiento: 1,
    metros: pub.inmueble.metros_cuadrados,
    tipo: pub.inmueble.tipo_inmueble,
    imagen:
      pub.fotos[0]?.ruta_archivo ||
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }))

  if (propiedades.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500">No hay propiedades publicadas todavía.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {propiedades.map((prop) => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-surface font-sans">
      <Navbar />
      <Hero />

      {/* Filtros rápidos */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-12 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1 text-secondary text-xs font-semibold tracking-wider uppercase mb-1">
              <MapPin size={14} />
              Jalisco • Zona Metropolitana de Guadalajara
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Propiedades destacadas en Guadalajara
            </h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Link href="/propiedades" className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold whitespace-nowrap shadow-sm">
              Todas
            </Link>
            <Link href="/propiedades?ubicacion=Americana" className="px-4 py-1.5 rounded-full bg-white hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors shadow-sm">
              Colonia Americana
            </Link>
            <Link href="/propiedades?ubicacion=Chapalita" className="px-4 py-1.5 rounded-full bg-white hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors shadow-sm">
              Chapalita
            </Link>
            <Link href="/propiedades?ubicacion=Providencia" className="px-4 py-1.5 rounded-full bg-white hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors shadow-sm">
              Providencia
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de propiedades */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-12">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          }
        >
          <PropiedadesDestacadas />
        </Suspense>

        <div className="mt-12 flex justify-center">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-surface-container text-primary text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            Explorar todas las viviendas disponibles
          </Link>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="w-full bg-surface-canvas py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
              El nuevo estándar inmobiliario
            </span>
            <h2 className="text-3xl font-bold text-primary tracking-tight mt-2 mb-3">
              ¿Cómo funciona Rentify?
            </h2>
            <p className="text-sm text-on-surface-variant">
              Eliminamos la burocracia del arrendamiento tradicional mexicano. Sin aval
              con bien inmueble, sin filas en notarías y con total certeza jurídica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                num: '01',
                title: 'Explora y agenda',
                desc: 'Descubre fotografías reales sin filtros distorsionados. Agenda recorridos virtuales 3D o visitas presenciales acompañadas.',
              },
              {
                icon: Fingerprint,
                num: '02',
                title: 'Aprobación 100% digital',
                desc: 'Califica en minutos conectando tus comprobantes de ingresos. Olvídate del requerimiento obsoleto de un aval con propiedad.',
              },
              {
                icon: Key,
                num: '03',
                title: 'Múdate seguro',
                desc: 'Firma tu contrato de arrendamiento digital certificado con validez legal. Póliza jurídica incluida y soporte continuo.',
              },
            ].map((paso, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary" />
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-secondary">
                    <paso.icon size={28} />
                  </div>
                  <span className="text-5xl font-bold text-surface-container">{paso.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{paso.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
              Experiencias reales
            </span>
            <h2 className="text-3xl font-bold text-primary tracking-tight mt-1">
              Lo que dicen nuestros inquilinos
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <div className="flex text-rating-gold">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="fill-rating-gold" />
              ))}
            </div>
            <span className="text-sm font-bold text-on-surface">4.92 / 5</span>
            <span className="text-xs text-on-surface-variant">(1,480+ reseñas)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              text: 'Llegué por trabajo desde Monterrey y todas las inmobiliarias me exigían un aval. Con Rentify me validaron con mi nómina en menos de una tarde.',
              nombre: 'Valeria Montes',
              rol: 'Inquilina en Chapalita, GDL',
            },
            {
              text: 'El departamento en Colonia Americana estaba exactamente idéntico a las fotos. La entrega con inventario digital me dio muchísima tranquilidad.',
              nombre: 'Rodrigo Alatorre',
              rol: 'Inquilino en Col. Americana, GDL',
            },
            {
              text: 'Hicimos todo el proceso desde el teléfono mientras coordinábamos la mudanza. El filtro pet friendly nos ahorró semanas enteras de búsqueda.',
              nombre: 'Camila Sotomayor',
              rol: 'Inquilina en Providencia, GDL',
            },
          ].map((t, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 text-rating-gold mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} className="fill-rating-gold" />
                  ))}
                </div>
                <p className="text-sm text-on-surface italic mb-4">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-surface-container">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                  {t.nombre.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{t.nombre}</p>
                  <p className="text-xs text-on-surface-variant">{t.rol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white shadow-sm mt-12">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-3">Rentify</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Plataforma residencial líder en México. Rediseñamos el arrendamiento con
                certeza jurídica, inspecciones rigurosas y arquitectura contemporánea.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">Explorar México</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><Link href="/propiedades" className="hover:text-on-surface">Guadalajara & Zapopan</Link></li>
                <li><Link href="/propiedades" className="hover:text-on-surface">CDMX Residencial</Link></li>
                <li><Link href="/propiedades" className="hover:text-on-surface">Monterrey & San Pedro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">Soporte y Legal</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><Link href="/seguridad" className="hover:text-on-surface">Centro de ayuda</Link></li>
                <li><Link href="/guia" className="hover:text-on-surface">Guía del inquilino</Link></li>
                <li><Link href="/seguridad" className="hover:text-on-surface">Términos del servicio</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-on-surface-variant">
              © 2026 Rentify Tecnologías Inmobiliarias S.A.P.I. de C.V. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}