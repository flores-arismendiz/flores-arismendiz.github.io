// Datos iniciales de demostración y configuración por defecto
// Diseñado especialmente para Boda Católica y Gestión Integral de Pareja

export const DEFAULT_CATEGORIES = [
  "Trámites e Iglesia Católica",
  "Locales y Recepción",
  "Detalle y Recuerdos",
  "Fotografía y Video",
  "Vestuario y Estilismo",
  "Música y Animación",
  "Flores y Ambientación"
];

export const DEFAULT_INVITATION_TEMPLATES = [
  {
    id: "tpl-minimalist-web",
    name: "Invitación Minimalista con Link Web (Recomendada)",
    tagline: "Diseño limpio y elegante que dirige a tu Web de Boda interactiva",
    headerTitle: "💌 Nuestra Boda 💍",
    content: `💍 *{novia} & {novio}*
_Nos unimos en Santo Matrimonio_

Querido(a) *{nombre}*,

Hemos preparado con mucho amor una invitación digital para ti. En ella podrás conocer nuestra historia, ver fotos, encontrar la ubicación, escuchar música y confirmar tu asistencia:

🔗 *Abre tu invitación aquí:*
{link_invitacion}

🎟 *Pases reservados:* {pases}
✅ Confirma tu asistencia desde el enlace.

¡Esperamos celebrar este gran día contigo! ❤️`,
    updatedAt: "2026-10-20T20:50:00Z"
  },
  {
    id: "tpl-1",
    name: "Invitación Solemne Católica",
    tagline: "Ceremonia religiosa y bendición sacramental",
    headerTitle: "🕊️ ¡Nos Casamos con la Bendición de Dios! 💍",
    content: `🕊️ *¡Nos Casamos con la Bendición de Dios!* 💍

Querido(a) *{nombre}*,

Tenemos la inmensa alegría de invitarte a celebrar el sacramento de nuestro matrimonio y ser testigo de nuestra unión ante el altar del Señor.

🤵 *Novio:* {novio}
👰 *Novia:* {novia}

📅 *Fecha:* {fecha}
⏰ *Hora:* {hora}
⛪ *Ceremonia Religiosa:* {iglesia}
🎉 *Recepción:* {recepcion}
👔 *Código de Vestimenta:* {vestimenta}
🎟️ *Pases reservados para ti:* {pases}

Tu presencia, cariño y oraciones son muy importantes para nosotros en este día tan sagrado.

👉 *Por favor confirma tu asistencia dando clic aquí:*
{link_confirmacion}

¡Esperamos compartir este día inolvidable contigo! ✨`,
    updatedAt: "2026-10-18T10:00:00Z"
  },
  {
    id: "tpl-2",
    name: "Invitación Fiesta & Brindis Moderno",
    tagline: "Estilo fresco, emotivo y festivo",
    headerTitle: "✨ ¡Llegó nuestro gran momento! 🥂💍",
    content: `✨ *¡Llegó nuestro gran momento!* 🥂💍

¡Hola *{nombre}*!
Queremos que seas parte fundamental de uno de los días más mágicos de nuestras vidas. ¡Nos unimos para siempre!

👰🤵 *{novia} & {novio}*

📅 *Día:* {fecha}
⏰ *Hora:* {hora}
⛪ *Misa de Bodas:* {iglesia}
💃 *Fiesta & Brindis:* {recepcion}
👗 *Dress code:* {vestimenta}
💌 *Pases asignados:* {pases}

Por favor ayúdanos con tu confirmación para tener todo listo:
{link_confirmacion}

¡Nos vemos en la pista de baile para celebrar el amor! 🕺🎉💖`,
    updatedAt: "2026-10-18T10:00:00Z"
  }
];

