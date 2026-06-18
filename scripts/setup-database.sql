-- Luxury Hats E-commerce Database Schema
-- Run this script in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price integer not null,
  original_price integer,
  category text not null default 'Urban',
  stock integer not null default 0,
  featured boolean default false,
  is_promotion boolean default false,
  images text[] default '{}',
  videos text[] default '{}',
  colors text[] default '{"Negro"}',
  sizes text[] default '{"M"}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies for products
create policy "Products are viewable by everyone" on public.products
  for select using (true);

create policy "Only admins can insert products" on public.products
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can update products" on public.products
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can delete products" on public.products
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- ORDERS TABLE
-- ============================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  total integer not null,
  subtotal integer not null,
  shipping_cost integer default 0,
  payment_method text,
  payment_id text,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_email text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text,
  shipping_country text default 'Colombia',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies for orders
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Users can insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Only admins can update orders" on public.orders
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null,
  price integer not null,
  color text,
  size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.order_items enable row level security;

-- Policies for order_items
create policy "Users can view their order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and (orders.user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
    )
  );

create policy "Users can insert order items" on public.order_items
  for insert with check (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists handle_updated_at on public.profiles;
create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at on public.products;
create trigger handle_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at on public.orders;
create trigger handle_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- SEED DATA: Insert sample products
-- ============================================
insert into public.products (name, slug, description, price, original_price, category, stock, featured, is_promotion, images, colors, sizes) values
('Gol de Oro Elite Black', 'gol-de-oro-elite-black', 'Gorra premium de edicion limitada con bordado en oro de 24k. Confeccionada en algodon egipcio de la mas alta calidad con acabados de lujo. El diseno exclusivo representa la esencia del streetwear colombiano.', 289000, 350000, 'Premium', 15, true, true, ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=80'], ARRAY['Negro', 'Dorado', 'Blanco'], ARRAY['S', 'M', 'L', 'XL']),
('Urban Legend Medellin', 'urban-legend-medellin', 'Diseno urbano exclusivo inspirado en las calles de Medellin. Detalles reflectivos y cierre ajustable de metal cromado. Perfecta para el streetwear de alto nivel con estilo paisa.', 199000, null, 'Urban', 25, true, false, ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80', 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80'], ARRAY['Gris', 'Negro', 'Azul'], ARRAY['M', 'L', 'XL']),
('Street King Gold', 'street-king-gold', 'La corona de las calles. Gorra snapback con visera plana y bordado 3D en hilo metalico. Material premium resistente al agua con acabado mate exclusivo.', 245000, 299000, 'Snapback', 18, true, true, ARRAY['https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80'], ARRAY['Negro', 'Rojo', 'Verde'], ARRAY['S', 'M', 'L']),
('Midnight Luxe Velvet', 'midnight-luxe-velvet', 'Elegancia nocturna en cada detalle. Terciopelo italiano importado con broche magnetico exclusivo. Diseno inspirado en la vida nocturna de Bogota.', 325000, null, 'Premium', 10, false, false, ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80', 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=800&q=80'], ARRAY['Azul Noche', 'Borgona', 'Negro'], ARRAY['M', 'L']),
('Classic Gold Rose', 'classic-gold-rose', 'El clasico reinventado con toques modernos. Gorra estructurada con logo metalico en oro rosa de 18k. Ajuste ergonomico y transpirable.', 275000, null, 'Classic', 30, true, false, ARRAY['https://images.unsplash.com/photo-1620231150904-a86b9802656a?w=800&q=80', 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=800&q=80'], ARRAY['Beige', 'Negro', 'Blanco'], ARRAY['S', 'M', 'L', 'XL']),
('Rebel Sport Carbon', 'rebel-sport-carbon', 'Para los que desafian las reglas. Gorra deportiva con tecnologia de ventilacion avanzada y ajuste ergonomico. Fibra de carbono real en la visera.', 185000, 220000, 'Sport', 40, false, true, ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=80'], ARRAY['Negro', 'Blanco', 'Rojo'], ARRAY['M', 'L', 'XL']),
('Graffiti Artist Edition', 'graffiti-artist-edition', 'Edicion limitada colaboracion con artistas urbanos de Comuna 13. Cada gorra es unica con arte de graffiti pintado a mano. Certificado de autenticidad incluido.', 399000, null, 'Limited Edition', 8, true, false, ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80', 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80'], ARRAY['Multicolor'], ARRAY['Unica']),
('Neon Streets', 'neon-streets', 'Inspirada en las luces de neon de la vida nocturna colombiana. Detalles que brillan en la oscuridad y costuras reflectivas. El statement piece definitivo.', 259000, 310000, 'Urban', 22, true, true, ARRAY['https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80'], ARRAY['Rosa Neon', 'Verde Neon', 'Azul Neon'], ARRAY['S', 'M', 'L'])
on conflict (slug) do nothing;

-- ============================================
-- ADMIN USER SETUP (run after creating your account)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- ============================================
-- update public.profiles set is_admin = true where email = 'your-admin@email.com';
