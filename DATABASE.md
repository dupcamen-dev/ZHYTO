# Database Schema

Powered by **Supabase** (PostgreSQL). Full DDL in `supabase-schema.sql`.

---

## Tables

### `profiles`

Links Supabase Auth users to application roles.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `role` | `TEXT` | NOT NULL, DEFAULT `'user'`, CHECK: `'user'` or `'admin'` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

Created automatically by `handle_new_user()` trigger on auth signup.

### `products`

Product catalog.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `SERIAL` | PK |
| `name` | `TEXT` | NOT NULL |
| `description` | `TEXT` | NOT NULL |
| `price` | `DECIMAL(10,2)` | NOT NULL |
| `unit` | `TEXT` | DEFAULT `'/ kg'` |
| `image` | `TEXT` | DEFAULT placeholder |
| `background_image` | `TEXT` | nullable (for image-comparison slider) |
| `badge` | `TEXT` | nullable (e.g. "Bestseller", "New") |
| `category` | `TEXT` | NOT NULL, CHECK: `'varenyky'`, `'syrnyky'`, `'pelmeni'` |
| `available` | `BOOLEAN` | DEFAULT `true` |
| `stock` | `INT` | DEFAULT 10 |
| `sort_order` | `INT` | DEFAULT 0 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` (auto-updated by trigger) |

### `orders`

Customer orders.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` |
| `items` | `JSONB` | NOT NULL. Array of `{ product_id, name, price, qty, image }` |
| `total` | `DECIMAL(10,2)` | NOT NULL |
| `delivery_fee` | `DECIMAL(10,2)` | DEFAULT 0 |
| `status` | `TEXT` | DEFAULT `'pending'`, CHECK: `pending`/`confirmed`/`completed`/`cancelled` |
| `customer_name` | `TEXT` | NOT NULL |
| `customer_email` | `TEXT` | NOT NULL |
| `customer_phone` | `TEXT` | nullable |
| `delivery_address` | `TEXT` | NOT NULL |
| `notes` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

### `reviews`

Product reviews from customers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `SERIAL` | PK |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)`, UNIQUE (one review per user) |
| `user_name` | `TEXT` | NOT NULL |
| `rating` | `INT` | NOT NULL, CHECK: 1–5 |
| `comment` | `TEXT` | NOT NULL |
| `approved` | `BOOLEAN` | DEFAULT `true` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

### `settings`

Key-value store for app configuration.

| Column | Type | Notes |
|--------|------|-------|
| `key` | `TEXT` | PK |
| `value` | `JSONB` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

**Known keys:**

| Key | Value Shape | Description |
|-----|-------------|-------------|
| `delivery` | `{ min_order, free_threshold, fee }` | Delivery pricing rules |
| `categories` | `string[]` | Ordered list of category keys |
| `categories_desc` | `Record<string, string>` | Per-category descriptions |
| `promo_codes` | `{ code, type, value }[]` | Promo codes (type: `percentage` or `free_delivery`) |

### `stock_history`

Audit log for stock changes.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `SERIAL` | PK |
| `product_id` | `INT` | FK → `products(id)` ON DELETE CASCADE |
| `change` | `INT` | NOT NULL (positive or negative) |
| `reason` | `TEXT` | nullable |
| `admin_id` | `UUID` | FK → `auth.users(id)` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |

### `order_payments`

Stripe payment tracking.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `SERIAL` | PK |
| `order_id` | `UUID` | FK → `orders(id)` ON DELETE CASCADE |
| `stripe_payment_intent_id` | `TEXT` | UNIQUE, NOT NULL |
| `amount` | `DECIMAL(10,2)` | NOT NULL |
| `status` | `TEXT` | DEFAULT `'pending'`, CHECK: `pending`/`succeeded`/`failed`/`refunded` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` (auto-updated by trigger) |

### `promo_codes` (deprecated)

Legacy table. Use `settings(key='promo_codes')` instead. Still exists in schema for backward compatibility.

---

## Row Level Security (RLS)

All tables have RLS enabled. Key design principle:

> **Client (anon key)**: RLS policies determine what each user can see/do.
> **API routes (service role)**: Bypass RLS entirely.

### `is_admin()` Function

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
```

SECURITY DEFINER ensures no recursion when called from RLS policies on `profiles`.

### Key Policies

| Table | Policy | Effect |
|-------|--------|--------|
| `profiles` | Users can view own | `SELECT` own row only |
| `profiles` | Admins can view all | `SELECT` any row (`is_admin()`) |
| `products` | Anyone can view available | `SELECT` where `available = true` (or admin sees all) |
| `products` | Admins can CRUD | `INSERT`/`UPDATE`/`DELETE` via `is_admin()` |
| `orders` | Users can view own | `SELECT` where `user_id = auth.uid()` |
| `orders` | Admins can view all | `is_admin()` |
| `orders` | Users can insert own | `INSERT` where `user_id = auth.uid()` |
| `settings` | Public can read non-sensitive | `SELECT` keys `delivery`, `categories`, `categories_desc`, `promo_codes` |
| `settings` | Admins can read/write all | `is_admin()` |
| `reviews` | Anyone can view approved | `SELECT` where `approved = true` |
| `reviews` | Auth users can insert | `INSERT` with their `user_id` |
| `order_payments` | Users can view own | Via subquery on `orders` |
| `stock_history` | Admins only | `is_admin()` |

---

## Functions & Triggers

### `handle_new_user()`

Trigger: `AFTER INSERT ON auth.users`  
Creates a `profiles` row with `role = 'user'` for every new auth signup.

### `update_updated_at_column()`

Trigger: `BEFORE UPDATE ON products`, `BEFORE UPDATE ON order_payments`  
Sets `updated_at = NOW()` before the update.

---

## Indexes

Performance indexes on: `orders(user_id)`, `orders(created_at)`, `orders(status)`, `products(category)`, `reviews(created_at)`, `reviews(approved)`, `order_payments(order_id)`, `order_payments(stripe_payment_intent_id)`, `stock_history(product_id)`, `stock_history(created_at)`, `promo_codes(code)`, `promo_codes(active)`.