export const DEFAULT_GUESTS = [
  {
    id: "gst-1",
    name: "Familia Mendoza Quispe",
    phone: "51987654321",
    passes: 3,
    templateId: "tpl-1",
    status: "Confirmado",
    sentAt: "2026-10-15T14:30:00Z",
    confirmedAt: "2026-10-16T18:20:00Z",
    confirmedPasses: 3,
    notes: "Padrinos de aros. Confirmaron con sus 3 integrantes.",
    token: "mendoza-789a",
    lastMessageSent: ""
  },
  {
    id: "gst-2",
    name: "Dr. Roberto Carrillo y Sra.",
    phone: "51992334455",
    passes: 2,
    templateId: "tpl-1",
    status: "Pendiente",
    sentAt: "2026-10-16T10:15:00Z",
    confirmedAt: null,
    confirmedPasses: 0,
    notes: "Tío de la novia. Enviado por WhatsApp.",
    token: "carrillo-451b",
    lastMessageSent: ""
  },
  {
    id: "gst-3",
    name: "Carlos Ramos & Pareja",
    phone: "51944556677",
    passes: 2,
    templateId: "tpl-2",
    status: "Confirmado",
    sentAt: "2026-10-17T11:00:00Z",
    confirmedAt: "2026-10-18T09:40:00Z",
    confirmedPasses: 2,
    notes: "Amigo de la universidad del novio.",
    token: "ramos-129c",
    lastMessageSent: ""
  },
  {
    id: "gst-4",
    name: "Lucía Fernández & Familia",
    phone: "51911223344",
    passes: 4,
    templateId: "tpl-1",
    status: "Sin enviar",
    sentAt: null,
    confirmedAt: null,
    confirmedPasses: 0,
    notes: "Prima hermana. Lista para enviar.",
    token: "fernandez-332d",
    lastMessageSent: ""
  },
  {
    id: "gst-5",
    name: "Ing. Jorge Salgado",
    phone: "51933445566",
    passes: 1,
    templateId: "tpl-2",
    status: "Declinado",
    sentAt: "2026-10-16T16:00:00Z",
    confirmedAt: "2026-10-17T12:00:00Z",
    confirmedPasses: 0,
    notes: "Viaje de trabajo en esa fecha, envió saludos y regalo.",
    token: "salgado-882e",
    lastMessageSent: ""
  }
];

export const DEFAULT_WEDDING_WEB = {
  publicSiteUrl: "https://flores-arismendiz.github.io/",
  heroTitle: "Nuestra Boda Católica",
  heroSubtitle: "«Lo que Dios ha unido, que no lo separe el hombre»",
  scriptureVerse: "«El amor es paciente, es bondadoso. El amor no tiene envidia, no es jactancioso, no se envanece... Todo lo sufre, todo lo cree, todo lo espera, todo lo soporta. El amor nunca deja de ser.» (1 Corintios 13, 4-8)",
  loveStory: "Nos conocimos en un retiro espiritual y desde entonces supimos que Dios tenía un plan maravilloso para nuestras vidas. Hoy, con inmensa gratitud en el corazón, hemos decidido dar el paso más importante: consagrarnos en santo matrimonio y caminar juntos para siempre.",
  coverPhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
  couplePhoto: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80",
  musicUrl: "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-piano-melody-676.mp3",
  musicTitle: "Melodía Nupcial de Amor (Piano)",
  videoUrl: "", // Enlace opcional de YouTube / Vimeo / MP4
  videoEnabled: false,
  churchPhoto: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=900&q=80",
  churchAddress: "Jirón Ancash 471, Centro Histórico de Lima",
  churchMapUrl: "https://maps.google.com/?q=Parroquia+San+Francisco+de+Asis+Lima",
  receptionPhoto: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  receptionAddress: "Av. La Molina 3850, Valle Hermoso",
  receptionMapUrl: "https://maps.google.com/?q=Hacienda+Villa+Esperanza",
  dressCodeTitle: "Elegante / Traje Formal Oscuro",
  dressCodeNote: "Caballeros con terno formal oscuro y corbata. Damas con vestido largo o cóctel elegante. Rogamos con cariño reservar el color blanco exclusivamente para la novia 👰",
  dressCodeColors: ["#1E293B", "#334155", "#C5A059", "#E2E8F0", "#BE185D"],
  timeline: [
    { time: "17:30 hrs", title: "Ceremonia Religiosa", desc: "Misa y bendición del sacramento matrimonial en el altar de Dios", icon: "⛪" },
    { time: "19:00 hrs", title: "Cóctel de Bienvenida", desc: "Llegada al local, brindis inicial, bocaditos finos y música instrumental", icon: "🥂" },
    { time: "20:30 hrs", title: "Cena de Gala & Brindis", desc: "Cena servida de 3 tiempos y palabras de los padrinos y novios", icon: "🍽️" },
    { time: "22:00 hrs", title: "Baile de Novios & Fiesta", desc: "Vals tradicional, apertura de pista de baile y hora loca", icon: "💃" }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=900&q=80"
  ],
  bankAccounts: [
    { bank: "BCP", type: "Ahorros Soles", number: "193-98765432-0-12", cci: "002-193009876543201215", holder: "Él & Ella" },
    { bank: "BBVA", type: "Ahorros Soles", number: "0011-0123-0200456789", cci: "011-12300020045678901", holder: "Él & Ella" }
  ],
  digitalWallets: [
    { app: "Yape", phone: "987 654 321", holder: "Él" },
    { app: "Plin", phone: "992 334 455", holder: "Ella" }
  ],
  giftNote: "El regalo más valioso para nosotros es contar con tu presencia, cariño y oraciones en nuestro matrimonio. Si deseas hacernos un presente, ponemos a tu disposición nuestra lluvia de sobres y cuentas bancarias."
};

