# zhyto.london — Frozen Ukrainian Food E-commerce

Full-featured e-commerce site for frozen Ukrainian dumplings (varenyky, syrnyky, pelmeni). Built with Next.js 16, Supabase, and Stripe.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Animations | framer-motion 12 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google OAuth) |
| Payments | Stripe (cards, Apple Pay, Google Pay, PayPal) |
| Rate Limiting | Upstash Redis |
| Storage | Supabase Storage (product images) |
| Deployment | Vercel |

## Environment Variables

All vars are configured in the Vercel dashboard. No `.env.local` file in the project.

### Public (prefix `NEXT_PUBLIC_`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (RLS-enforced) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_BASE_PATH` | Base path for images (empty in prod) |

### Server-only (never exposed to client)

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin bypass RLS) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `RESEND_API_KEY` | Resend API key (email — optional, not wired) |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

**Note:** The app requires all environment variables above. Without Supabase/Stripe credentials it will throw on startup. If you only want to test the UI, mock the Supabase client or use a local Supabase instance.

### Lint

```bash
npm run lint
```

## Project Structure

```
app/
  page.tsx                     ← Home page (composes all sections)
  layout.tsx                   ← Root layout (providers: Auth, Cart, Language, Theme)
  account/page.tsx             ← User account page
  admin/                       ← Admin panel (products, orders, reviews, settings, stats)
  privacy/page.tsx             ← Privacy policy (static)
  terms/page.tsx               ← Terms of service (static)
  api/                         ← API routes (see API.md)

components/
  sections/                    ← Page section components (extracted from page.tsx)
    Header.tsx                 ← Nav bar + mobile menu
    HeroSection.tsx            ← Landing hero with parallax
    ProductsSection.tsx        ← Product grid + modal
    AboutSection.tsx           ← About us + image carousel
    DeliverySection.tsx        ← Delivery info
    ReviewsSection.tsx         ← Reviews + form + FloatingVarenyky
    FAQSection.tsx             ← FAQ accordion
    ContactSection.tsx         ← Contact info + social links
    Footer.tsx                 ← Site footer
    SignInModal.tsx            ← Google OAuth modal
    ScrollButtons.tsx          ← Scroll to top/bottom
  cart-context.tsx             ← Cart state (context + localStorage)
  auth-context.tsx             ← Auth state (context + Supabase)
  language-context.tsx         ← i18n (EN/UK toggle, context + localStorage)
  checkout-modal.tsx           ← Checkout flow (address, payment)
  cart-drawer.tsx              ← Slide-out cart
  theme-provider.tsx           ← next-themes wrapper
  image-carousel.tsx           ← Reusable carousel
  image-compare.tsx            ← Before/after image slider

lib/
  supabase.ts                  ← Supabase anon client (proxied singleton)
  stripe.ts                    ← Stripe client
  constants.ts                 ← Constants + img() helper
  use-delivery.ts              ← useDeliverySettings hook + calcDelivery
  services/                    ← Business logic (products, orders, reviews, payments)
  middleware/                   ← Auth, admin, CSRF middleware
  validations/                  ← Zod schemas
  utils/                       ← Supabase admin client, error handling, rate limiter

supabase-schema.sql            ← Full DB schema (migration-ready)
```

## Architecture Overview

### Data Flow

```
Browser → React Component → fetch('/api/...') → API Route → Service Layer → Supabase Admin
                                                                              ↕
                                                                         Database + RLS
```

- **Client components** never call `supabase.from()` directly
- All DB reads go through **API routes** → **service layer** (in `lib/services/`)
- API routes use **`getSupabaseAdmin()`** (service role) internally
- RLS policies protect direct table access if someone gets the anon key

### Key Decisions

- **"use client" for page.tsx**: framer-motion scroll hooks and context providers require client-side rendering
- **Server-side data fetching via API routes**: all pages fetch via `fetch('/api/...')` at mount, not directly from Supabase
- **Cart persists in localStorage**: survives page refresh, synced with stock limits on load
- **Delivery address persists in localStorage**: key `zhyto-address`
- **Stock decremented on order creation**: PENDING status immediately reduces stock; cancel restores it
