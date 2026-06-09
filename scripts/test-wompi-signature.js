// Test Wompi signature generation
// Run: node scripts/test-wompi-signature.js
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}

const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || ''

console.log('=== WOMPI SIGNATURE DIAGNOSTIC ===\n')
console.log('WOMPI_INTEGRITY_KEY present:', !!WOMPI_INTEGRITY_KEY)
console.log('WOMPI_INTEGRITY_KEY value:', WOMPI_INTEGRITY_KEY ? `${WOMPI_INTEGRITY_KEY.substring(0, 20)}...` : 'EMPTY — THIS IS THE PROBLEM!')
console.log('WOMPI_INTEGRITY_KEY length:', WOMPI_INTEGRITY_KEY.length)
console.log('')

if (!WOMPI_INTEGRITY_KEY) {
  console.error('❌ ERROR: WOMPI_INTEGRITY_KEY is empty!')
  console.error('   1. Go to comercios.wompi.co → API Keys')
  console.error('   2. Copy the "Integrity Key" (starts with prod_integrity_...)')
  console.error('   3. Add it to .env.local as: WOMPI_INTEGRITY_KEY=prod_integrity_...')
  console.error('   4. Also add it to Vercel environment variables')
  process.exit(1)
}

// Test with example values (same as Wompi docs)
const testReference = 'test-order-123'
const testAmount = 50000 * 100 // 50000 COP in cents
const testCurrency = 'COP'

const concatenated = `${testReference}${testAmount}${testCurrency}${WOMPI_INTEGRITY_KEY}`
const signature = crypto.createHash('sha256').update(concatenated).digest('hex')

console.log('✅ Signature generation test:')
console.log('   Reference:', testReference)
console.log('   Amount (cents):', testAmount)
console.log('   Currency:', testCurrency)
console.log('   Concatenated string:', `${testReference}${testAmount}${testCurrency}[INTEGRITY_KEY]`)
console.log('   Generated signature:', signature)
console.log('')
console.log('✅ If the key is correct, this signature will be accepted by Wompi.')
console.log('')

// Show what the checkout URL looks like
const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
console.log('NEXT_PUBLIC_WOMPI_PUBLIC_KEY:', publicKey ? `${publicKey.substring(0, 20)}...` : 'MISSING!')
console.log('')
console.log('Sample checkout URL:')
console.log(`https://checkout.wompi.co/p/?public-key=${publicKey}&currency=COP&amount-in-cents=${testAmount}&reference=${testReference}&signature:integrity=${signature}`)
