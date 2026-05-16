-- Run this in Supabase SQL Editor (https://supabase.com -> project -> SQL Editor)

-- ============================================================
-- PROFILES (extends auth.users with role)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT '/ kg',
  image TEXT NOT NULL DEFAULT '/images/hero-varenyky.jpg',
  badge TEXT,
  category TEXT NOT NULL CHECK (category IN ('varenyky', 'syrnyky', 'pelmeni')),
  available BOOLEAN DEFAULT true,
  stock INT DEFAULT 10,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (available = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add stock column to existing table:
-- ALTER TABLE products ADD COLUMN stock INT DEFAULT 10;

-- Seed products
INSERT INTO products (name, description, price, unit, image, badge, category, stock, sort_order) VALUES
  ('Varenyky with potato', 'Classic Ukrainian varenyky with creamy mashed potato', 12, '/ kg', '/images/hero-varenyky.jpg', 'Traditional', 'varenyky', 10, 1),
  ('Varenyky with cabbage', 'Hearty varenyky with savoury braised cabbage', 12, '/ kg', '/images/hero-varenyky.jpg', null, 'varenyky', 10, 2),
  ('Varenyky with mushroom', 'Rich varenyky with wild forest mushroom filling', 12, '/ kg', '/images/hero-varenyky.jpg', null, 'varenyky', 10, 3),
  ('Varenyky with cheese & cherries', 'Sweet varenyky filled with cottage cheese and cherries', 13, '/ kg', '/images/hero-varenyky.jpg', 'Seasonal', 'varenyky', 10, 4),
  ('Varenyky with cheese & spinach', 'Savory varenyky with cottage cheese and fresh spinach', 13, '/ kg', '/images/hero-varenyky.jpg', null, 'varenyky', 10, 5),
  ('Syrnyky', 'Traditional Ukrainian cheese fritters, golden and fluffy', 10, '/ 600g', '/images/syrnyky.png', 'Chef''s Choice', 'syrnyky', 10, 6),
  ('Syrnyky with chocolate', 'Decadent syrnyky with rich chocolate chunks', 11, '/ 600g', '/images/syrnyky.png', null, 'syrnyky', 10, 7),
  ('Syrnyky with blueberries', 'Fluffy syrnyky bursting with wild blueberries', 11, '/ 600g', '/images/syrnyky.png', null, 'syrnyky', 10, 8),
  ('Pelmeni (beef & pork)', 'Hearty Ukrainian dumplings with seasoned beef and pork filling', 15, '/ kg', '/images/pelmeni.png', 'Bestseller', 'pelmeni', 10, 9),
  ('Pelmeni (chicken & turkey)', 'Light and tender pelmeni with poultry filling', 15, '/ kg', '/images/pelmeni.png', null, 'pelmeni', 10, 10);

-- ============================================================
-- ORDERS (extended)
-- ============================================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category);

-- ============================================================
-- SETTINGS (key-value store for config)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can upsert settings"
  ON settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Default delivery settings
INSERT INTO settings (key, value) VALUES ('delivery', '{"min_order": 10, "free_threshold": 50, "fee": 5}')
ON CONFLICT (key) DO NOTHING;
