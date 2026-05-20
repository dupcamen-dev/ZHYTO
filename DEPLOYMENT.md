# 🚀 Deployment Guide

## Vercel Deployment

### 1. Підготовка

```bash
# Переконайтеся, що всі зміни закомічені
git add .
git commit -m "Backend implementation"
git push origin main
```

### 2. Створення проекту на Vercel

1. Зайдіть на [vercel.com](https://vercel.com)
2. Натисніть "Add New Project"
3. Імпортуйте ваш GitHub репозиторій
4. Framework Preset: Next.js (автоматично визначиться)
5. Root Directory: `./` (або `./varennyky-website` якщо проект в підпапці)

### 3. Environment Variables

Додайте в Vercel Dashboard → Settings → Environment Variables:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

⚠️ **ВАЖЛИВО:** Використовуйте LIVE keys для production!

### 4. Deploy

Натисніть "Deploy" - Vercel автоматично:
- Встановить залежності
- Збудує проект
- Задеплоїть на CDN

### 5. Налаштування Stripe Webhook

1. Зайдіть в Stripe Dashboard → Developers → Webhooks
2. Натисніть "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Виберіть події:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Скопіюйте Webhook Secret
6. Додайте його в Vercel Environment Variables як `STRIPE_WEBHOOK_SECRET`
7. Redeploy проект

### 6. Перевірка

```bash
# Тест API
curl https://yourdomain.com/api/products

# Тест webhook (через Stripe CLI)
stripe trigger payment_intent.succeeded
```

---

## Supabase Production Setup

### 1. Database

Ваша база даних вже в production на Supabase.

### 2. Row Level Security

Переконайтеся, що всі RLS policies активні:

```sql
-- Перевірка
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. API Rate Limiting

В Supabase Dashboard → Settings → API:
- Встановіть rate limits
- Налаштуйте CORS для вашого домену

### 4. Backups

Supabase автоматично робить backups, але можна налаштувати додаткові:
- Dashboard → Database → Backups
- Встановіть розклад

---

## Custom Domain

### 1. Додати домен в Vercel

1. Vercel Dashboard → Settings → Domains
2. Додайте ваш домен
3. Налаштуйте DNS записи (Vercel покаже інструкції)

### 2. SSL Certificate

Vercel автоматично налаштує Let's Encrypt SSL.

---

## Monitoring

### 1. Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 3. Logs

- Vercel Dashboard → Deployments → [Your deployment] → Logs
- Supabase Dashboard → Logs

---

## Performance Optimization

### 1. Next.js Config

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
```

### 2. Caching

```typescript
// app/api/products/route.ts
export const revalidate = 60; // Revalidate every 60 seconds
```

### 3. Database Indexes

Вже створені в `supabase-schema.sql`:
- `idx_orders_user_id`
- `idx_orders_created_at`
- `idx_orders_status`
- `idx_products_category`

---

## Security Checklist

- [ ] Всі environment variables налаштовані
- [ ] RLS policies активні на всіх таблицях
- [ ] Stripe webhook signature перевіряється
- [ ] Rate limiting налаштований
- [ ] CORS налаштований правильно
- [ ] HTTPS only (автоматично на Vercel)
- [ ] Secure cookies (автоматично на Vercel)
- [ ] Input validation через Zod
- [ ] SQL injection захист (через Supabase client)

---

## Post-Deployment

### 1. Створити першого адміна

```sql
-- В Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-from-signup';
```

### 2. Завантажити тестові дані (optional)

```sql
-- Виконати supabase-test-data.sql
```

### 3. Тестування

- [ ] Реєстрація/вхід працює
- [ ] Створення замовлення працює
- [ ] Stripe платіж працює
- [ ] Webhook обробляється
- [ ] Email відправляються (якщо налаштовано)
- [ ] Адмін панель доступна
- [ ] Статистика відображається

---

## Rollback

Якщо щось пішло не так:

1. Vercel Dashboard → Deployments
2. Знайдіть попередній успішний deployment
3. Натисніть "..." → "Promote to Production"

---

## Continuous Deployment

Vercel автоматично деплоїть при push в main:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel автоматично задеплоїть
```

Preview deployments для PR:
- Створіть PR
- Vercel створить preview URL
- Тестуйте перед merge

---

## Troubleshooting

### Помилка: "Module not found"

```bash
# Очистити cache
rm -rf .next
npm install
npm run build
```

### Помилка: "Stripe webhook failed"

1. Перевірте STRIPE_WEBHOOK_SECRET
2. Перевірте URL webhook в Stripe Dashboard
3. Перевірте logs в Vercel

### Помилка: "Supabase RLS"

1. Перевірте policies в Supabase Dashboard
2. Перевірте чи використовується правильний API key
3. Перевірте auth.uid() в policies

---

## Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- Stripe: [stripe.com/support](https://stripe.com/support)
