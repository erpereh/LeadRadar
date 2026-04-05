import { useState } from "react";

const LEADS = [
  {
    id: 1,
    nombre: "Belleza Integral Studio",
    cat: "Estética",
    zona: "Ensanche de Vallecas",
    dir: "C. Adolfo Marsillach, 56",
    tel: "+34 685 26 14 82",
    nota: 4.6,
    nreseñas: 371,
    social: "Instagram @bellezaintegralstudio · Booksy · Fresha",
    branding: {
      tono: "Sofisticado, femenino y tecnológico",
      estilo: "Local moderno con énfasis en tecnología estética avanzada (INDIBA, dermapen, Hollywood Peel). Colores rosa/nude y blanco.",
      audiencia: "Mujeres del barrio que buscan tratamientos faciales y depilación de calidad",
      painpoint: "Sus clientas la buscan en Google pero no aparece — solo la encuentran si alguien la menciona directamente",
      diferencial: "371 reseñas son una base potente para una web que convierta visitas en citas"
    },
    reseñas: [
      "Llevé el bono y aseguré todas mis citas. Siempre llena.",
      "La tecnología es increíble. Noto resultados desde la primera sesión.",
      "La atención desde el momento en que entras es espectacular."
    ]
  },
  {
    id: 2,
    nombre: "Freestyle Estilistas",
    cat: "Peluquería",
    zona: "Ensanche de Vallecas",
    dir: "Av. de las Suertes, 30",
    tel: "+34 913 32 16 59",
    nota: 4.4,
    nreseñas: 320,
    social: "Facebook @freestyleestilistas · Treatwell · Fresha",
    branding: {
      tono: "Cercano, familiar, de barrio. 'Tu cabello, nuestra pasión'",
      estilo: "Peluquería de señoras orgánica, con tratamientos especiales para novias. Ambiente tranquilo.",
      audiencia: "Mujeres del barrio, clientela fidelizada. También hombres y niños.",
      painpoint: "320 reseñas en Google pero cuando alguien busca 'peluquería Ensanche Vallecas' no aparece en resultados orgánicos",
      diferencial: "Llevan años en el barrio — una web con reservas online sería su salto digital definitivo"
    },
    reseñas: [
      "Almudena siempre acierta. Si no quedas contento, te invitan a volver.",
      "Me pusieron café, trato excelente, precios geniales. Ya tengo mi peluquería en el Ensanche.",
      "Se nota que les apasiona lo que hacen. Llevan muchos años y siempre igual de bien."
    ]
  },
  {
    id: 3,
    nombre: "Barbería SWAR",
    cat: "Barbería",
    zona: "Ensanche de Vallecas",
    dir: "Av. Gran Vía del Sureste, 32",
    tel: "+34 744 60 66 79",
    nota: 4.7,
    nreseñas: 242,
    social: "Booksy (reservas) · Sin web propia",
    branding: {
      tono: "Profesional, multicultural, de confianza. Ángel es el referente.",
      estilo: "Barbería con identidad fuerte. Clientela que repite 4+ años. Propietarios turco-españoles.",
      audiencia: "Hombres del barrio de todas las edades, también niños.",
      painpoint: "Solo Booksy — si alguien busca 'barbería Vallecas' en Google, SWAR no aparece con web propia",
      diferencial: "242 reseñas y fidelidad de años — una web con galería de cortes elevaría su imagen premium"
    },
    reseñas: [
      "Mi barbería de confianza desde hace 4 años. Ángel siempre sabe exactamente lo que quiero.",
      "Cuando te corta el pelo uno y te gusta, ya no quieres cambiar.",
      "Muy profesional y servicio excelente."
    ]
  },
  {
    id: 4,
    nombre: "Erika Peluqueros",
    cat: "Peluquería",
    zona: "Ensanche de Vallecas",
    dir: "C. María Teresa de León, 21",
    tel: "+34 693 75 37 17",
    nota: 4.2,
    nreseñas: 191,
    social: "Treatwell · Sin presencia digital propia",
    branding: {
      tono: "Colorista, dinámico, profesional. Equipo joven.",
      estilo: "Peluquería con varios trabajadores. Abierta mañana y tarde. Permanentes y tratamientos de color.",
      audiencia: "Hombres y mujeres del barrio.",
      painpoint: "Sin ninguna presencia digital propia — solo aparece en Treatwell si alguien tiene el link directo",
      diferencial: "Buen punto de partida con bajo presupuesto — una landing page básica ya los dispararía en SEO local"
    },
    reseñas: [
      "Jovanni está de vuelta y me alegra. Llevo yendo desde que abrieron.",
      "El corte fue perfecto. Emir es un profesional de verdad.",
      "Clara y Jovanni forman un equipo perfecto. Muy profesionales."
    ]
  },
  {
    id: 5,
    nombre: "Carnicería Madurarte",
    cat: "Comercio",
    zona: "Ensanche de Vallecas",
    dir: "Av. del Ensanche de Vallecas, 79",
    tel: "+34 744 64 77 42",
    nota: 4.5,
    nreseñas: 66,
    social: "Instagram @madurarte · Facebook",
    branding: {
      tono: "Artesanal, premium, apasionado. 'Carnes maduradas y preparados'",
      estilo: "Carnicería gourmet de barrio. Piden pedidos por WhatsApp/teléfono. Instagram con fotos de cortes y productos.",
      audiencia: "Familias del Ensanche que valoran la calidad y el servicio personalizado",
      painpoint: "Toman pedidos por teléfono pero sin web — pierden clientes que quieren ver el catálogo antes de llamar",
      diferencial: "Con Instagram activo ya tienen el contenido visual. Una web-catálogo con WhatsApp integrado sería inmediato"
    },
    reseñas: [
      "Calidad inmejorable. Hacen pedidos por teléfono y lo tienen listo cuando llegas.",
      "Si quieres la mejor barbacoa, habla con ellos. Saben perfectamente qué cortarte.",
      "Productos completamente diferentes a lo del supermercado. Vale cada euro."
    ]
  },
  {
    id: 6,
    nombre: "El Rincón de la Tortilla",
    cat: "Bar / Restaurante",
    zona: "Ensanche de Vallecas",
    dir: "C. Arte Conceptual, 23",
    tel: "+34 911 09 97 99",
    nota: 4.7,
    nreseñas: 1263,
    social: "Instagram @elrincondelatortilla2022 · Facebook · Glovo",
    branding: {
      tono: "Desenfadado, español, de barrio pero con mucha personalidad.",
      estilo: "Especialistas en tortillas creativas. Personal sonriente y atento. Opciones para celíacos.",
      audiencia: "Vecinos del Ensanche, familias, clientes de paso.",
      painpoint: "1263 reseñas en Google y sin web — pierden reservas para grupos y pedidos directos sin comisión a Glovo",
      diferencial: "El mayor volumen de reseñas del barrio. Una web con carta y reservas les daría presencia total"
    },
    reseñas: [
      "Tortilla española cremosa, de las mejores que he probado en Madrid.",
      "Toda una sorpresa este pequeño restaurante. Volveremos seguro.",
      "Personal muy amable, opciones sin gluten, precio justo."
    ]
  },
  {
    id: 7,
    nombre: "Inmobiliaria Manhattan",
    cat: "Inmobiliaria",
    zona: "Ensanche de Vallecas",
    dir: "C. José Tamayo, 3",
    tel: "+34 912 98 90 70",
    nota: 4.7,
    nreseñas: 186,
    social: "Facebook · Idealista · Gmail como contacto principal",
    branding: {
      tono: "Profesional, cercano, de confianza. Nati, Lourdes y Gabi son los referentes.",
      estilo: "Inmobiliaria de barrio con trato muy personal. Vendieron pisos en menos de una semana. Gmail como contacto oficial.",
      audiencia: "Compradores y vendedores en el Ensanche de Vallecas y alrededores",
      painpoint: "Sin web propia — todo su negocio pasa por Idealista, Facebook y boca a boca. No pueden captar leads directamente.",
      diferencial: "186 reseñas de 4.7 — una web con portfolio de operaciones cerradas les haría parecer una agencia de primer nivel"
    },
    reseñas: [
      "Vendieron nuestro piso en menos de una semana. El proceso fue impecable.",
      "Nati nos guió en cada paso del proceso. La mejor decisión que tomamos.",
      "Profesionalidad, cercanía y resultados. No encontramos nada mejor en el barrio."
    ]
  },
  {
    id: 8,
    nombre: "Talleres Víctor",
    cat: "Taller Mecánico",
    zona: "Villa de Vallecas",
    dir: "C. Peñas Largas, 21",
    tel: "+34 913 32 68 06",
    nota: 4.9,
    nreseñas: 143,
    social: "Solo directorios (Páginas Amarillas). Sin redes sociales.",
    branding: {
      tono: "Clásico, honesto, de confianza. 'Víctor y Antonio son lo mejor'",
      estilo: "Taller familiar con 4+ años de clientes fieles. Te muestran las piezas cambiadas. Precios competitivos.",
      audiencia: "Propietarios de coche en Villa de Vallecas que buscan taller de confianza",
      painpoint: "4.9 estrellas y sin ninguna presencia digital. Los clientes los descubren por Google Maps pero sin web no convierten.",
      diferencial: "La nota más alta de los talleres del barrio. Una web básica con servicios y cita online les daría ventaja enorme."
    },
    reseñas: [
      "Cuatro años llevando mi coche aquí. Siempre te enseñan las piezas que cambian.",
      "Los mejores de Vallecas. Víctor y Antonio son unos cracks con precios asequibles.",
      "Rápidos, de confianza. Mi coche sale siempre al precio acordado."
    ]
  },
  {
    id: 9,
    nombre: "Talleres Marsa e Hijos",
    cat: "Taller Mecánico",
    zona: "Villa de Vallecas",
    dir: "C. Ntra. Sra. de la Torre, 11",
    tel: "+34 917 78 73 99",
    nota: 4.9,
    nreseñas: 129,
    social: "Solo directorios. Sin redes sociales ni web.",
    branding: {
      tono: "Familiar, transparente, detallista. Carlos y Elena son los referentes.",
      estilo: "Taller de chapa, pintura y mecánica. Fotos del problema, explicación detallada, garantía real.",
      audiencia: "Clientes de Vallecas y alrededores, incluso turistas de paso.",
      painpoint: "Negocio familiar sin presencia digital más allá de Google Maps — invisible para quien busca en internet",
      diferencial: "Su 4.9 de 129 reseñas es excepcional. Una web con galería de trabajos los distinguiría completamente."
    },
    reseñas: [
      "Carlos mostró fotos del problema y realizó prueba de carretera antes de devolver el coche.",
      "Hicieron una reparación que otros talleres no pudieron. En tiempo record y con garantía.",
      "El mejor taller que he encontrado. Profesionales, rápidos y honestos."
    ]
  },
  {
    id: 10,
    nombre: "Shelby's Barbershop",
    cat: "Barbería",
    zona: "El Cañaveral",
    dir: "C. Ferenc Puskas, 245",
    tel: "+34 627 29 29 20",
    nota: 4.7,
    nreseñas: 63,
    social: "Instagram · Booksy · Linktree. Sin web propia.",
    branding: {
      tono: "Premium, elegante, exigente. 'La excelencia no es una opción: es la norma'",
      estilo: "Abiertos en 2024 — barbería nueva con estética cuidada, respuestas muy elaboradas a reseñas. También cortan a niños.",
      audiencia: "Hombres y familias del Cañaveral que buscan un barbero de confianza",
      painpoint: "Barbería nueva (2024) en barrio en crecimiento — una web les daría visibilidad antes de que la competencia se establezca",
      diferencial: "Solo 63 reseñas ya con 4.7 — potencial enorme si se posicionan en SEO ahora que el barrio crece."
    },
    reseñas: [
      "Álvaro me conoce ya con pocas visitas. Sabe lo que quiero sin explicarle.",
      "Con los niños tienen una paciencia infinita. Los llevaremos siempre.",
      "La presencia es tan importante como el corte. Shelby's lo entiende."
    ]
  },
  {
    id: 11,
    nombre: "La CarniVora de Vicálvaro",
    cat: "Comercio",
    zona: "Vicálvaro",
    dir: "C. Velilla, 9 (Mercado de Vicálvaro)",
    tel: "+34 614 18 24 81",
    nota: 5.0,
    nreseñas: 26,
    social: "TikTok @carniceria.lacarnivora · Solo redes. Sin web.",
    branding: {
      tono: "Energético, pasional, innovador. Cachopos originales como sello diferencial.",
      estilo: "Carnicería artesana con identidad digital en TikTok. Hacen delivery. Cachopos propios con múltiples rellenos.",
      audiencia: "Vecinos de Vicálvaro y alrededores, amantes de la carne de calidad",
      painpoint: "Perfecta en TikTok pero sin web para captar pedidos y hacer delivery propio sin depender de terceros",
      diferencial: "5.0 perfecto con contenido visual en TikTok. Solo les falta la web-catálogo."
    },
    reseñas: [
      "Los cachopos son espectaculares, con una variedad enorme de rellenos.",
      "Carne de calidad increíble. Se nota la pasión del propietario.",
      "Hacen delivery a domicilio y llega en perfectas condiciones."
    ]
  }
];

