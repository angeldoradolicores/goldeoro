import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to format price
function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

// Helper to find best matching knowledge answer
function findBestMatch(message: string, knowledge: { question: string; answer: string; keywords: string[] }[]): string | null {
  const lowerMessage = message.toLowerCase()
  for (const item of knowledge) {
    for (const keyword of item.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return item.answer
      }
    }
  }
  for (const item of knowledge) {
    const questionWords = item.question.toLowerCase().split(' ')
    const matchCount = questionWords.filter(word => 
      word.length > 3 && lowerMessage.includes(word)
    ).length
    if (matchCount >= 2) {
      return item.answer
    }
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    const supabase = await createClient()

    // Get active chatbot knowledge
    const { data: knowledge } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('active', true)

    const lowerMessage = message.toLowerCase()
    let response = ''

    // 1. GREETINGS
    if (lowerMessage.match(/^(hola|hi|hey|buenos dias|buenas tardes|buenas noches|que tal|saludos)/)) {
      response = '¡Hola! Bienvenido a Urban Crown. Soy CROWN ASISTENTE, tu asesor personal de estilo urbano. 👑\n\n¿En qué te puedo ayudar hoy? Pregúntame sobre:\n- Gorras disponibles y precios\n- Estilos destacados, exclusivas o novedades\n- Gorras en oferta/descuento\n- Envíos nacionales\n- Hablar directamente con un asesor'
      return NextResponse.json({ response })
    }

    // 2. THANKS
    if (lowerMessage.match(/(gracias|thank|genial|perfecto|excelente|super|ok)/)) {
      response = '¡Con mucho gusto! Estoy aquí para que definas tu estilo con lo mejor. Si necesitas algo más, solo dime.'
      return NextResponse.json({ response })
    }

    // 3. WHATSAPP ASESOR / CONTACTO
    if (lowerMessage.match(/(asesor|telefono|contacto|whatsapp|hablar con alguien|humano|soporte|celular|numero)/)) {
      response = 'Claro que sí, puedes comunicarte directamente con nuestro asesor de estilo por WhatsApp al número: 3108999049. Estará encantado de darte una atención personalizada.'
      return NextResponse.json({ response })
    }

    // 4. SHIPPING / ENVIOS
    if (lowerMessage.match(/(envio|envios|tiempo|entrega|interrapidisimo|despacho|llega|demora)/)) {
      response = 'Nuestros envíos se realizan exclusivamente a través de **Interrapidisimo** a todo el país. 🚚\n\n- **Tiempo de entrega:** De 3 a 5 días hábiles.\n- **Costo:** ¡El envío es completamente gratis por compras mayores a $200.000!\n\nUna vez despachado tu pedido, te compartiremos el número de guía para que puedas rastrearlo en tiempo real.'
      return NextResponse.json({ response })
    }

    // 5. PRODUCTS / ESTILOS / MAS VENDIDOS / RECOMENDACIONES
    if (lowerMessage.match(/(producto|gorra|gorras|catalogo|comprar|precio|precio|estilo|estilos|mas vendida|mas vendidas|exclusiva|exclusivas|nueva|nuevas|llegaron)/)) {
      // Fetch all products from DB
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)

      if (products && products.length > 0) {
        // Classify products
        const featured = products.filter(p => p.featured)
        const premium = products.filter(p => p.category?.toLowerCase() === 'premium')
        const allList = products.slice(0, 5) // Fallback list

        let intro = 'En **Urban Crown** tenemos una colección brutal de gorras de alta gama. Aquí te recomiendo las mejores:\n\n'

        if (lowerMessage.match(/(mas vendida|mas vendidas|popular|populares|favoritas)/)) {
          intro = '🔥 **Nuestras Gorras Más Vendidas:**\n\n'
          const list = featured.length > 0 ? featured : allList
          response = intro + list.map(p => `- **${p.name}**: ${formatPrice(p.price)} (Diseño exclusivo destacado)`).join('\n')
        } else if (lowerMessage.match(/(exclusiva|exclusivas|premium|lujo|lujosa)/)) {
          intro = '👑 **Nuestra Colección Exclusiva (Premium):**\n\n'
          const list = premium.length > 0 ? premium : featured
          response = intro + list.map(p => `- **${p.name}**: ${formatPrice(p.price)} (Edición de alta costura urbana)`).join('\n')
        } else if (lowerMessage.match(/(nueva|nuevas|reciente|novedad|novedades|llegaron)/)) {
          intro = '✨ **Novedades Recién Llegadas:**\n\n'
          const list = products.slice(-3) // Last 3 products added
          response = intro + list.map(p => `- **${p.name}**: ${formatPrice(p.price)} (Lo último en streetwear)`).join('\n')
        } else {
          // General recommendation on styles, prices & products
          response = intro + 
            `🌟 **Destacadas:**\n` + 
            featured.slice(0, 2).map(p => `- ${p.name}: ${formatPrice(p.price)}`).join('\n') + 
            `\n\n👑 **Premium de Lujo:**\n` + 
            (premium.length > 0 ? premium : products).slice(0, 2).map(p => `- ${p.name}: ${formatPrice(p.price)}`).join('\n') + 
            `\n\n💡 **Recomendación de Estilo:** Si buscas marcar la diferencia con acabados de lujo, te sugerimos la línea *Premium*. Para el día a día y un look más callejero, las *Urban* son ideales.`
        }

        response += '\n\nPuedes ver la colección completa y comprar directamente en nuestra sección de **Catálogo**. ¿Te interesa algún estilo en particular?'
        return NextResponse.json({ response })
      } else {
        response = 'Actualmente estamos actualizando nuestro inventario de gorras exclusivas. Puedes consultar con nuestro asesor al WhatsApp 3108999049 para conocer la fecha del próximo drop.'
        return NextResponse.json({ response })
      }
    }

    // 6. PROMOTIONS / OFFERS
    if (lowerMessage.match(/(promocion|promociones|descuento|oferta|ofertas|rebaja|rebajas|barato|economico)/)) {
      // Query products with active discounts in DB
      const { data: discountedProducts } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .or('is_promotion.eq.true,original_price.gt.price')

      if (discountedProducts && discountedProducts.length > 0) {
        const promoList = discountedProducts.slice(0, 4).map(p => {
          const orig = p.original_price || p.originalPrice || p.price
          const savings = orig > p.price ? ` (Antes: ${formatPrice(orig)})` : ''
          return `- **${p.name}**: ${formatPrice(p.price)}${savings}`
        }).join('\n')

        response = `💸 **Gorras en Oferta Especial:**\n\n${promoList}\n\nAdemás, recuerda que obtienes **envío gratis** en compras superiores a $200.000. ¡No necesitas códigos promocionales, los descuentos se aplican directamente en tu carrito!`
      } else {
        response = 'Todas nuestras gorras mantienen precios competitivos para su alta calidad. Visita la sección "Ofertas" en nuestra barra de menú para ver modelos con descuentos directos aplicados.'
      }
      return NextResponse.json({ response })
    }

    // 7. KNOWLEDGE BASE MATCH
    if (knowledge && knowledge.length > 0) {
      const matchedResponse = findBestMatch(message, knowledge)
      if (matchedResponse) {
        // Make sure the static DB knowledge doesn't talk about sizes or wrong shipping
        let sanitized = matchedResponse
          .replace(/envio standard/gi, 'envío por Interrapidisimo')
          .replace(/envio express/gi, 'envío por Interrapidisimo')
          .replace(/guia de tallas/gi, 'asesoría de estilo')
          .replace(/talla/gi, 'estilo')
        return NextResponse.json({ response: sanitized })
      }
    }

    // 8. DEFAULT FALLBACK
    response = `Gracias por tu mensaje. Como CROWN ASISTENTE de Urban Crown, puedo ayudarte con:\n\n` +
               `- Ver los productos, precios y recomendaciones de estilo\n` +
               `- Conocer los modelos en oferta y más vendidos\n` +
               `- Información de envíos nacionales (exclusivos por Interrapidisimo, 3-5 días)\n` +
               `- Datos de contacto de nuestro asesor personal (WhatsApp 3108999049)\n\n` +
               `¿De qué tema te gustaría que habláramos? Si prefieres, escríbele directamente a nuestro asesor.`

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[v0] Chatbot API error:', error)
    return NextResponse.json({ 
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo o escríbele directamente a nuestro asesor al WhatsApp 3108999049.' 
    }, { status: 200 })
  }
}
