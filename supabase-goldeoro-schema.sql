-- =====================================================
-- GOL DE ORO - SUPABASE DATABASE SCHEMA
-- Ejecutar este script en el SQL Editor de Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Product type enum to support multiple kinds of items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('camiseta','gorra','album','sobre','caja','coleccionable');
  END IF;
END$$;

-- Order status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');
  END IF;
END$$;

-- Discount type
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
  END IF;
END$$;

-- =====================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- PRODUCTS TABLE (extended to support camisetas, albumes, sobres, cajas, coleccionables)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- Price in COP cents
  original_price INTEGER, -- For promotions
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  -- New fields for multi-product support
  product_type product_type DEFAULT 'gorra',
  team TEXT,
  season TEXT,
  player TEXT,
  jersey_type TEXT,
  -- Panini / coleccionable specific
  collection_type TEXT,
  edition TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_promotion ON products(is_promotion);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify product images"
  ON product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- PRODUCT VIDEOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_videos_product ON product_videos(product_id);

ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product videos are viewable by everyone"
  ON product_videos FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify product videos"
  ON product_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- ADDRESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Colombia',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  status order_status DEFAULT 'pending',
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  shipping_method TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  wompi_transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR guest_email IS NOT NULL);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can modify orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  color TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items viewable by order owner"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.guest_email IS NOT NULL)
    )
  );

CREATE POLICY "Order items insertable with order"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_color TEXT DEFAULT '',
  selected_size TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_color, selected_size)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PROMOTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value INTEGER NOT NULL,
  min_purchase INTEGER,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active promotions viewable by everyone"
  ON promotions FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage promotions"
  ON promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- CHATBOT KNOWLEDGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_category ON chatbot_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_active ON chatbot_knowledge(active);

ALTER TABLE chatbot_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chatbot knowledge viewable by everyone"
  ON chatbot_knowledge FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage chatbot knowledge"
  ON chatbot_knowledge FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate order number (compatible)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORAGE BUCKETS (ejecutar en panel de Supabase Storage)
-- =====================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default categories (GOL DE ORO)
INSERT INTO categories (name, slug, description) VALUES
  ('Camisetas', 'camisetas', 'Camisetas de selecciones y clubes, versiones local y visitante'),
  ('Gorras', 'gorras', 'Gorras oficiales y coleccionables'),
  ('Álbumes', 'albumes', 'Álbumes Panini edición Mundial 2026'),
  ('Sobres', 'sobres', 'Sobres individuales y packs de estampas'),
  ('Cajas', 'cajas', 'Cajas y boxes coleccionista'),
  ('Coleccionables', 'coleccionables', 'Stickers, pins, llaveros y artículos de colección')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products (preservando algunos productos antiguos para compatibilidad)