const catColors = {
  "Estética": { bg: "#2d1b2e", border: "#7c3aed", text: "#c084fc" },
  "Peluquería": { bg: "#1e1b4b", border: "#4f46e5", text: "#818cf8" },
  "Barbería": { bg: "#0c1a2e", border: "#1d4ed8", text: "#60a5fa" },
  "Comercio": { bg: "#052e16", border: "#166534", text: "#4ade80" },
  "Bar / Restaurante": { bg: "#1c1407", border: "#92400e", text: "#fbbf24" },
  "Inmobiliaria": { bg: "#1c0f02", border: "#9a3412", text: "#fb923c" },
  "Taller Mecánico": { bg: "#1e0a0a", border: "#b91c1c", text: "#f87171" }
};

const catIcons = {
  "Estética": "✦",
  "Peluquería": "✂",
  "Barbería": "✦",
  "Comercio": "◈",
  "Bar / Restaurante": "⊡",
  "Inmobiliaria": "⌂",
  "Taller Mecánico": "⚙"
};

function Badge({ cat }) {
  const c = catColors[cat] || { bg: "#18181b", border: "#3f3f46", text: "#a1a1aa" };
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 6
    }}>
      {catIcons[cat]} {cat.toUpperCase()}
    </span>
  );
}

function LeadCard({ lead }) {
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePrompt = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Eres un experto en ventas de webs para pequeños negocios locales en Madrid.

Tu cliente es David, desarrollador web freelance de 21 años que vive en el barrio. Se especializa en webs para negocios locales (precio orientativo 400-800€). Antes hizo la web de Focus Club Vallecas (gym) y Academia Alzea. Es joven, cercano y habla en español informal.

NEGOCIO OBJETIVO:
Nombre: ${lead.nombre}
Categoría: ${lead.cat}
Dirección: ${lead.dir}, ${lead.zona}
Teléfono: ${lead.tel}
Nota Google: ${lead.nota}/5 con ${lead.nreseñas} reseñas
Presencia digital actual: ${lead.social}

ANÁLISIS DE BRANDING DETECTADO:
- Tono de la marca: ${lead.branding.tono}
- Estilo comunicativo: ${lead.branding.estilo}
- Audiencia objetivo: ${lead.branding.audiencia}
- Pain point principal sin web: ${lead.branding.painpoint}
- Lo que una web les daría: ${lead.branding.diferencial}

RESEÑAS DESTACADAS DE CLIENTES:
${lead.reseñas.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

TAREA: Genera un mensaje de WhatsApp de prospección que David enviará a este negocio.

Reglas estrictas:
- Máximo 6 líneas
- Empezar mencionando que encontró su negocio en Google (dato específico: nota y número de reseñas)
- Señalar 1 pain point concreto y específico para SU sector y situación (no genérico)
- Mencionar 1 resultado concreto que David podría hacer para ellos
- Proponer una reunión breve de 20 min sin presión
- Tono informal pero profesional, como vecino del barrio
- Adaptar el tono al branding del negocio
- No usar emojis excesivos, máximo 1-2

Responde SOLO con el texto del WhatsApp, sin explicaciones ni títulos.`
          }]
        })
      });
      const data = await res.json();
      setPrompt(data.content[0]?.text || "Error al generar.");
    } catch {
      setPrompt("Error de conexión. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const copy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "#111113", border: "1px solid #27272a", borderRadius: 14,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14
    }}>
      {/* Top */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <Badge cat={lead.cat} />
            <span style={{ fontSize: 10, color: "#71717a", background: "#18181b", border: "1px solid #3f3f46", padding: "3px 8px", borderRadius: 6, fontWeight: 600, letterSpacing: 0.5 }}>
              {lead.zona.toUpperCase()}
            </span>
          </div>
          <h2 style={{ margin: 0, color: "#f4f4f5", fontSize: 16, fontWeight: 700 }}>{lead.nombre}</h2>
          <div style={{ fontSize: 12, color: "#71717a", marginTop: 3 }}>📍 {lead.dir}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{lead.nota}</div>
          <div style={{ fontSize: 10, color: "#f59e0b" }}>{"★".repeat(Math.floor(lead.nota))}{"☆".repeat(5-Math.floor(lead.nota))}</div>
          <div style={{ fontSize: 10, color: "#71717a", marginTop: 2 }}>{lead.nreseñas.toLocaleString()} reseñas</div>
        </div>
      </div>

      {/* Tel */}
      <a href={`tel:${lead.tel}`} style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none", display: "block" }}>
        📞 {lead.tel}
      </a>

      {/* Social */}
      <div style={{ fontSize: 12, borderLeft: "3px solid #f59e0b", paddingLeft: 10, color: "#a1a1aa" }}>
        <span style={{ color: "#f59e0b", fontWeight: 700 }}>DIGITAL: </span>{lead.social}
      </div>

      {/* Brand analysis */}
      <div style={{ background: "#0d0d0f", borderRadius: 10, padding: "12px 14px", border: "1px solid #1f1f23", fontSize: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#71717a", letterSpacing: 1, marginBottom: 10 }}>ANÁLISIS DE MARCA</div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: "#71717a" }}>Tono: </span><span style={{ color: "#d4d4d8" }}>{lead.branding.tono}</span>
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: "#71717a" }}>Audiencia: </span><span style={{ color: "#d4d4d8" }}>{lead.branding.audiencia}</span>
        </div>
        <div style={{ background: "#1f0808", border: "1px solid #7f1d1d", borderRadius: 6, padding: "6px 10px", marginBottom: 6 }}>
          <span style={{ color: "#f87171", fontWeight: 700 }}>⚠ PAIN: </span><span style={{ color: "#d4d4d8" }}>{lead.branding.painpoint}</span>
        </div>
        <div style={{ background: "#052e16", border: "1px solid #14532d", borderRadius: 6, padding: "6px 10px" }}>
          <span style={{ color: "#4ade80", fontWeight: 700 }}>✓ PROPUESTA: </span><span style={{ color: "#d4d4d8" }}>{lead.branding.diferencial}</span>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#71717a", letterSpacing: 1, marginBottom: 8 }}>RESEÑAS</div>
        {lead.reseñas.map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#a1a1aa", fontStyle: "italic", paddingLeft: 10, borderLeft: "2px solid #3f3f46", marginBottom: 5 }}>
            "{r}"
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={generatePrompt} disabled={loading} style={{
          flex: 1, background: loading ? "#27272a" : "#f59e0b", color: loading ? "#71717a" : "#09090b",
          border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: loading ? "wait" : "pointer"
        }}>
          {loading ? "Generando…" : "⚡ Generar prompt IA"}
        </button>
        {prompt && <button onClick={copy} style={{
          background: copied ? "#166534" : "#1a1a1c", color: copied ? "#4ade80" : "#a1a1aa",
          border: "1px solid #3f3f46", borderRadius: 8, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600
        }}>{copied ? "✓" : "📋"}</button>}
      </div>

      {/* Prompt output */}
      {(prompt || loading) && (
        <div style={{ background: "#0a0f0a", border: "1px solid #166534", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#4ade80", letterSpacing: 1, marginBottom: 8 }}>PROMPT WHATSAPP GENERADO</div>
          {loading ? (
            <div style={{ color: "#71717a", fontSize: 12 }}>Analizando marca y generando mensaje personalizado…</div>
          ) : (
            <div style={{ color: "#d4d4d8", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{prompt}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [catFilter, setCatFilter] = useState("Todas");
  const [zonaFilter, setZonaFilter] = useState("Todas");
  const [search, setSearch] = useState("");

  const cats = ["Todas", ...new Set(LEADS.map(l => l.cat))];
  const zonas = ["Todas", ...new Set(LEADS.map(l => l.zona))];

  const filtered = LEADS.filter(l => {
    if (catFilter !== "Todas" && l.cat !== catFilter) return false;
    if (zonaFilter !== "Todas" && l.zona !== zonaFilter) return false;
    if (search && !l.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalR = LEADS.reduce((s, l) => s + l.nreseñas, 0);
  const avgN = (LEADS.reduce((s, l) => s + l.nota, 0) / LEADS.length).toFixed(1);

  return (
    <div style={{ background: "#09090b", minHeight: "100vh", color: "#f4f4f5", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1f1f23", padding: "24px 24px 18px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 800, letterSpacing: 3, marginBottom: 6 }}>LEAD INTEL — VALLECAS ZONE 2025</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>
              Prospectos <span style={{ color: "#f59e0b" }}>sin web</span> verificados
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#71717a" }}>
              Ensanche de Vallecas · Villa de Vallecas · El Cañaveral · Vicálvaro — webs confirmadas manualmente
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ l: "Negocios", v: LEADS.length }, { l: "Reseñas", v: totalR.toLocaleString() }, { l: "Nota media", v: avgN + "★" }].map(s => (
              <div key={s.l} style={{ background: "#111113", border: "1px solid #27272a", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b" }}>{s.v}</div>
                <div style={{ fontSize: 9, color: "#71717a", fontWeight: 700, letterSpacing: 1 }}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid #1f1f23", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Buscar…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: "#111113", border: "1px solid #3f3f46", borderRadius: 8, color: "#f4f4f5", padding: "7px 11px", fontSize: 13, outline: "none", width: 150 }} />
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3,
            background: catFilter === c ? "#f59e0b" : "#111113",
            color: catFilter === c ? "#09090b" : "#71717a",
            border: catFilter === c ? "1px solid #f59e0b" : "1px solid #27272a"
          }}>{c}</button>
        ))}
        <span style={{ width: 1, height: 20, background: "#27272a", margin: "0 4px" }} />
        {zonas.map(z => (
          <button key={z} onClick={() => setZonaFilter(z)} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: zonaFilter === z ? "#1a1a1c" : "transparent",
            color: zonaFilter === z ? "#f4f4f5" : "#52525b",
            border: zonaFilter === z ? "1px solid #3f3f46" : "1px solid transparent"
          }}>{z}</button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#52525b", fontWeight: 600 }}>{filtered.length} resultados</div>
      </div>

      {/* Grid */}
      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
        {filtered.map(lead => <LeadCard key={lead.id} lead={lead} />)}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #1f1f23", fontSize: 11, color: "#3f3f46", textAlign: "center" }}>
        ⚠ Webs verificadas manualmente · Comprobar antes de contactar que siguen sin web activa · Datos reales de Google Maps
      </div>
    </div>
  );
}
