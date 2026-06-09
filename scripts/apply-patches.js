// Check if products table has the required columns, and fix order_items constraint
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://hazarlzuzgvxdketftao.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemFybHp1emd2eGRrZXRmdGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM1NDYzOSwiZXhwIjoyMDk1OTMwNjM5fQ.GqjnTbH0oHu6-4DuSZCpcXKYh7Bz5-ZLRkA4uEGWiz8'

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkSchema() {
  console.log('🔍 Checking products table columns...\n')

  // Try to select images, videos, category columns
  const { data, error } = await admin
    .from('products')
    .select('id, name, images, videos, category')
    .limit(3)

  if (error) {
    console.log('❌ Column check failed:', error.message)
    console.log('\n⚠️  The columns images, videos, and/or category are MISSING from the products table.')
    console.log('   You MUST run the following SQL in Supabase dashboard:')
    console.log('   https://supabase.com/dashboard/project/hazarlzuzgvxdketftao/sql/new\n')
    console.log('   -- Paste this SQL and click Run:')
    console.log('   ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;')
    console.log("   ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';")
    console.log("   ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';")
    console.log("   ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Premium';")
    return
  }

  console.log('✅ Columns images, videos, category exist in products table!')
  console.log('   Sample data:', JSON.stringify(data?.slice(0, 2), null, 2))

  // Also check order_items
  console.log('\n🔍 Checking order_items.product_id nullability...')
  const { data: oi, error: oiErr } = await admin
    .from('order_items')
    .insert({ order_id: '00000000-0000-0000-0000-000000000000', product_id: null, product_name: 'test', product_image: '', price: 0, quantity: 1 })
    .select()

  if (oiErr?.message?.includes('not-null')) {
    console.log('❌ order_items.product_id is still NOT NULL')
    console.log('   Run: ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;')
  } else if (oiErr?.message?.includes('foreign key') || oiErr?.message?.includes('violates')) {
    // This is the FK error on the order_id, which means product_id IS nullable (good!)
    console.log('✅ order_items.product_id is NULLABLE (null values allowed)')
    // Clean up
    await admin.from('order_items').delete().eq('product_name', 'test')
  } else if (oiErr) {
    console.log('⚠️  Unexpected error checking order_items:', oiErr.message)
  }
}

checkSchema().catch(console.error)
