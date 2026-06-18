-- =====================================================
-- LUXURY HATS - SUPABASE DATABASE SCHEMA
-- Ejecutar este script en el SQL Editor de Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create index for admin lookup
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- RLS for profiles
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

-- RLS for categories
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
-- PRODUCTS TABLE
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_promotion ON products(is_promotion);

-- RLS for products
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

-- RLS for product_images
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

-- RLS for product_videos
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

-- RLS for addresses
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
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

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

-- RLS for orders
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

-- RLS for order_items
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
-- PROMOTIONS TABLE
-- =====================================================
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

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

-- RLS for promotions
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

-- RLS for chatbot_knowledge
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

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Run these in the Supabase dashboard under Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Snapback', 'snapback', 'Gorras con cierre ajustable snapback'),
  ('Fitted', 'fitted', 'Gorras de talla fija premium'),
  ('Dad Hat', 'dad-hat', 'Gorras estilo clasico relajado'),
  ('Trucker', 'trucker', 'Gorras con malla transpirable'),
  ('Premium', 'premium', 'Coleccion exclusiva de lujo')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, price, original_price, category_id, brand, colors, sizes, stock, featured, is_promotion, is_new, rating, review_count) VALUES
  (
    'Gol de Oro Elite Black',
    'gol-de-oro-elite-black',
    'Gorra premium de edicion limitada con bordado en oro de 24k. Confeccionada en algodon egipcio de la mas alta calidad con acabados de lujo.',
    289000,
    350000,
    (SELECT id FROM categories WHERE slug = 'premium'),
    'Luxury Hats',
    ARRAY['Negro', 'Dorado', 'Blanco'],
    ARRAY['S', 'M', 'L', 'XL'],
    15,
    TRUE,
    TRUE,
    TRUE,
    4.9,
    128
  ),
  (
    'Urban Legend',
    'urban-legend',
    'Diseno urbano exclusivo con detalles reflectivos y cierre ajustable de metal. Perfecta para el streetwear de alto nivel.',
    199000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'snapback'),
    'Luxury Hats',
    ARRAY['Gris', 'Negro', 'Azul'],
    ARRAY['M', 'L', 'XL'],
    25,
    TRUE,
    FALSE,
    FALSE,
    4.7,
    89
  ),
  (
    'Street King',
    'street-king',
    'La corona de las calles. Gorra snapback con visera plana y bordado 3D. Material premium resistente al agua.',
    245000,
    299000,
    (SELECT id FROM categories WHERE slug = 'snapback'),
    'Luxury Hats',
    ARRAY['Negro', 'Rojo', 'Verde'],
    ARRAY['S', 'M', 'L'],
    18,
    TRUE,
    TRUE,
    FALSE,
    4.8,
    156
  ),
  (
    'Midnight Luxe',
    'midnight-luxe',
    'Elegancia nocturna en cada detalle. Terciopelo italiano con broche magnetico exclusivo.',
    325000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'premium'),
    'Luxury Hats',
    ARRAY['Azul Noche', 'Borgona', 'Negro'],
    ARRAY['M', 'L'],
    10,
    FALSE,
    FALSE,
    TRUE,
    4.9,
    45
  ),
  (
    'Classic Gold',
    'classic-gold',
    'El clasico reinventado. Gorra estructurada con logo metalico en oro rosa.',
    275000,
    NULL,
    (SELECT id FROM categories WHERE slug = 'dad-hat'),
    'Luxury Hats',
    ARRAY['Beige', 'Negro', 'Blanco'],
    ARRAY['S', 'M', 'L', 'XL'],
    30,
    TRUE,
    FALSE,
    FALSE,
    4.6,
    234
  ),
  (
    'NY Yankees Premium Gold',
    'ny-yankees-premium-gold',
    'Gorra oficial de los New York Yankees en edicion limitada con detalles en oro. Fabricada con materiales premium.',
    299000,
    249000,
    (SELECT id FROM categories WHERE slug = 'fitted'),
    'New Era',
    ARRAY['Negro', 'Dorado'],
    ARRAY['7', '7 1/8', '7 1/4', '7 3/8', '7 1/2'],
    25,
    TRUE,
    TRUE,
    TRUE,
    4.9,
    178
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert product images
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order)
SELECT 
  id,
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
  name,
  TRUE,
  0
FROM products;

-- Insert chatbot knowledge
INSERT INTO chatbot_knowledge (category, question, answer, keywords) VALUES
  ('envios', 'Como funcionan los envios?', 'Ofrecemos envio a todo Colombia. Los tiempos de entrega son: InterRapidisimo (2-3 dias), Envia Standard (3-5 dias), y Envia Express (1-2 dias). El envio es gratis en compras mayores a $200.000.', ARRAY['envio', 'envios', 'delivery', 'entrega', 'tiempo']),
  ('devoluciones', 'Cual es la politica de devoluciones?', 'Tienes 30 dias para devolver tu producto en perfectas condiciones. El proceso es simple: contactanos, te enviamos una guia de devolucion, y una vez recibamos el producto, procesamos tu reembolso en 5-7 dias habiles.', ARRAY['devolucion', 'devoluciones', 'reembolso', 'cambio', 'garantia']),
  ('pagos', 'Que metodos de pago aceptan?', 'Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express), PSE, Nequi, Daviplata, y pago contra entrega en algunas ciudades principales.', ARRAY['pago', 'pagos', 'tarjeta', 'nequi', 'daviplata', 'pse']),
  ('productos', 'Que tipo de gorras venden?', 'Tenemos una amplia variedad de gorras: Snapback, Fitted, Dad Hat, y Trucker. Trabajamos con marcas como New Era, Mitchell & Ness, y nuestra marca propia Luxury Hats. Todas nuestras gorras son de la mas alta calidad.', ARRAY['gorras', 'productos', 'tipos', 'marcas', 'catalogo']),
  ('promociones', 'Tienen promociones activas?', 'Actualmente tenemos: 15% de descuento para nuevos usuarios con el codigo WELCOME15, y Flash Sales con hasta 50% de descuento en productos seleccionados. Visita nuestra seccion de promociones para mas detalles!', ARRAY['promocion', 'promociones', 'descuento', 'oferta', 'codigo']),
  ('tallas', 'Como elijo mi talla?', 'Nuestras gorras vienen en diferentes tallas: Las Fitted vienen en tallas numericas (7, 7 1/8, etc.), las Snapback y Dad Hat son ajustables. Te recomendamos medir tu cabeza (circunferencia) y consultar nuestra guia de tallas en cada producto.', ARRAY['talla', 'tallas', 'medida', 'tamano', 'ajuste']),
  ('contacto', 'Como puedo contactarlos?', 'Puedes contactarnos por WhatsApp al +57 300 123 4567, por email a info@luxuryhats.co, o a traves de nuestras redes sociales @luxuryhats. Nuestro horario de atencion es de Lunes a Sabado de 8am a 6pm.', ARRAY['contacto', 'telefono', 'whatsapp', 'email', 'ayuda'])
ON CONFLICT DO NOTHING;

-- Insert sample promotions
INSERT INTO promotions (code, description, discount_type, discount_value, min_purchase, active) VALUES
  ('WELCOME15', '15% de descuento para nuevos usuarios', 'percentage', 15, 100000, TRUE),
  ('LUXURY30', '30% de descuento en compras mayores a $300.000', 'percentage', 30, 300000, TRUE),
  ('ENVIOGRATIS', 'Envio gratis en tu primera compra', 'fixed', 15000, 0, TRUE)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- IMPORTANT: Set your admin user
-- After creating your account, run this to make yourself admin:
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
-- =====================================================
