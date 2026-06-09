interface TrackingInfo {
  carrier?: string
  trackingNumber?: string
  trackingPhotoUrl?: string
  adminNote?: string
}

interface OrderItem {
  product_name: string
  quantity: number
  price: number
  color?: string
  size?: string
}

interface OrderDetails {
  subtotal: number
  shipping_cost: number
  total: number
  items?: OrderItem[]
}

const statusMap: Record<string, { subject: string; title: string; desc: string; color: string }> = {
  processing: {
    subject: '🛒 Tu pedido está siendo preparado - Urban Crown',
    title: '¡Estamos preparando tu pedido!',
    desc: 'Tu pedido ya fue confirmado y está en proceso de preparación en nuestro centro de distribución de lujo.',
    color: '#3b82f6', // blue
  },
  shipped: {
    subject: '🚚 ¡Tu pedido fue enviado! - Urban Crown',
    title: '¡Tu pedido va en camino!',
    desc: 'Tu paquete ha sido entregado a la transportadora. Abajo encontrarás los detalles del envío para rastrearlo.',
    color: '#a855f7', // purple
  },
  delivered: {
    subject: '✅ ¡Tu pedido fue entregado! - Urban Crown',
    title: '¡Pedido Entregado!',
    desc: 'Tu pedido ha sido entregado con éxito. ¡Esperamos que disfrutes tus nuevas prendas exclusivas!',
    color: '#10b981', // emerald
  },
  cancelled: {
    subject: '❌ Actualización de tu pedido - Urban Crown',
    title: 'Pedido Cancelado',
    desc: 'Lamentamos informarte que tu pedido ha sido cancelado. Si tienes dudas, por favor contáctanos.',
    color: '#ef4444', // red
  },
}