export const INITIAL_DATA = {
  settings: {
    currency: "S/",
    savingsGoal: 45000,
    weddingDate: "2027-02-14",
    groomName: "Él",
    brideName: "Ella",
    churchName: "Parroquia San Francisco de Asís (Centro Histórico)",
    receptionVenue: "Hacienda Villa Esperanza (Jardines & Salón Real)",
    weddingTime: "17:30 hrs",
    dressCode: "Elegante / Traje Formal Oscuro",
    weddingWeb: { ...DEFAULT_WEDDING_WEB }
  },
  categories: [...DEFAULT_CATEGORIES],
  invitationTemplates: [...DEFAULT_INVITATION_TEMPLATES],
  guests: [...DEFAULT_GUESTS],
  tasks: [
    {
      id: "task-1",
      title: "Solicitar Partidas de Bautismo legalizadas para matrimonio",
      category: "Trámites e Iglesia Católica",
      assignedTo: "Ambos",
      dueDate: "2026-10-30",
      status: "Completado",
      priority: "Alta",
      notes: "Debe solicitarse en la parroquia de bautizo de cada uno con vigencia no mayor a 6 meses."
    },
    {
      id: "task-2",
      title: "Certificados de Confirmación actualizados",
      category: "Trámites e Iglesia Católica",
      assignedTo: "Él",
      dueDate: "2026-11-15",
      status: "En Proceso",
      priority: "Alta",
      notes: "Pedir constancia en el obispado o parroquia correspondiente."
    },
    {
      id: "task-3",
      title: "Inscripción y asistencia a Charlas Prematrimoniales",
      category: "Trámites e Iglesia Católica",
      assignedTo: "Ambos",
      dueDate: "2026-11-28",
      status: "Pendiente",
      priority: "Alta",
      notes: "Curso de 4 sesiones los fines de semana en la Parroquia San Francisco."
    },
    {
      id: "task-4",
      title: "Apertura de Expediente Matrimonial y Publicación de Edictos",
      category: "Trámites e Iglesia Católica",
      assignedTo: "Ambos",
      dueDate: "2026-12-10",
      status: "Pendiente",
      priority: "Alta",
      notes: "Llevar testigos que no sean familiares directos y DNI vigente."
    },
    {
      id: "task-5",
      title: "Separación y pago de derechos de la Iglesia",
      category: "Trámites e Iglesia Católica",
      assignedTo: "Ella",
      dueDate: "2026-10-25",
      status: "Completado",
      priority: "Alta",
      notes: "Horario reservado para las 5:00 PM con sacerdote asignado."
    },
    {
      id: "task-6",
      title: "Contrato y reserva del Local de Recepción campestre",
      category: "Locales y Recepción",
      assignedTo: "Ambos",
      dueDate: "2026-10-15",
      status: "Completado",
      priority: "Alta",
      notes: "Incluye áreas verdes, estacionamiento privado y toldo arquitectónico."
    },
    {
      id: "task-7",
      title: "Degustación de menú y contratación de Catering",
      category: "Locales y Recepción",
      assignedTo: "Ambos",
      dueDate: "2026-11-20",
      status: "En Proceso",
      priority: "Alta",
      notes: "Cena de 3 tiempos para 150 invitados + barra libre de cócteles."
    },
    {
      id: "task-8",
      title: "Diseño e impresión de Partes e Invitaciones Digitales",
      category: "Detalle y Recuerdos",
      assignedTo: "Ella",
      dueDate: "2026-12-05",
      status: "En Proceso",
      priority: "Media",
      notes: "Papel artesanal con lacre dorado y web interactiva de confirmación RSVP."
    },
    {
      id: "task-9",
      title: "Compra de Souvenirs y Recuerdos religiosos grabados",
      category: "Detalle y Recuerdos",
      assignedTo: "Ella",
      dueDate: "2026-12-20",
      status: "Pendiente",
      priority: "Baja",
      notes: "Denarios de perla de río con estuche personalizado y vela aromática."
    },
    {
      id: "task-10",
      title: "Contratación de Fotógrafo y Videógrafo (Sesión Pre-Boda)",
      category: "Fotografía y Video",
      assignedTo: "Él",
      dueDate: "2026-11-05",
      status: "Completado",
      priority: "Alta",
      notes: "Paquete completo con dron, 2 cámaras y video resumen cinematográfico."
    },
    {
      id: "task-11",
      title: "Prueba de Vestido de Novia y velo catedral",
      category: "Vestuario y Estilismo",
      assignedTo: "Ella",
      dueDate: "2026-12-15",
      status: "En Proceso",
      priority: "Alta",
      notes: "Segunda prueba con zapatos de novia para ajuste de bastilla."
    },
    {
      id: "task-12",
      title: "Elección y confección del Traje del Novio (Smoking/Chaqué)",
      category: "Vestuario y Estilismo",
      assignedTo: "Él",
      dueDate: "2026-12-18",
      status: "Pendiente",
      priority: "Media",
      notes: "Traje azul noche a medida con accesorios en color marfil."
    }
  ],
  savings: [
    {
      id: "sav-1",
      monthYear: "Mayo 2026",
      date: "2026-05-15",
      amountGroom: 1500,
      amountBride: 1500,
      receipt: "Depósito cuenta mancomunada BBVA #0012",
      notes: "Aporte inicial para fondo de boda"
    },
    {
      id: "sav-2",
      monthYear: "Junio 2026",
      date: "2026-06-15",
      amountGroom: 1600,
      amountBride: 1500,
      receipt: "Transferencia Interbank",
      notes: "Aporte mensual regular"
    },
    {
      id: "sav-3",
      monthYear: "Julio 2026",
      date: "2026-07-20",
      amountGroom: 2500,
      amountBride: 2500,
      receipt: "Gratificación de Julio",
      notes: "Abono especial con gratificaciones laborales"
    },
    {
      id: "sav-4",
      monthYear: "Agosto 2026",
      date: "2026-08-16",
      amountGroom: 1600,
      amountBride: 1600,
      receipt: "Depósito BBVA",
      notes: "Aporte regular programado"
    },
    {
      id: "sav-5",
      monthYear: "Septiembre 2026",
      date: "2026-09-17",
      amountGroom: 1800,
      amountBride: 1600,
      receipt: "Transferencia BCP",
      notes: "Aporte mensual + bono freelance de Él"
    },
    {
      id: "sav-6",
      monthYear: "Octubre 2026",
      date: "2026-10-15",
      amountGroom: 1700,
      amountBride: 1700,
      receipt: "Depósito BBVA",
      notes: "Aporte de mes corriente"
    }
  ],
  expenses: [
    {
      id: "exp-1",
      concept: "Alquiler de Local de Recepción Campestre (12 hrs)",
      category: "Locales y Recepción",
      scope: "Conjunto",
      supplier: "Hacienda El Paraíso",
      estimatedBudget: 8500,
      actualCost: 8800,
      advancePaid: 4400,
      paymentStatus: "Adelanto",
      quoteUrl: "https://ejemplo.com/cotizacion-local.pdf",
      notes: "50% de adelanto cancelado. Saldo a pagar 15 días antes del evento."
    },
    {
      id: "exp-2",
      concept: "Derechos de Parroquia y Celebración de Boda",
      category: "Trámites e Iglesia Católica",
      scope: "Conjunto",
      supplier: "Parroquia San Francisco de Asís",
      estimatedBudget: 1200,
      actualCost: 1100,
      advancePaid: 1100,
      paymentStatus: "Pagado Total",
      quoteUrl: "Recibo #4492-2026",
      notes: "Incluye alfombra roja, megafonía y estipendio sacerdotal."
    },
    {
      id: "exp-3",
      concept: "Catering Integral, Banquete y Barra Libre (150 personas)",
      category: "Locales y Recepción",
      scope: "Conjunto",
      supplier: "Gourmet Bodas & Eventos",
      estimatedBudget: 16000,
      actualCost: 15500,
      advancePaid: 5000,
      paymentStatus: "Adelanto",
      quoteUrl: "https://ejemplo.com/menu-boda.pdf",
      notes: "Seña inicial entregada. Degustación aprobada."
    },
    {
      id: "exp-4",
      concept: "Fotografía Profesional, Video Cinematográfico y Dron",
      category: "Fotografía y Video",
      scope: "Conjunto",
      supplier: "Luz & Emoción Wedding Films",
      estimatedBudget: 4200,
      actualCost: 4000,
      advancePaid: 2000,
      paymentStatus: "Adelanto",
      quoteUrl: "Contrato firmado #2026-08",
      notes: "Adelanto del 50%. Incluye entrega en cofre de madera USB y álbum impreso."
    },
    {
      id: "exp-5",
      concept: "Vestido de Novia de Alta Costura + Velo Catedral",
      category: "Vestuario y Estilismo",
      scope: "Ella",
      supplier: "Atelier Novias Elegance",
      estimatedBudget: 4500,
      actualCost: 4800,
      advancePaid: 2500,
      paymentStatus: "Adelanto",
      quoteUrl: "Ficha de diseño personalizada",
      notes: "Bordado a mano con pedrería fina. 2da prueba programada."
    },
    {
      id: "exp-6",
      concept: "Traje de Novio a Medida y Accesorios",
      category: "Vestuario y Estilismo",
      scope: "Él",
      supplier: "Sastrería D'Gala",
      estimatedBudget: 2200,
      actualCost: 2000,
      advancePaid: 1000,
      paymentStatus: "Adelanto",
      quoteUrl: "Boleta 1022",
      notes: "Smoking azul marino con chaleco y corbatón de seda."
    },
    {
      id: "exp-7",
      concept: "Partes Físicos con Lacre e Invitaciones Web RSVP",
      category: "Detalle y Recuerdos",
      scope: "Conjunto",
      supplier: "Studio Papelería Nupcial",
      estimatedBudget: 1500,
      actualCost: 1400,
      advancePaid: 1400,
      paymentStatus: "Pagado Total",
      quoteUrl: "https://ejemplo.com/muestra-invitacion.jpg",
      notes: "120 invitaciones impresas + landing page con confirmación WhatsApp."
    },
    {
      id: "exp-8",
      concept: "Recuerdos para Invitados: Mini Denarios y Velas aromáticas",
      category: "Detalle y Recuerdos",
      scope: "Conjunto",
      supplier: "Recuerdos & Gracia",
      estimatedBudget: 1100,
      actualCost: 1000,
      advancePaid: 0,
      paymentStatus: "Pendiente",
      quoteUrl: "Cotización #884",
      notes: "Pendiente de abonar la seña en noviembre."
    },
    {
      id: "exp-9",
      concept: "DJ, Iluminación Inteligente y Sonido Profesional",
      category: "Música y Animación",
      scope: "Conjunto",
      supplier: "DJ Sound & Lights Pro",
      estimatedBudget: 3200,
      actualCost: 3000,
      advancePaid: 1000,
      paymentStatus: "Adelanto",
      quoteUrl: "Cotización pactada",
      notes: "Incluye cabina DJ personalizada y pista de baile LED."
    },
    {
      id: "exp-10",
      concept: "Arreglos Florales para Iglesia y Centro de Mesas",
      category: "Flores y Ambientación",
      scope: "Conjunto",
      supplier: "Florería Magnolia Real",
      estimatedBudget: 3500,
      actualCost: 3800,
      advancePaid: 1000,
      paymentStatus: "Adelanto",
      quoteUrl: "Moodboard floral",
      notes: "Rosas blancas, hortensias y eucalipto aromático."
    }
  ]
};
