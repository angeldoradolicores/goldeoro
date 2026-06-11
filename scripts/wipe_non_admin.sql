-- Wipe non-admin data: products, categories, promotions, and profiles except admin
-- WARNING: This will permanently DELETE data. Run only if you intend to remove everything except the admin profile.

-- Remove all product-related data
DELETE FROM product_images;
DELETE FROM product_videos;
DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM favorites;
DELETE FROM products;

-- Remove promotions and categories
DELETE FROM promotions;
DELETE FROM categories;

-- Remove profiles that are not admin (profiles.id references auth.users)
-- Keep any profile with is_admin = TRUE
DELETE FROM profiles WHERE is_admin IS DISTINCT FROM TRUE;

-- If you also want to remove auth.users entries (careful!), enable the next block
-- DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM profiles WHERE is_admin = TRUE);

-- Note: Run this script in Supabase SQL Editor or via psql connected to your database.