INSERT INTO products (name, slug, description, price, original_price, category_id, brand, colors, sizes, stock, featured, is_promotion, is_new, rating, review_count, product_type, team, season, player, jersey_type)
VALUES
  (
    'Camiseta Selección Colombia Local 2026',
    'camiseta-colombia-local-2026',
    'Camiseta oficial Selección Colombia - Local 2026, telar técnico y tejido transpirable.',
    199000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'camisetas'),
    'Gol de Oro',
    ARRAY['Amarillo', 'Azul', 'Rojo'],
    ARRAY['S','M','L','XL','XXL'],
    120,
    TRUE,
    FALSE,
    TRUE,
    4.8,
    32,
    'camiseta',
    'Colombia',
    '2026',
    NULL,
    'Local'
  ),
  (
    'Gorra Gol de Oro Retro',
    'gorra-gol-de-oro-retro',
    'Gorra retro con bordados y detalles premium. Edición especial Mundial 2026.',
    89000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'gorras'),
    'Gol de Oro',
    ARRAY['Negro','Dorado'],
    ARRAY['S','M','L'],
    50,
    TRUE,
    FALSE,
    TRUE,
    4.7,
    18,
    'gorra',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Álbum Mundial 2026 - Tapa Dura',
    'album-mundial-2026-tapa-dura',
    'Álbum Panini Oficial Mundial 2026, edición tapa dura, 144 páginas para tus estampas.',
    129000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'albumes'),
    'Panini',
    ARRAY['Multicolor'],
    ARRAY[]::TEXT[],
    80,
    TRUE,
    FALSE,
    TRUE,
    4.9,
    5,
    'album',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Pack de 5 Sobres Panini',
    'pack-5-sobres-panini',
    'Pack de 5 sobres aleatorios - ideal para coleccionistas y regalos.',
    45000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'sobres'),
    'Panini',
    ARRAY['Multicolor'],
    ARRAY[]::TEXT[],
    200,
    FALSE,
    FALSE,
    TRUE,
    4.5,
    12,
    'sobre',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Box Coleccionista Gol de Oro',
    'box-coleccionista-gol-de-oro',
    'Caja especial con sobres, stickers y artículos exclusivos de la colección Mundial 2026.',
    349000,
    399000,
    (SELECT id FROM categories WHERE slug = 'cajas'),
    'Gol de Oro',
    ARRAY['Negro','Dorado'],
    ARRAY[]::TEXT[],
    30,
    TRUE,
    TRUE,
    TRUE,
    4.9,
    4,
    'caja',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Sticker Selección Colombia - James Rodríguez',
    'sticker-james-rodriguez',
    'Sticker coleccionable de James Rodríguez - Serie limitada Mundial 2026.',
    1200,
    NULL,
    (SELECT id FROM categories WHERE slug = 'coleccionables'),
    'Panini',
    ARRAY['Multicolor'],
    ARRAY[]::TEXT[],
    1000,
    FALSE,
    FALSE,
    TRUE,
    5.0,
    2,
    'coleccionable',
    'Colombia',
    '2026',
    'James Rodríguez',
    NULL
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert product images (sample)
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order)
SELECT 
  id,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  name,
  TRUE,
  0
FROM products
ON CONFLICT DO NOTHING;

-- Insert chatbot knowledge (Spanish)
INSERT INTO chatbot_knowledge (category, question, answer, keywords) VALUES
  ('envios', 'Como funcionan los envios?', 'Ofrecemos envio a todo Colombia. Los tiempos de entrega son: InterRapidisimo (2-3 dias), Envia Standard (3-5 dias), y Envia Express (1-2 dias). El envio es gratis en compras mayores a $200.000.', ARRAY['envio','envios','delivery','entrega','tiempo']),
  ('devoluciones', 'Cual es la politica de devoluciones?', 'Tienes 30 dias para devolver tu producto en perfectas condiciones. El proceso es simple: contactanos, te enviamos una guia de devolucion, y una vez recibamos el producto, procesamos tu reembolso en 5-7 dias habiles.', ARRAY['devolucion','devoluciones','reembolso','cambio','garantia']),
  ('pagos', 'Que metodos de pago aceptan?', 'Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express), PSE, Nequi, Daviplata. Los pagos se procesan via Wompi.', ARRAY['pago','pagos','tarjeta','nequi','daviplata','pse']),
  ('tallas', 'Como elijo mi talla?', 'Las camisetas presentan tallas S-M-L-XL-XXL. Consulta la guia de tallas en cada producto.', ARRAY['talla','tallas','medida','tamano','ajuste']),
  ('contacto', 'Como puedo contactarlos?', 'Puedes contactarnos por WhatsApp al +57 300 123 4567, por email a soporte@goldeoro.co, o a traves de nuestras redes sociales @goldeoro. Nuestro horario de atencion es de Lunes a Sabado de 8am a 6pm.', ARRAY['contacto','telefono','whatsapp','email','ayuda'])
ON CONFLICT DO NOTHING;

-- Insert sample promotions
INSERT INTO promotions (code, description, discount_type, discount_value, min_purchase, active) VALUES
  ('GOLBIENVENIDO', '10% de descuento para nuevos usuarios', 'percentage', 10, 50000, TRUE),
  ('ENVIOGRATIS', 'Envio gratis en compras mayores a $200.000', 'fixed', 15000, 200000, TRUE)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- IMPORTANT: Set your admin user
-- After creating your account, run this to make yourself admin:
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'tu-email@example.com';
-- =====================================================