export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: string,
  tracking?: TrackingInfo,
  details?: OrderDetails
) {
  const config = statusMap[status] || {
    subject: `Actualización de tu pedido #${orderNumber}`,
    title: `Estado: ${status}`,
    desc: `Tu pedido #${orderNumber} ha cambiado de estado.`,
    color: '#FF007F', // default neon-pink
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  const formattedTotal = details
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(details.total)
    : ''
  const formattedSubtotal = details
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(details.subtotal)
    : ''
  const formattedShipping = details
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(details.shipping_cost)
    : ''

  // Build items HTML
  let itemsHtml = ''
  if (details?.items && details.items.length > 0) {
    itemsHtml = details.items
      .map(
        (item) => `
      <div style="padding: 12px 0; border-bottom: 1px solid #222;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="margin: 0; font-weight: bold; color: #ffffff; font-size: 14px;">${item.product_name}</p>
            <p style="margin: 4px 0 0 0; color: #888888; font-size: 12px;">
              ${[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `Cant: ${item.quantity}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <p style="margin: 0; color: #FF007F; font-weight: bold; font-size: 14px;">
            ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(
              item.price * item.quantity
            )}
          </p>
        </div>
      </div>`
      )
      .join('')
  }

  // Tracking section HTML
  let trackingHtml = ''
  if (status === 'shipped' && tracking?.trackingNumber) {
    trackingHtml = `
      <div style="margin-top: 24px; padding: 20px; border-radius: 16px; bg-color: #111111; border: 1px solid #a855f7; background: linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0, 0, 0, 0) 100%);">
        <h3 style="margin: 0 0 12px 0; color: #a855f7; font-size: 16px; display: flex; align-items: center;">🚚 Información del Envío</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #dddddd;">
          <tr>
            <td style="padding: 4px 0; color: #888888; width: 120px;">Transportadora:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #ffffff;">${tracking.carrier || 'InterRapidisimo'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #888888;">Número de Guía:</td>
            <td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #ffffff;">${tracking.trackingNumber}</td>
          </tr>
        </table>
        ${
          tracking.trackingPhotoUrl
            ? `
          <div style="margin-top: 12px;">
            <a href="${tracking.trackingPhotoUrl}" target="_blank" style="display: inline-block; color: #00FFFF; text-decoration: underline; font-size: 13px;">
              Ver foto del comprobante de envío
            </a>
          </div>`
            : ''
        }
        ${
          tracking.adminNote
            ? `
          <div style="margin-top: 12px; border-top: 1px solid #222; padding-top: 12px; font-style: italic; color: #888888; font-size: 13px;">
            "Note: ${tracking.adminNote}"
          </div>`
            : ''
        }
      </div>`
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${config.subject}</title>
</head>
<body style="background-color: #050505; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d0d0d; border-radius: 24px; border: 1px solid #1a1a1a; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
    
    <!-- Header -->
    <div style="padding: 30px; text-align: center; border-bottom: 1px solid #151515;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
        URBAN <span style="color: #FF007F;">CROWN</span>
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #E2B13C; font-weight: 600;">
        Luxury Streetwear
      </p>
    </div>

    <!-- Hero Content -->
    <div style="padding: 40px 30px; text-align: center; background: linear-gradient(180deg, rgba(255, 0, 127, 0.03) 0%, rgba(0,0,0,0) 100%);">
      <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color}30; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">
        Pedido #${orderNumber}
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff;">${config.title}</h2>
      <p style="margin: 0; font-size: 15px; color: #aaaaaa; line-height: 1.6; max-w: 480px; margin: 0 auto;">
        ${config.desc}
      </p>

      ${trackingHtml}
    </div>

    <!-- Order Items & Totals -->
    ${
      details
        ? `
    <div style="padding: 0 30px 40px 30px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Resumen del Pedido</h3>
      
      <!-- Items List -->
      ${itemsHtml}

      <!-- Prices summary -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; color: #aaaaaa;">
        <tr>
          <td style="padding: 6px 0;">Subtotal</td>
          <td style="padding: 6px 0; text-align: right; color: #ffffff;">${formattedSubtotal}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;">Envío</td>
          <td style="padding: 6px 0; text-align: right; color: #ffffff;">${formattedShipping}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 16px; color: #ffffff;">
          <td style="padding: 16px 0 0 0; border-top: 1px dashed #222;">Total Pagado</td>
          <td style="padding: 16px 0 0 0; text-align: right; color: #E2B13C; border-top: 1px dashed #222;">${formattedTotal}</td>
        </tr>
      </table>
    </div>`
        : ''
    }

    <!-- Call to Action -->
    <div style="padding: 0 30px 40px 30px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://urbancrown.co'}/pedidos?order_number=${orderNumber}&email=${encodeURIComponent(to)}" target="_blank" style="display: inline-block; background-color: #E2B13C; color: #000000; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px; transition: transform 0.2s;">
        SEGUIR MI PEDIDO EN LA WEB
      </a>
    </div>

    <!-- Footer -->
    <div style="padding: 30px; background-color: #080808; text-align: center; border-top: 1px solid #111; font-size: 12px; color: #666666;">
      <p style="margin: 0 0 8px 0;">© 2026 Urban Crown. Todos los derechos reservados.</p>
      <p style="margin: 0;">Si tienes alguna pregunta, responde a este correo o escríbenos a <a href="mailto:urbancrowncol4@gmail.com" style="color: #FF007F; text-decoration: none;">urbancrowncol4@gmail.com</a></p>
    </div>

  </div>
</body>
</html>
`

  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Urban Crown <${fromEmail}>`,
          to,
          subject: config.subject,
          html,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[mail] Resend API error response:', errorText)
      } else {
        const result = await response.json()
        console.log('[mail] Email sent successfully via Resend:', result.id)
      }
    } catch (err) {
      console.error('[mail] Failed to send email via Resend API:', err)
    }
  } else {
    // Mock logging when RESEND_API_KEY is not defined
    console.log('\n=================== MOCK EMAIL NOTIFICATION ===================')
    console.log(`FROM: Urban Crown <${fromEmail}>`)
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${config.subject}`)
    console.log(`ORDER STATUS UPDATE: ${status}`)
    console.log('---------------------------------------------------------------')
    console.log(`A mock email was triggered for status: ${status}.`)
    console.log(`Order Number: ${orderNumber}`)
    if (tracking?.trackingNumber) {
      console.log(`Carrier: ${tracking.carrier}, Tracking Number: ${tracking.trackingNumber}`)
    }
    console.log('===============================================================\n')
  }
}
