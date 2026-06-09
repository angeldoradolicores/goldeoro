-- =====================================================
-- PATCH: Make order_items.product_id nullable
-- Fixes 500 error when placing orders with demo products
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Make product_id nullable in order_items
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- =====================================================
-- PATCH: Add missing columns to products table
-- The admin panel uses images[], videos[], and category text directly
-- =====================================================

-- 2. Add images array column (if not present)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 3. Add videos array column (if not present)
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- 4. Add category text column (if not present)
-- (The original schema uses category_id FK, but the admin panel uses 'category' as text)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Premium';

-- 5. Update existing products to populate 'category' from the categories join (optional)
UPDATE products p
SET category = c.name
FROM categories c
WHERE p.category_id = c.id
  AND p.category IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check products columns:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;
-- Check order_items nullable:
-- SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_id';
