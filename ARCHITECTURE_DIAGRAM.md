# 🏗️ Architecture Diagram

## Загальна архітектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  React   │  │  Stripe  │  │  Hooks   │  │   UI     │       │
│  │Components│  │ Elements │  │          │  │Components│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS (Vercel)                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    API ROUTES                           │    │
│  │                                                         │    │
│  │  /api/auth/*     /api/products/*    /api/orders/*     │    │
│  │  /api/reviews/*  /api/admin/*       /api/payments/*   │    │
│  │  /api/settings   /api/webhooks/stripe                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    MIDDLEWARE                           │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐        │    │
│  │  │   Auth   │  │  Admin   │  │ Rate Limit   │        │    │
│  │  └──────────┘  └──────────┘  └──────────────┘        │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                     SERVICES                            │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │   Auth   │  │ Products │  │  Orders  │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │ Payments │  │ Reviews  │  │  Email   │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    VALIDATION                           │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │   Zod    │  │  Schemas │  │  Types   │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                    │                        │
                    │                        │
                    ▼                        ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      SUPABASE            │    │        STRIPE            │
│                          │    │                          │
│  ┌────────────────────┐  │    │  ┌────────────────────┐ │
│  │   PostgreSQL       │  │    │  │  Payment Intents   │ │
│  │                    │  │    │  │                    │ │
│  │  • profiles        │  │    │  │  • Create          │ │
│  │  • products        │  │    │  │  • Confirm         │ │
│  │  • orders          │  │    │  │  • Webhooks        │ │
│  │  • reviews         │  │    │  └────────────────────┘ │
│  │  • settings        │  │    │                          │
│  │  • stock_history   │  │    │  ┌────────────────────┐ │
│  │  • promo_codes     │  │    │  │  Cards             │ │
│  │  • order_payments  │  │    │  │  • Test mode       │ │
│  └────────────────────┘  │    │  │  • Live mode       │ │
│                          │    │  └────────────────────┘ │
│  ┌────────────────────┐  │    └──────────────────────────┘
│  │   Auth             │  │
│  │                    │  │
│  │  • JWT tokens      │  │
│  │  • Sessions        │  │
│  │  • RLS policies    │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## Потік даних: Створення замовлення

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. POST /api/orders
     │    { items, customer_info }
     ▼
┌─────────────────┐
│  Auth           │
│  Middleware     │ ◄── Перевірка JWT token
└────┬────────────┘
     │
     │ 2. Validate with Zod
     ▼
┌─────────────────┐
│  Orders         │
│  Service        │
└────┬────────────┘
     │
     │ 3. Check stock
     ▼
┌─────────────────┐
│  Products       │
│  Service        │ ◄── Query Supabase
└────┬────────────┘
     │
     │ 4. Calculate total
     ▼
┌─────────────────┐
│  Orders         │
│  Service        │ ◄── Create order (status: pending)
└────┬────────────┘
     │
     │ 5. Create Payment Intent
     ▼
┌─────────────────┐
│  Payments       │
│  Service        │ ◄── Call Stripe API
└────┬────────────┘
     │
     │ 6. Return order + clientSecret
     ▼
┌─────────┐
│ Client  │ ◄── Show Stripe payment form
└────┬────┘
     │
     │ 7. User enters card
     │    Stripe processes payment
     ▼
┌─────────────────┐
│  Stripe         │
│  Webhook        │ ◄── payment_intent.succeeded
└────┬────────────┘
     │
     │ 8. POST /api/webhooks/stripe
     ▼
┌─────────────────┐
│  Webhook        │
│  Handler        │ ◄── Verify signature
└────┬────────────┘
     │
     │ 9. Update order status
     ▼
┌─────────────────┐
│  Orders         │
│  Service        │ ◄── status = 'confirmed'
└────┬────────────┘
     │
     │ 10. Update stock
     ▼
┌─────────────────┐
│  Products       │
│  Service        │ ◄── Decrease stock
└────┬────────────┘
     │
     │ 11. Send emails
     ▼
┌─────────────────┐
│  Email          │
│  Service        │ ◄── Customer + Admin
└─────────────────┘
```

---

## Структура бази даних

```
┌─────────────────────────────────────────────────────────────┐
│                         DATABASE                             │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   profiles   │         │  auth.users  │                 │
│  │              │◄────────│              │                 │
│  │ • id (FK)    │         │ • id (PK)    │                 │
│  │ • role       │         │ • email      │                 │
│  └──────────────┘         └──────────────┘                 │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   products   │         │    orders    │                 │
│  │              │         │              │                 │
│  │ • id (PK)    │◄────┐   │ • id (PK)    │                 │
│  │ • name       │     │   │ • user_id    │                 │
│  │ • price      │     │   │ • items      │                 │
│  │ • stock      │     │   │ • status     │                 │
│  └──────┬───────┘     │   └──────┬───────┘                 │
│         │             │          │                          │
│         │             │          │                          │
│  ┌──────▼───────┐    │   ┌──────▼───────┐                 │
│  │stock_history │    │   │order_payments│                 │
│  │              │    │   │              │                 │
│  │ • product_id │    │   │ • order_id   │                 │
│  │ • change     │    │   │ • stripe_id  │                 │
│  └──────────────┘    │   └──────────────┘                 │
│                      │                                      │
│  ┌──────────────┐   │                                      │
│  │   reviews    │   │                                      │
│  │              │   │                                      │
│  │ • id (PK)    │   │                                      │
│  │ • user_id    │   │                                      │
│  │ • rating     │   │                                      │
│  └──────────────┘   │                                      │
│                     │                                       │
│  ┌──────────────┐  │                                       │
│  │  settings    │  │                                       │
│  │              │  │                                       │
│  │ • key (PK)   │  │                                       │
│  │ • value      │  │                                       │
│  └──────────────┘  │                                       │
│                    │                                        │
│  ┌──────────────┐ │                                        │
│  │ promo_codes  │ │                                        │
│  │              │ │                                        │
│  │ • code       │ │                                        │
│  │ • discount   │ │                                        │
│  └──────────────┘ │                                        │
│                   │                                         │
│  items JSONB: [{product_id, name, price, quantity}]       │
│                   └─────────────────────────────────────┐  │
│                                                         │  │
└─────────────────────────────────────────────────────────┼──┘
                                                          │
                                                          │
                                    Зв'язок через JSONB  │
```

---

## Безпека: Row Level Security

```
┌─────────────────────────────────────────────────────────────┐
│                      RLS POLICIES                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  profiles                                             │  │
│  │  • Users can view own profile                        │  │
│  │  • Admins can view all profiles                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  products                                             │  │
│  │  • Anyone can view available products                │  │
│  │  • Admins can insert/update/delete                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  orders                                               │  │
│  │  • Users can view own orders                         │  │
│  │  • Users can insert own orders                       │  │
│  │  • Admins can view/update all orders                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  reviews                                              │  │
│  │  • Anyone can view approved reviews                  │  │
│  │  • Authenticated users can insert reviews            │  │
│  │  • Users can update own reviews                      │  │
│  │  • Admins can delete any review                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  settings                                             │  │
│  │  • Anyone can read settings                          │  │
│  │  • Admins can upsert/update settings                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Map

```
/api
├── /auth
│   ├── /signup          POST   ✅ Public
│   ├── /login           POST   ✅ Public
│   ├── /logout          POST   🔒 Auth
│   └── /user            GET    🔒 Auth
│
├── /products
│   ├── /                GET    ✅ Public
│   ├── /                POST   👨💼 Admin
│   └── /[id]
│       ├── /            GET    ✅ Public
│       ├── /            PUT    👨💼 Admin
│       └── /            DELETE 👨💼 Admin
│
├── /orders
│   ├── /                GET    🔒 Auth
│   ├── /                POST   🔒 Auth
│   └── /[id]
│       ├── /            GET    🔒 Auth (owner/admin)
│       └── /            PATCH  👨💼 Admin
│
├── /reviews
│   ├── /                GET    ✅ Public
│   ├── /                POST   🔒 Auth
│   └── /[id]
│       ├── /            PATCH  👨💼 Admin
│       └── /            DELETE 👨💼 Admin
│
├── /admin
│   ├── /orders          GET    👨💼 Admin
│   └── /stats           GET    👨💼 Admin
│
├── /payments
│   ├── /create-payment-intent  POST  🔒 Auth
│   └── /[orderId]              GET   🔒 Auth
│
├── /settings
│   ├── /                GET    ✅ Public
│   └── /                PUT    👨💼 Admin
│
└── /webhooks
    └── /stripe          POST   🔐 Stripe

Legend:
✅ Public - Доступно всім
🔒 Auth - Потрібна аутентифікація
👨💼 Admin - Тільки адміністратори
🔐 Stripe - Тільки Stripe webhooks
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         PRODUCTION                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    VERCEL                             │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Next.js App (Serverless Functions)           │  │  │
│  │  │                                                │  │  │
│  │  │  • Automatic HTTPS                             │  │  │
│  │  │  • CDN caching                                 │  │  │
│  │  │  • Edge network                                │  │  │
│  │  │  • Environment variables                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                    │                    │                   │
│                    │                    │                   │
│                    ▼                    ▼                   │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │     SUPABASE         │    │       STRIPE         │     │
│  │                      │    │                      │     │
│  │  • PostgreSQL        │    │  • Payment API       │     │
│  │  • Auth              │    │  • Webhooks          │     │
│  │  • RLS               │    │  • Dashboard         │     │
│  │  • Backups           │    │                      │     │
│  └──────────────────────┘    └──────────────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    MONITORING                         │  │
│  │                                                       │  │
│  │  • Vercel Analytics                                  │  │
│  │  • Supabase Logs                                     │  │
│  │  • Stripe Dashboard                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

**Створено для проекту "Варенники"**
