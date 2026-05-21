-- Fix RLS infinite recursion for "profiles" table
-- The is_admin() function already exists with SECURITY DEFINER (bypasses RLS)
-- but policies were using a raw subquery that triggered recursion
-- Safe to run multiple times

-- PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can view available products" ON products;
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (available = true OR is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can update any order" ON orders;
CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  USING (is_admin());

-- SETTINGS
DROP POLICY IF EXISTS "Admins can read all settings" ON settings;
CREATE POLICY "Admins can read all settings"
  ON settings FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can upsert settings" ON settings;
CREATE POLICY "Admins can upsert settings"
  ON settings FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update settings" ON settings;
CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  USING (is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "Admins can delete any review" ON reviews;
CREATE POLICY "Admins can delete any review"
  ON reviews FOR DELETE
  USING (is_admin());

-- STOCK HISTORY
DROP POLICY IF EXISTS "Admins can view stock history" ON stock_history;
CREATE POLICY "Admins can view stock history"
  ON stock_history FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert stock history" ON stock_history;
CREATE POLICY "Admins can insert stock history"
  ON stock_history FOR INSERT
  WITH CHECK (is_admin());

-- PROMO CODES
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (is_admin());

-- ORDER PAYMENTS
DROP POLICY IF EXISTS "Users can view own order payments" ON order_payments;
CREATE POLICY "Users can view own order payments"
  ON order_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_payments.order_id
      AND orders.user_id = auth.uid()
    )
    OR is_admin()
  );
