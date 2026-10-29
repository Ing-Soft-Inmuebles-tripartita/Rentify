// Purpose: Puebla una base de desarrollo con fixtures y elimina antes los datos existentes.
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // El seed reconstruye los datos y sus relaciones; no debe ejecutarse sobre una base con información real.
  // Se eliminan primero los registros dependientes para respetar las claves foráneas.
  await prisma.moderacion.deleteMany()
  await prisma.reporte.deleteMany()
  await prisma.verificacion.deleteMany()
  await prisma.documento.deleteMany()
  await prisma.resena.deleteMany()
  await prisma.evaluacion.deleteMany()
  await prisma.experienciaRenta.deleteMany()
  await prisma.visita.deleteMany()
  await prisma.solicitudRenta.deleteMany()
  await prisma.foto.deleteMany()
  await prisma.publicacion.deleteMany()
  await prisma.inmuebleCaracteristica.deleteMany()
  await prisma.caracteristica.deleteMany()
  await prisma.inmueble.deleteMany()
  await prisma.propietario.deleteMany()
  await prisma.inquilino.deleteMany()
  await prisma.administrador.deleteMany()
  await prisma.notificacion.deleteMany()
  await prisma.usuario.deleteMany()

  console.log('✅ Datos previos eliminados')

  const contrasenaHash = await hashPassword('test123')

  const preferenciasDefault = {
    solicitudes: true,
    visitas: true,
    evaluaciones: true,
    marketing: false,
  }

  // ==================== USUARIOS ====================

  const propietarioUsuario = await prisma.usuario.create({
    data: {
      nombre: 'Carlos',
      apellido: 'Mendoza',
      correo: 'carlos@rentify.com',
      fecha_nacimiento: new Date('1985-03-15'),
      contrasena: contrasenaHash,
      estado: 'activo',
      telefono: '+52 33 1234 5678',
      verificado_email: true,
      preferencias_email: preferenciasDefault,
      propietario: {
        create: { estado_verificacion: 'verificado' },
      },
    },
    include: { propietario: true },
  })

  const propietarioUsuario2 = await prisma.usuario.create({
    data: {
      nombre: 'María',
      apellido: 'Ramírez',
      correo: 'maria@rentify.com',
      fecha_nacimiento: new Date('1990-07-22'),
      contrasena: contrasenaHash,
      estado: 'activo',
      telefono: '+52 33 8765 4321',
      verificado_email: true,
      preferencias_email: preferenciasDefault,
      propietario: {
        create: { estado_verificacion: 'verificado' },
      },
    },
    include: { propietario: true },
  })

  const inquilinoUsuario = await prisma.usuario.create({
    data: {
      nombre: 'Ana',
      apellido: 'López',
      correo: 'ana@rentify.com',
      fecha_nacimiento: new Date('1995-11-08'),
      contrasena: contrasenaHash,
      estado: 'activo',
      telefono: '+52 33 5555 1234',
      verificado_email: true,
      preferencias_email: preferenciasDefault,
      inquilino: {
        create: { estado_verificacion: 'pendiente' },
      },
      propietario: {
        create: { estado_verificacion: 'verificado' },
      },
    },
    include: { inquilino: true, propietario: true },
  })

  const usuarioResena1 = await prisma.usuario.create({
    data: {
      nombre: 'Mariana',
      apellido: 'De La Torre',
      correo: 'mariana@test.com',
      fecha_nacimiento: new Date('1992-05-10'),
      contrasena: contrasenaHash,
      estado: 'activo',
      verificado_email: true,
    },
  })

  const usuarioResena2 = await prisma.usuario.create({
    data: {
      nombre: 'Rodrigo',
      apellido: 'Valencia',
      correo: 'rodrigo@test.com',
      fecha_nacimiento: new Date('1988-09-20'),
      contrasena: contrasenaHash,
      estado: 'activo',
      verificado_email: true,
    },
  })

  await prisma.usuario.create({
    data: {
      nombre: 'Admin',
      apellido: 'Rentify',
      correo: 'admin@rentify.com',
      fecha_nacimiento: new Date('1980-01-01'),
      contrasena: contrasenaHash,
      estado: 'activo',
      telefono: '+52 33 0000 0000',
      verificado_email: true,
      preferencias_email: preferenciasDefault,
      administrador: {
        create: { nivel_acceso: 'superadmin' },
      },
      propietario: {
        create: { estado_verificacion: 'verificado' },
      },
    },
    include: { administrador: true, propietario: true },
  })

  console.log('✅ Usuarios creados')

  // ==================== CARACTERÍSTICAS ====================

  const caracteristicas = await Promise.all([
    prisma.caracteristica.create({ data: { nombre: 'Internet de Alta Velocidad' } }),
    prisma.caracteristica.create({ data: { nombre: 'Cocina Integral Equipada' } }),
    prisma.caracteristica.create({ data: { nombre: 'A/C Inverter' } }),
    prisma.caracteristica.create({ data: { nombre: 'Centro de Lavado' } }),
    prisma.caracteristica.create({ data: { nombre: 'Pet-Friendly' } }),
    prisma.caracteristica.create({ data: { nombre: 'Seguridad 24/7' } }),
    prisma.caracteristica.create({ data: { nombre: 'Gimnasio' } }),
    prisma.caracteristica.create({ data: { nombre: 'Espacio Home Office' } }),
    prisma.caracteristica.create({ data: { nombre: 'Alberca' } }),
    prisma.caracteristica.create({ data: { nombre: 'Balcón' } }),
    prisma.caracteristica.create({ data: { nombre: 'Amueblado' } }),
    prisma.caracteristica.create({ data: { nombre: 'Cerradura Biométrica' } }),
  ])

  console.log('✅ Características creadas')

  // ==================== INMUEBLES ====================

  const inmueblesData = [
    {
      propietario_id: propietarioUsuario.propietario!.usuario_id,
      tipo_inmueble: 'Loft Contemporáneo con Terraza',
      direccion: 'Calle Libertad 1420, Colonia Americana, Guadalajara, Jalisco',
      numero_habitaciones: 1,
      numero_banos: 1,
      metros_cuadrados: 82,
      precio_renta: 18500,
      deposito: 18500,
      descripcion: 'Ubicado en el epicentro arquitectónico y cultural de la Colonia Americana, este departamento combina el carácter del concreto aparente pulido con la calidez de acabados artesanales en cantera jalisciense y madera de roble. El departamento goza de una orientación sur-poniente protegida por follaje maduro, generando un flujo de ventilación cruzada natural. Su sala principal con ventanales de piso a techo se abre directamente a una amplia terraza privada con vista despejada hacia la copa de las jacarandas.',
      reglas: 'No fumar en interiores. Máximo 2 mascotas medianas con depósito accesorio de $2,000 MXN. Horario de silencio a partir de las 22:00 hrs en áreas comunes.',
      imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      imagenes_extra: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
      ],
      caracteristicas: ['Internet de Alta Velocidad', 'Cocina Integral Equipada', 'A/C Inverter', 'Centro de Lavado', 'Pet-Friendly', 'Seguridad 24/7', 'Gimnasio', 'Espacio Home Office'],
      latitud: 20.6712,
      longitud: -103.3685,
      piso: 4,
      servicios_incluidos: 'Agua y mantenimiento incluidos',
      resenas: [
        { usuario_id: usuarioResena1.id, calificacion: 5, comentario: 'El departamento es exactamente como en las fotos. La terraza es espectacular y la ubicación inmejorable. Carlos fue un anfitrión excepcional.', duracion_meses: 12 },
        { usuario_id: usuarioResena2.id, calificacion: 5, comentario: 'Viví aquí 6 meses y fue la mejor decisión. El loft tiene una vibra increíble, mucha luz natural y el barrio es perfecto para caminar.', duracion_meses: 6 },
      ],
    },
    {
      propietario_id: propietarioUsuario2.propietario!.usuario_id,
      tipo_inmueble: 'Departamento Familiar frente a Parque',
      direccion: 'Av. San Dionisio 245, Chapalita, Guadalajara, Jalisco',
      numero_habitaciones: 3,
      numero_banos: 2,
      metros_cuadrados: 140,
      precio_renta: 26000,
      deposito: 26000,
      descripcion: 'Departamento familiar en una de las zonas más tranquilas de Chapalita, con vista directa al parque. Amplio balcón, cocina integral, tres recámaras con clósets empotrados y dos baños completos. Edificio con seguridad 24/7, estacionamiento techado para 2 autos y áreas comunes con jardín.',
      reglas: 'No fumar. Mascotas pequeñas permitidas. Contrato mínimo 12 meses.',
      imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      imagenes_extra: [
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      ],
      caracteristicas: ['Cocina Integral Equipada', 'Pet-Friendly', 'Seguridad 24/7', 'Balcón', 'Centro de Lavado'],
      latitud: 20.6394,
      longitud: -103.4002,
      piso: 2,
      servicios_incluidos: 'Mantenimiento incluido',
      resenas: [
        { usuario_id: usuarioResena1.id, calificacion: 5, comentario: 'Perfecto para familias. El parque enfrente es ideal para los niños y la zona es muy segura.', duracion_meses: 18 },
      ],
    },
    {
      propietario_id: propietarioUsuario.propietario!.usuario_id,
      tipo_inmueble: 'Penthouse con Vista Panorámica',
      direccion: 'Av. Rubén Darío 1520, Providencia, Guadalajara, Jalisco',
      numero_habitaciones: 2,
      numero_banos: 2,
      metros_cuadrados: 110,
      precio_renta: 34500,
      deposito: 34500,
      descripcion: 'Espectacular penthouse en el corazón de Providencia con vistas panorámicas a la ciudad. Terraza privada, alberca, gimnasio y seguridad 24/7. Acabados de lujo en mármol y maderas finas. Ideal para ejecutivos o parejas que buscan lo mejor de Guadalajara.',
      reglas: 'No fumar. No mascotas. Contrato mínimo 12 meses.',
      imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      imagenes_extra: [
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
      ],
      caracteristicas: ['Alberca', 'Gimnasio', 'Seguridad 24/7', 'A/C Inverter', 'Cocina Integral Equipada', 'Cerradura Biométrica'],
      latitud: 20.6985,
      longitud: -103.3851,
      piso: 12,
      servicios_incluidos: 'Mantenimiento y agua incluidos',
      resenas: [
        { usuario_id: usuarioResena2.id, calificacion: 5, comentario: 'Las vistas son impresionantes. El edificio tiene amenidades de primera y la atención de Carlos fue impecable.', duracion_meses: 12 },
        { usuario_id: usuarioResena1.id, calificacion: 4, comentario: 'Excelente ubicación y acabados. Solo le faltaría más espacio de estacionamiento, pero por lo demás perfecto.', duracion_meses: 8 },
      ],
    },
    {
      propietario_id: propietarioUsuario2.propietario!.usuario_id,
      tipo_inmueble: 'Casa Colonial en Tlaquepaque',
      direccion: 'Calle Independencia 88, Tlaquepaque, Jalisco',
      numero_habitaciones: 3,
      numero_banos: 3,
      metros_cuadrados: 210,
      precio_renta: 31000,
      deposito: 31000,
      descripcion: 'Hermosa casa estilo colonial completamente renovada en el pintoresco barrio de Tlaquepaque. Amplio jardín interior con árboles frutales, fuente de cantera y cocina equipada. A 5 minutos caminando del centro histórico, galerías y restaurantes típicos. Perfecta para familias o para quienes buscan un espacio con carácter.',
      reglas: 'No fumar. Mascotas bienvenidas. Jardinería incluida.',
      imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      imagenes_extra: [
        'https://images.unsplash.com/photo-1600596542815-e32870110004?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
      ],
      caracteristicas: ['Pet-Friendly', 'Cocina Integral Equipada', 'Seguridad 24/7', 'Centro de Lavado', 'Espacio Home Office'],
      latitud: 20.6394,
      longitud: -103.3124,
      piso: 1,
      servicios_incluidos: 'Jardinería incluida',
      resenas: [
        { usuario_id: usuarioResena2.id, calificacion: 5, comentario: 'La casa es aún más bonita que en las fotos. El jardín es un oasis y la ubicación es perfecta para disfrutar Tlaquepaque.', duracion_meses: 24 },
      ],
    },
  ]

  for (const data of inmueblesData) {
    const inmueble = await prisma.inmueble.create({
      data: {
        propietario_id: data.propietario_id,
        tipo_inmueble: data.tipo_inmueble,
        direccion: data.direccion,
        numero_habitaciones: data.numero_habitaciones,
        numero_banos: data.numero_banos,
        metros_cuadrados: data.metros_cuadrados,
        latitud: data.latitud,
        longitud: data.longitud,
        estado_inventario: 'disponible',
        documento_verificado: true,
        piso: data.piso,
        servicios_incluidos: data.servicios_incluidos,
      },
    })

    for (const nombreCar of data.caracteristicas) {
      const car = caracteristicas.find((c) => c.nombre === nombreCar)
      if (car) {
        await prisma.inmuebleCaracteristica.create({
          data: { inmueble_id: inmueble.id, caracteristica_id: car.id },
        })
      }
    }

    const publicacion = await prisma.publicacion.create({
      data: {
        inmueble_id: inmueble.id,
        precio_renta: data.precio_renta,
        deposito: data.deposito,
        descripcion: data.descripcion,
        reglas: data.reglas,
        estado: 'activa',
        calificacion_promedio: data.resenas.reduce((a, r) => a + r.calificacion, 0) / data.resenas.length,
        total_resenas: data.resenas.length,
      },
    })

    await prisma.foto.create({
      data: {
        publicacion_id: publicacion.id,
        ruta_archivo: data.imagen,
        orden: 1,
      },
    })

    for (let i = 0; i < data.imagenes_extra.length; i++) {
      await prisma.foto.create({
        data: {
          publicacion_id: publicacion.id,
          ruta_archivo: data.imagenes_extra[i],
          orden: i + 2,
        },
      })
    }

    for (const resena of data.resenas) {
      await prisma.resena.create({
        data: {
          publicacion_id: publicacion.id,
          usuario_id: resena.usuario_id,
          calificacion: resena.calificacion,
          comentario: resena.comentario,
          duracion_meses: resena.duracion_meses,
        },
      })
    }
  }

  console.log('✅ Inmuebles con fotos y reseñas creados')

  // Inmueble extra para Ana
  await prisma.inmueble.create({
    data: {
      propietario_id: inquilinoUsuario.propietario!.usuario_id,
      tipo_inmueble: 'Departamento Moderno en Zapopan',
      direccion: 'Av. Patria 1200, Zapopan, Jalisco',
      numero_habitaciones: 2,
      numero_banos: 1,
      metros_cuadrados: 80,
      latitud: 20.7214,
      longitud: -103.3918,
      estado_inventario: 'disponible',
      documento_verificado: true,
      piso: 3,
      servicios_incluidos: 'Mantenimiento incluido',
      publicaciones: {
        create: {
          precio_renta: 11000,
          deposito: 11000,
          descripcion: 'Bonito departamento en Zapopan, ideal para parejas. Cerca de plazas comerciales y transporte público. Cocina equipada, balcón con vista al jardín y estacionamiento techado.',
          reglas: 'No fumar. Mascotas pequeñas bienvenidas.',
          estado: 'activa',
          calificacion_promedio: 5,
          total_resenas: 0,
          fotos: {
            create: {
              ruta_archivo: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              orden: 1,
            },
          },
        },
      },
    },
  })

  // ==================== SOLICITUDES Y VISITAS ====================

  const publicacionCasa = await prisma.publicacion.findFirst({
    where: { inmueble: { tipo_inmueble: { contains: 'Chapalita' } } },
  })

  if (publicacionCasa && inquilinoUsuario.inquilino) {
    const solicitud = await prisma.solicitudRenta.create({
      data: {
        inquilino_id: inquilinoUsuario.inquilino.usuario_id,
        publicacion_id: publicacionCasa.id,
        estado: 'pendiente',
        mensaje: 'Hola, me interesa mucho esta propiedad. ¿Podríamos agendar una visita?',
      },
    })

    await prisma.visita.create({
      data: {
        solicitud_id: solicitud.id,
        fecha_hora: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tipo: 'visita',
        modalidad: 'presencial',
        estado: 'agendada',
        notas: 'Me gustaría revisar la iluminación para home office.',
      },
    })

    console.log('✅ Solicitud y visita de prueba creadas')
  }

  // ==================== REPORTES DE PRUEBA ====================

  const publicacionReportada = await prisma.publicacion.findFirst({
    where: { inmueble: { tipo_inmueble: { contains: 'Chapalita' } } },
  })

  if (publicacionReportada && usuarioResena1) {
    await prisma.reporte.create({
      data: {
        usuario_id: usuarioResena1.id,
        publicacion_id: publicacionReportada.id,
        motivo: 'Información falsa',
        descripcion: 'Las fotos no coinciden con la propiedad real. El precio publicado es diferente al que me comentaron al llamar.',
        estado: 'pendiente',
      },
    })
    console.log('✅ Reporte de prueba creado')
  }

  // ==================== DOCUMENTOS PENDIENTES ====================

  await prisma.documento.create({
    data: {
      usuario_id: inquilinoUsuario.id,
      tipo_documento: 'INE',
      ruta_archivo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      estado: 'pendiente',
    },
  })

  await prisma.documento.create({
    data: {
      usuario_id: propietarioUsuario.id,
      tipo_documento: 'Escritura',
      ruta_archivo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      estado: 'pendiente',
    },
  })

  console.log('✅ Documentos pendientes de verificación creados')

  // ==================== NOTIFICACIONES DE PRUEBA ====================

  await prisma.notificacion.create({
    data: {
      usuario_id: propietarioUsuario.id,
      tipo: 'solicitud_renta',
      mensaje: 'Ana López solicitó rentar "Departamento Familiar frente a Parque"',
      estado: 'no_leida',
    },
  })

  await prisma.notificacion.create({
    data: {
      usuario_id: propietarioUsuario.id,
      tipo: 'visita_agendada',
      mensaje: 'Ana López agendó una visita presencial para el Departamento Familiar',
      estado: 'no_leida',
    },
  })

  console.log('✅ Notificaciones de prueba creadas')

  console.log('')
    // ==================== EXPERIENCIA DE RENTA PARA EVALUACIONES ====================
  
  // Crear una renta ya concretada entre Ana y Carlos para poder evaluar
  const publicacionLoft = await prisma.publicacion.findFirst({
    where: { inmueble: { tipo_inmueble: { contains: 'Loft' } } },
  })

  if (publicacionLoft && inquilinoUsuario.inquilino) {
    // Primero necesitamos una solicitud aprobada
    const solicitudAprobada = await prisma.solicitudRenta.create({
      data: {
        inquilino_id: inquilinoUsuario.inquilino.usuario_id,
        publicacion_id: publicacionLoft.id,
        estado: 'aprobada',
        mensaje: 'Solicitud aprobada de prueba para evaluaciones',
      },
    })

    // Crear la experiencia de renta (renta ya concretada)
    await prisma.experienciaRenta.create({
      data: {
        solicitud_id: solicitudAprobada.id,
        fecha_inicio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // hace 3 meses
        fecha_fin: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // en 9 meses
        estado: 'activa',
      },
    })

    console.log('✅ Experiencia de renta creada para evaluaciones')
  }
  console.log('🎉 Seed completado exitosamente!')
  console.log('')
  console.log('📊 Resumen:')
  console.log('   - 6 usuarios (2 propietarios, 1 inquilino+propietario, 1 admin+propietario, 2 para reseñas)')
  console.log('   - 5 inmuebles con fotos múltiples y reseñas')
  console.log('   - 1 solicitud + 1 visita agendada')
  console.log('   - 1 reporte pendiente')
  console.log('   - 2 documentos pendientes de verificación')
  console.log('   - 2 notificaciones no leídas')
  console.log('   - 12 características')
  console.log('')
  console.log('🔑 Credenciales (contraseña: test123):')
  console.log('   carlos@rentify.com  (propietario)')
  console.log('   maria@rentify.com   (propietaria)')
  console.log('   ana@rentify.com     (inquilina + propietaria)')
  console.log('   admin@rentify.com   (admin + propietario)')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })