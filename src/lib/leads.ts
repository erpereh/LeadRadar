import type { Lead } from './types'

export const LEADS: Lead[] = [
  {
    id: 1,
    nombre: 'Belleza Integral Studio',
    categoria: 'Estética',
    zona: 'Ensanche de Vallecas',
    direccion: 'C. Adolfo Marsillach, 56',
    telefono: '+34 685 26 14 82',
    nota: 4.6,
    nReseñas: 371,
    presenciaDigital: 'Instagram + Booksy + Fresha. Sin web propia.',
    branding: {
      tono: 'Sofisticado, femenino y tecnológico',
      audiencia: 'Mujeres del barrio que buscan tratamientos faciales de calidad',
      painPoint:
        '371 reseñas pero sin web — pierden clientas que buscan en Google y no la encuentran',
      propuesta: 'Web con catálogo de tratamientos + reservas online + SEO local',
    },
    reseñas: [
      'Llevé el bono y aseguré todas mis citas. Siempre llena.',
      'La tecnología es increíble. Noto resultados desde la primera sesión.',
      'La atención desde que entras es espectacular. Ambiente, música, servicio.',
    ],
  },
  {
    id: 2,
    nombre: 'Freestyle Estilistas',
    categoria: 'Peluquería',
    zona: 'Ensanche de Vallecas',
    direccion: 'Av. de las Suertes, 30',
    telefono: '+34 913 32 16 59',
    nota: 4.4,
    nReseñas: 320,
    presenciaDigital: 'Facebook + Treatwell + Fresha. Sin web propia.',
    branding: {
      tono: "Cercano, familiar, de barrio. 'Tu cabello, nuestra pasión'",
      audiencia: 'Mujeres del barrio, clientela fidelizada. También hombres y niños.',
      painPoint:
        "320 reseñas pero al buscar 'peluquería Ensanche Vallecas' en Google no aparece en orgánico",
      propuesta: 'Web con galería, carta de servicios y reservas online',
    },
    reseñas: [
      'Almudena siempre acierta. Si no quedas contento, te invitan a volver.',
      'Me pusieron café, trato excelente, precios geniales.',
      'Llevan muchos años en el barrio y siempre igual de bien.',
    ],
  },
  {
    id: 3,
    nombre: 'Barbería SWAR',
    categoria: 'Barbería',
    zona: 'Ensanche de Vallecas',
    direccion: 'Av. Gran Vía del Sureste, 32',
    telefono: '+34 744 60 66 79',
    nota: 4.7,
    nReseñas: 242,
    presenciaDigital: 'Solo Booksy. Sin web ni redes propias.',
    branding: {
      tono: 'Profesional, multicultural, de confianza. Ángel es el referente.',
      audiencia: 'Hombres del barrio de todas las edades, clientela fiel 4+ años.',
      painPoint:
        "Si alguien busca 'barbería Vallecas' en Google, SWAR no aparece — solo existe en Booksy",
      propuesta:
        'Web con galería de cortes + reservas integradas = imagen premium y visibilidad SEO',
    },
    reseñas: [
      'Mi barbería de confianza desde hace 4 años. Ángel siempre sabe lo que quiero.',
      'Cuando te corta el pelo uno y te gusta, ya no quieres cambiar.',
      'Servicio excelente, local espacioso y muy buen ambiente.',
    ],
  },
  {
    id: 4,
    nombre: 'Erika Peluqueros',
    categoria: 'Peluquería',
    zona: 'Ensanche de Vallecas',
    direccion: 'C. María Teresa de León, 21',
    telefono: '+34 693 75 37 17',
    nota: 4.2,
    nReseñas: 191,
    presenciaDigital: 'Solo Treatwell. Sin ninguna presencia digital propia.',
    branding: {
      tono: 'Colorista, dinámico. Equipo joven con varios estilistas.',
      audiencia: 'Hombres y mujeres del barrio, también permanentes y color.',
      painPoint:
        'Cero presencia digital propia — solo aparecen si alguien tiene el link de Treatwell',
      propuesta: 'Landing page básica ya los dispararía en resultados locales de Google',
    },
    reseñas: [
      'Jovanni está de vuelta. Llevo yendo desde que abrieron.',
      'El corte fue perfecto. Emir es un profesional de verdad.',
      'Clara y Jovanni forman un equipo perfecto.',
    ],
  },
  {
    id: 5,
    nombre: 'Carnicería Madurarte',
    categoria: 'Comercio',
    zona: 'Ensanche de Vallecas',
    direccion: 'Av. del Ensanche de Vallecas, 79',
    telefono: '+34 744 64 77 42',
    nota: 4.5,
    nReseñas: 66,
    presenciaDigital: 'Instagram @madurarte + Facebook. Sin web.',
    branding: {
      tono: 'Artesanal, premium, apasionado. Carnes maduradas y preparados.',
      audiencia: 'Familias del Ensanche que valoran calidad y servicio personalizado.',
      painPoint:
        'Toman pedidos por teléfono pero sin web — pierden clientes que quieren ver el catálogo antes de llamar',
      propuesta: 'Web-catálogo con WhatsApp integrado y sección de carnes especiales',
    },
    reseñas: [
      'Calidad inmejorable. Hacen pedidos por teléfono y lo tienen listo.',
      'Si quieres la mejor barbacoa, habla con ellos.',
      'Productos completamente diferentes al supermercado.',
    ],
  },
  {
    id: 6,
    nombre: 'El Rincón de la Tortilla',
    categoria: 'Restaurante',
    zona: 'Ensanche de Vallecas',
    direccion: 'C. Arte Conceptual, 23',
    telefono: '+34 911 09 97 99',
    nota: 4.7,
    nReseñas: 1263,
    presenciaDigital: 'Instagram + Facebook + Glovo. Sin web propia.',
    branding: {
      tono: 'Desenfadado, español, de barrio pero con personalidad propia.',
      audiencia: 'Vecinos del Ensanche, familias, opciones sin gluten.',
      painPoint:
        '1263 reseñas y sin web — pierden reservas de grupos y pagan comisión a Glovo innecesariamente',
      propuesta:
        'Web con carta online + reservas directas = ahorro en comisiones y más visibilidad',
    },
    reseñas: [
      'Tortilla española cremosa, de las mejores de Madrid.',
      'Toda una sorpresa este restaurante. Volveremos seguro.',
      'Personal muy amable, opciones sin gluten, precio justo.',
    ],
  },
  {
    id: 7,
    nombre: 'Inmobiliaria Manhattan',
    categoria: 'Inmobiliaria',
    zona: 'Ensanche de Vallecas',
    direccion: 'C. José Tamayo, 3',
    telefono: '+34 912 98 90 70',
    nota: 4.7,
    nReseñas: 186,
    presenciaDigital: 'Facebook + Idealista. Gmail como contacto oficial.',
    branding: {
      tono: 'Profesional, cercano. Nati, Lourdes y Gabi como referentes de confianza.',
      audiencia: 'Compradores y vendedores en el Ensanche y alrededores.',
      painPoint:
        'Todo su negocio pasa por Idealista y boca a boca — no pueden captar leads propios',
      propuesta: 'Web con portfolio de operaciones cerradas + formulario de captación',
    },
    reseñas: [
      'Vendieron nuestro piso en menos de una semana.',
      'Nati nos guió en cada paso. La mejor decisión que tomamos.',
      'Profesionalidad, cercanía y resultados.',
    ],
  },
  {
    id: 8,
    nombre: 'Talleres Víctor',
    categoria: 'Taller',
    zona: 'Villa de Vallecas',
    direccion: 'C. Peñas Largas, 21',
    telefono: '+34 913 32 68 06',
    nota: 4.9,
    nReseñas: 143,
    presenciaDigital: 'Solo Páginas Amarillas. Sin redes ni web.',
    branding: {
      tono: 'Clásico, honesto, familiar. Víctor y Antonio como referentes.',
      audiencia: 'Propietarios de coche en Villa de Vallecas buscando taller de confianza.',
      painPoint:
        '4.9 estrellas y sin ninguna presencia digital — invisible para quien busca online antes de llamar',
      propuesta: 'Web básica con servicios + cita online = ventaja enorme frente a competencia',
    },
    reseñas: [
      '4 años llevando mi coche aquí. Siempre enseñan las piezas cambiadas.',
      'Los mejores de Vallecas. Víctor y Antonio son unos cracks.',
      'Rápidos y de confianza. Mi coche sale al precio acordado.',
    ],
  },
  {
    id: 9,
    nombre: 'Talleres Marsa e Hijos',
    categoria: 'Taller',
    zona: 'Villa de Vallecas',
    direccion: 'C. Ntra. Sra. de la Torre, 11',
    telefono: '+34 917 78 73 99',
    nota: 4.9,
    nReseñas: 129,
    presenciaDigital: 'Solo directorios. Sin redes sociales ni web.',
    branding: {
      tono: 'Familiar, transparente, detallista. Carlos y Elena son los referentes.',
      audiencia: 'Clientes de Vallecas y alrededores. Incluso turistas de paso.',
      painPoint: 'Negocio familiar con 4.9 de nota pero completamente invisible en internet',
      propuesta:
        'Web con galería de trabajos de chapa y pintura — los distinguiría completamente',
    },
    reseñas: [
      'Carlos mostró fotos del problema y hizo prueba de carretera.',
      'Reparación que otros talleres no pudieron. En tiempo record.',
      'Los mejores. Profesionales, rápidos y honestos con el precio.',
    ],
  },
  {
    id: 10,
    nombre: "Shelby's Barbershop",
    categoria: 'Barbería',
    zona: 'El Cañaveral',
    direccion: 'C. Ferenc Puskas, 245',
    telefono: '+34 627 29 29 20',
    nota: 4.7,
    nReseñas: 63,
    presenciaDigital: 'Instagram + Booksy + Linktree. Sin web propia.',
    branding: {
      tono: 'Premium, elegante. La excelencia no es una opción: es la norma. Abiertos en 2024.',
      audiencia: 'Hombres y familias del Cañaveral, barrio en pleno crecimiento.',
      painPoint:
        'Barbería nueva en barrio que crece — sin web pierden visibilidad justo cuando más importa posicionarse',
      propuesta: 'Web ahora = SEO local desde el principio en un barrio que se está poblando',
    },
    reseñas: [
      'Álvaro me conoce ya con pocas visitas. Sabe lo que quiero.',
      'Con los niños tienen paciencia infinita.',
      'La presencia es tan importante como el corte. Shelby\'s lo entiende.',
    ],
  },
  {
    id: 11,
    nombre: 'La CarniVora de Vicálvaro',
    categoria: 'Comercio',
    zona: 'Vicálvaro',
    direccion: 'C. Velilla, 9 (Mercado de Vicálvaro)',
    telefono: '+34 614 18 24 81',
    nota: 5.0,
    nReseñas: 26,
    presenciaDigital: 'TikTok @carniceria.lacarnivora. Solo redes. Sin web.',
    branding: {
      tono: 'Energético, pasional, innovador. Cachopos originales como sello diferencial.',
      audiencia:
        'Vecinos de Vicálvaro amantes de la carne de calidad. Hacen delivery.',
      painPoint:
        'Perfecta en TikTok pero sin web para pedidos directos ni delivery propio sin comisión',
      propuesta:
        'Web-catálogo con WhatsApp y delivery directo — ya tienen el contenido visual en TikTok',
    },
    reseñas: [
      'Los cachopos son espectaculares, variedad enorme de rellenos.',
      'Carne de calidad increíble. Se nota la pasión del propietario.',
      'Delivery a domicilio en perfectas condiciones.',
    ],
  },
]

export const TOTAL_RESEÑAS = LEADS.reduce((acc, l) => acc + l.nReseñas, 0)

export const NOTA_MEDIA =
  Math.round((LEADS.reduce((acc, l) => acc + l.nota, 0) / LEADS.length) * 10) / 10
