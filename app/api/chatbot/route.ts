import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to find best matching response
function findBestMatch(message: string, knowledge: { question: string; answer: string; keywords: string[] }[]): string | null {
  const lowerMessage = message.toLowerCase()
  
  // First try to match keywords
  for (const item of knowledge) {
    for (const keyword of item.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return item.answer
      }
    }
  }
  
  // Then try to match question similarity
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

    // Get chatbot knowledge from database
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('active', true)

    if (knowledgeError) {
      console.error('[v0] Chatbot knowledge error:', knowledgeError)
    }

    const lowerMessage = message.toLowerCase()
    let response = ''

    // Check for greetings
    if (lowerMessage.match(/^(hola|hi|hey|buenos dias|buenas tardes|buenas noches|que tal)/)) {
      response = 'Hola! Bienvenido a Luxury Hats. Soy tu asistente virtual. Como puedo ayudarte hoy? Puedo responder preguntas sobre envios, pagos, productos, tallas y mas.'
      return NextResponse.json({ response })
    }

    // Check for thanks
    if (lowerMessage.match(/(gracias|thank|genial|perfecto|excelente)/)) {
      response = 'De nada! Estoy aqui para ayudarte. Hay algo mas en lo que pueda asistirte?'
      return NextResponse.json({ response })
    }

    // Check for product queries
    if (lowerMessage.match(/(producto|gorra|gorras|catalogo|comprar|precio)/)) {
      const { data: products } = await supabase
        .from('products')
        .select('name, price, stock')
        .eq('featured', true)
        .limit(3)

      if (products && products.length > 0) {
        const productList = products.map(p => 
          `- ${p.name}: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.price)}`
        ).join('\n')
        
        response = `Tenemos una amplia coleccion de gorras premium! Aqui algunos de nuestros productos destacados:\n\n${productList}\n\nPuedes ver todo nuestro catalogo en la seccion "Catalogo". Necesitas ayuda con algo especifico?`
        return NextResponse.json({ response })
      }
    }

    // Check for stock queries
    if (lowerMessage.match(/(stock|disponible|disponibilidad|hay|tienen)/)) {
      const { data: products } = await supabase
        .from('products')
        .select('name, stock')
        .gt('stock', 0)
        .limit(5)

      if (products && products.length > 0) {
        response = `Actualmente tenemos ${products.length}+ productos disponibles en stock. Puedes ver la disponibilidad especifica de cada producto en su pagina de detalle. Que modelo te interesa?`
        return NextResponse.json({ response })
      }
    }

    // Check for promotion queries
    if (lowerMessage.match(/(promocion|promociones|descuento|oferta|codigo|cupon)/)) {
      const { data: promotions } = await supabase
        .from('promotions')
        .select('code, description, discount_type, discount_value')
        .eq('active', true)
        .limit(3)

      if (promotions && promotions.length > 0) {
        const promoList = promotions.map(p => {
          const discount = p.discount_type === 'percentage' 
            ? `${p.discount_value}%` 
            : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.discount_value)
          return `- ${p.code}: ${p.description} (${discount} de descuento)`
        }).join('\n')
        
        response = `Tenemos estas promociones activas:\n\n${promoList}\n\nPuedes aplicar el codigo en el checkout. Tienes alguna otra pregunta?`
        return NextResponse.json({ response })
      }
    }

    // Try to find answer from knowledge base
    if (knowledge && knowledge.length > 0) {
      const matchedResponse = findBestMatch(message, knowledge)
      if (matchedResponse) {
        return NextResponse.json({ response: matchedResponse })
      }
    }

    // Default response with suggestions
    response = `Gracias por tu mensaje! Puedo ayudarte con:\n\n- Informacion sobre envios y tiempos de entrega\n- Metodos de pago disponibles\n- Promociones y codigos de descuento\n- Guia de tallas\n- Nuestro catalogo de productos\n- Politica de devoluciones\n\nPuedes preguntarme sobre cualquiera de estos temas. Si necesitas hablar con un asesor, contactanos por WhatsApp al +57 300 123 4567.`

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[v0] Chatbot API error:', error)
    return NextResponse.json({ 
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo o contactanos directamente.' 
    }, { status: 200 }) // Return 200 to show message to user
  }
}
