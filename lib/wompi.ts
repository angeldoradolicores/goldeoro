import crypto from 'crypto'

const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || ''
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || ''
const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || ''

const WOMPI_API_URL = 'https://api.wompi.co/v1'

export interface WompiPaymentSource {
  type: 'CARD' | 'NEQUI' | 'PSE' | 'BANCOLOMBIA_TRANSFER'
  token?: string
  phone_number?: string
  customer_email?: string
  payment_description?: string
  user_type?: 'PERSON' | 'COMPANY'
  financial_institution_code?: string
  user_legal_id?: string
  user_legal_id_type?: string
}

export interface WompiTransaction {
  id: string
  amount_in_cents: number
  reference: string
  customer_email: string
  currency: string
  payment_method_type: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'
  status_message?: string
  created_at: string
  finalized_at?: string
}

// Generate signature for integrity verification
export function generateWompiSignature(
  reference: string,
  amountInCents: number,
  currency: string = 'COP'
): string {
  const concatenated = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`
  return crypto.createHash('sha256').update(concatenated).digest('hex')
}

// Get acceptance token from Wompi
export async function getAcceptanceToken(): Promise<string> {
  const response = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`)
  const data = await response.json()
  return data.data.presigned_acceptance.acceptance_token
}

// Create a card token
export async function createCardToken(cardData: {
  number: string
  cvc: string
  exp_month: string
  exp_year: string
  card_holder: string
}): Promise<string> {
  const response = await fetch(`${WOMPI_API_URL}/tokens/cards`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cardData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.messages?.[0] || 'Error al procesar la tarjeta')
  }

  const data = await response.json()
  return data.data.id
}

// Create a payment transaction
export async function createTransaction(params: {
  amountInCents: number
  reference: string
  customerEmail: string
  customerName: string
  paymentSource: WompiPaymentSource
  acceptanceToken: string
  redirectUrl?: string
}): Promise<WompiTransaction> {
  const signature = generateWompiSignature(
    params.reference,
    params.amountInCents
  )

  const body: Record<string, unknown> = {
    amount_in_cents: params.amountInCents,
    currency: 'COP',
    signature: signature,
    customer_email: params.customerEmail,
    reference: params.reference,
    payment_method: params.paymentSource,
    acceptance_token: params.acceptanceToken,
  }

  if (params.redirectUrl) {
    body.redirect_url = params.redirectUrl
  }

  const response = await fetch(`${WOMPI_API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[v0] Wompi transaction error:', error)
    throw new Error(error.error?.messages?.[0] || 'Error al procesar el pago')
  }

  const data = await response.json()
  return data.data
}

// Get transaction status
export async function getTransaction(transactionId: string): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('Error al obtener la transaccion')
  }

  const data = await response.json()
  return data.data
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const concatenated = `${timestamp}${payload}${WOMPI_PRIVATE_KEY}`
  const expectedSignature = crypto
    .createHash('sha256')
    .update(concatenated)
    .digest('hex')
  return signature === expectedSignature
}

// Generate order reference
export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `LH-${timestamp}-${random}`.toUpperCase()
}

// Get PSE financial institutions
export async function getPSEInstitutions(): Promise<{ financial_institution_code: string; financial_institution_name: string }[]> {
  const response = await fetch(`${WOMPI_API_URL}/pse/financial_institutions`, {
    headers: {
      'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('Error al obtener instituciones financieras')
  }

  const data = await response.json()
  return data.data
}
