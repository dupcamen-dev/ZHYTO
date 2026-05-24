# Deployment Guide

## Overview

The site runs on **Vercel** (production: `https://zhyto.london`).  
Backed by **Supabase** (database, auth, storage) and **Stripe** (payments).

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note the **Project URL** and **anon key** from Settings → API
3. Save the **Service Role Key** (Settings → API → `service_role` key)

### Apply Schema

```sql
-- In Supabase SQL Editor, run the full schema:
\i supabase-schema.sql
```

Or copy-paste `supabase-schema.sql` into the SQL Editor and run.

### Auth Configuration

1. **Authentication → Settings → Site URL**: set to your Vercel domain
2. **Authentication → Providers → Google**: enable, configure OAuth client ID/secret from Google Cloud Console
3. **Authentication → Settings → Redirect URLs**: add `https://your-domain.vercel.app/**`

### Storage

1. **Storage → New bucket**: `product-images` (public)
2. Enable RLS on the bucket or set it to public access for product images

---

## 2. Stripe Setup

### Create Products & Prices (optional)

Products are managed in the admin panel, not in Stripe Dashboard. Stripe is only used for payment intents.

### Webhook

1. [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**: `https://your-domain.vercel.app/api/webhooks/stripe`
3. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the **Signing secret** (`whsec_...`)

### API Keys

- **Publishable key** (`pk_live_...`) — from Stripe Dashboard
- **Secret key** (`sk_live_...`) — from Stripe Dashboard

---

## 3. Vercel Deployment

### Prerequisites

- GitHub repo connected to Vercel
- All env vars ready (see below)

### Environment Variables

Set in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | From Supabase Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service_role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |
| `UPSTASH_REDIS_REST_URL` | `https://xxxx.upstash.io` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | `...` | Upstash Redis token |
| `ALLOWED_ORIGINS` | `https://your-domain.vercel.app` | CORS allowed origins |
| `NEXT_PUBLIC_BASE_PATH` | *(leave empty)* | Only for development |
| `RESEND_API_KEY` | *(optional)* | Email API key |

### Deploy

1. Push to `main` branch → Vercel auto-deploys
2. Or manual: Vercel Dashboard → Deploy → Import Git Repo

### Domain

Configure custom domain in Vercel Dashboard → Project → Domains.  
Update Supabase Auth redirect URLs and Stripe webhook URL to match.

---

## 4. Post-Deployment Checks

### Verify

- [ ] Home page loads without errors
- [ ] Products display from database
- [ ] Google Auth sign-in works
- [ ] Add to cart → Cart drawer shows items
- [ ] Checkout → Stripe payment form loads
- [ ] Admin panel accessible (login with admin account)
- [ ] Test Stripe webhook: `https://dashboard.stripe.com/webhooks` → "Send test webhook"

### Set Admin Role

After first login, promote user to admin in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

The user's UUID is in `auth.users` table (Supabase → Authentication → Users).

### Seed Settings (if empty)

```sql
INSERT INTO settings (key, value) VALUES
  ('delivery', '{"min_order": 10, "free_threshold": 50, "fee": 5}'),
  ('categories', '["varenyky", "syrnyky", "pelmeni"]'),
  ('categories_desc', '{"varenyky": "", "syrnyky": "", "pelmeni": ""}'),
  ('promo_codes', '[]')
ON CONFLICT (key) DO NOTHING;
```

---

## 5. Maintenance

### Database Migrations

For schema changes:
1. Write SQL migration file (e.g. `sql/001-add-column.sql`)
2. Run in Supabase SQL Editor
3. Update `supabase-schema.sql` to reflect the change

### Monitoring

- **Vercel**: Dashboard → Project → Analytics
- **Supabase**: Dashboard → Project → Database → Query performance
- **Stripe**: Dashboard → Payments → Events

### Rollbacks

Vercel instant rollback: Deployment → ⋮ → Promote to Production.

---

## 6. Local Development (for reference)

```bash
# Install
npm install

# Run
npm run dev          # http://localhost:3000

# Build
npm run build        # Verify production build locally

# Lint
npm run lint
```

For local Supabase, use `supabase start` (CLI) or point to the production Supabase instance via `.env.local` (not committed). Note that local development with production Supabase will use real data — use caution.
