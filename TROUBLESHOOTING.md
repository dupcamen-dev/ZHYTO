# 🔧 Troubleshooting Guide

## Загальні проблеми та рішення

---

## 🚫 Помилки при запуску

### Помилка: "Module not found"

**Симптоми:**
```
Error: Cannot find module '@/lib/services/...'
```

**Рішення:**
```bash
# Очистити node_modules та перевстановити
rm -rf node_modules package-lock.json
npm install

# Або
npm ci
```

---

### Помилка: "Port 3000 already in use"

**Симптоми:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Рішення:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Або використати інший порт
PORT=3001 npm run dev
```

---

## 🔐 Помилки аутентифікації

### Помилка: "Invalid token" або "Unauthorized"

**Симптоми:**
```json
{ "error": "Не авторизовано", "code": "AUTHENTICATION_ERROR" }
```

**Причини:**
1. Token не надано
2. Token застарів
3. Невірний token

**Рішення:**
```javascript
// Перевірте чи token зберігається
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Перевірте чи token надається в header
fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`, // ✅ Правильно
    // 'Authorization': token,          // ❌ Неправильно
  }
});

// Якщо token застарів - перелогіньтесь
```

---

### Помилка: "Доступ заборонено" (403)

**Симптоми:**
```json
{ "error": "Доступ заборонено", "code": "AUTHORIZATION_ERROR" }
```

**Причини:**
1. Користувач не є admin
2. Спроба доступу до чужих даних

**Рішення:**
```sql
-- Перевірте роль користувача в Supabase
SELECT id, role FROM profiles WHERE id = 'user-uuid';

-- Зробіть користувача адміном
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
```

---

## 🗄️ Помилки бази даних

### Помилка: "Supabase connection failed"

**Симптоми:**
```
Error: Failed to connect to Supabase
```

**Рішення:**
```bash
# 1. Перевірте .env.local
cat .env.local

# 2. Переконайтесь що змінні правильні
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...            # ✅

# 3. Перезапустіть dev server
npm run dev
```

---

### Помилка: "RLS policy violation"

**Симптоми:**
```
Error: new row violates row-level security policy
```

**Причини:**
1. RLS policies не виконані
2. Користувач не має прав

**Рішення:**
```sql
-- 1. Перевірте чи виконали supabase-schema.sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. Якщо policies відсутні - виконайте схему
-- Скопіюйте код з supabase-schema.sql в SQL Editor

-- 3. Для тестування можна тимчасово вимкнути RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ⚠️ НЕ РОБІТЬ ЦЕ В PRODUCTION!
```

---

### Помилка: "Column does not exist"

**Симптоми:**
```
Error: column "stock" does not exist
```

**Рішення:**
```sql
-- Додайте відсутню колонку
ALTER TABLE products ADD COLUMN stock INT DEFAULT 10;

-- Або виконайте повну схему
-- supabase-schema.sql
```

---

## 💳 Помилки Stripe

### Помилка: "Stripe is not configured"

**Симптоми:**
```json
{ "error": "Payment not configured" }
```

**Рішення:**
```bash
# Перевірте .env.local
STRIPE_SECRET_KEY=sk_test_...  # Має починатися з sk_test_ або sk_live_

# Перезапустіть server
npm run dev
```

---

### Помилка: "Webhook signature verification failed"

**Симптоми:**
```
Error: No signatures found matching the expected signature
```

**Причини:**
1. Невірний STRIPE_WEBHOOK_SECRET
2. Webhook не налаштований

**Рішення (локально):**
```bash
# 1. Встановіть Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# 2. Логін
stripe login

# 3. Слухайте webhook
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Скопіюйте webhook secret (whsec_...)
# 5. Додайте в .env.local
STRIPE_WEBHOOK_SECRET=whsec_...

# 6. Перезапустіть server
```

**Рішення (production):**
```bash
# 1. В Stripe Dashboard → Developers → Webhooks
# 2. Add endpoint: https://yourdomain.com/api/webhooks/stripe
# 3. Select events: payment_intent.succeeded
# 4. Copy webhook secret
# 5. Add to Vercel environment variables
```

---

### Помилка: "Payment failed"

**Симптоми:**
Платіж не проходить

**Рішення:**
```javascript
// Використовуйте тестові картки
const testCards = {
  success: '4242 4242 4242 4242',
  declined: '4000 0000 0000 0002',
  '3d_secure': '4000 0027 6000 3184',
};

// Будь-яка майбутня дата, будь-який CVC
```

---

## 📧 Помилки Email

### Помилка: Email не відправляються

**Симптоми:**
Email нотифікації не приходять

**Причина:**
Email сервіс не налаштований (це заглушка)

**Рішення:**
```bash
# 1. Встановіть Resend
npm install resend

# 2. Отримайте API key на resend.com

# 3. Додайте в .env.local
RESEND_API_KEY=re_...

# 4. Оновіть lib/services/email.service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendOrderConfirmation(order: Order) {
    await resend.emails.send({
      from: 'orders@yourdomain.com',
      to: order.customer_email,
      subject: 'Підтвердження замовлення',
      html: `<p>Дякуємо за замовлення #${order.id}</p>`,
    });
  },
  // ...
};
```

---

## 🐛 Помилки валідації

### Помилка: "Validation error"

**Симптоми:**
```json
{ "error": "Ім'я має бути мінімум 2 символи", "code": "VALIDATION_ERROR" }
```

**Причина:**
Дані не відповідають Zod схемі

**Рішення:**
```javascript
// Перевірте дані перед відправкою
const orderData = {
  items: [
    {
      product_id: 1,
      name: 'Вареники',
      price: 12,
      quantity: 2, // ✅ Має бути > 0
    }
  ],
  customer_name: 'Іван', // ✅ Мінімум 2 символи
  customer_email: 'ivan@example.com', // ✅ Валідний email
  delivery_address: 'вул. Хрещатик, 1, Київ', // ✅ Мінімум 10 символів
};
```

---

## 🔄 Помилки CORS

### Помилка: "CORS policy blocked"

**Симптоми:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Рішення:**
```bash
# 1. В Supabase Dashboard → Settings → API → CORS
# 2. Додайте ваш домен:
#    - http://localhost:3000 (для dev)
#    - https://yourdomain.com (для production)

# 3. Або додайте * для всіх (не рекомендовано для production)
```

---

## 📦 Помилки при build

### Помилка: "Type error" при build

**Симптоми:**
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**Рішення:**
```bash
# 1. Перевірте типи
npx tsc --noEmit

# 2. Виправте помилки типів

# 3. Якщо помилка в node_modules
rm -rf node_modules package-lock.json
npm install
```

---

### Помилка: "Out of memory"

**Симптоми:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Рішення:**
```bash
# Збільшіть memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 🚀 Помилки deployment

### Помилка: Vercel deployment failed

**Симптоми:**
Build fails на Vercel

**Рішення:**
```bash
# 1. Перевірте чи build працює локально
npm run build

# 2. Перевірте environment variables в Vercel
# Dashboard → Settings → Environment Variables

# 3. Перевірте logs в Vercel
# Dashboard → Deployments → [Your deployment] → Logs

# 4. Redeploy
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

---

## 🔍 Debugging Tips

### Перевірка API endpoints

```bash
# Тест GET endpoint
curl http://localhost:3000/api/products

# Тест POST endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Тест з auth
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Перевірка бази даних

```sql
-- Перевірка користувачів
SELECT * FROM auth.users;

-- Перевірка профілів
SELECT * FROM profiles;

-- Перевірка продуктів
SELECT * FROM products;

-- Перевірка замовлень
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Перевірка RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

---

### Перевірка logs

```bash
# Browser console (F12)
# Перевірте Network tab для API requests

# Terminal (де запущений npm run dev)
# Перевірте console.log виводи

# Supabase Dashboard → Logs
# Перевірте database queries

# Stripe Dashboard → Developers → Logs
# Перевірте webhook events
```

---

## 📞 Коли звертатися за допомогою

### Перевірте спочатку:
1. ✅ Документацію (`BACKEND_ARCHITECTURE.md`, `API_REFERENCE.md`)
2. ✅ Приклади (`API_EXAMPLES.md`)
3. ✅ Цей troubleshooting guide
4. ✅ Browser console та terminal logs

### Якщо не допомогло:
1. 🔍 Google/Stack Overflow
2. 📖 Офіційна документація:
   - [Next.js](https://nextjs.org/docs)
   - [Supabase](https://supabase.com/docs)
   - [Stripe](https://stripe.com/docs)
3. 💬 GitHub Issues/Discussions
4. 🆘 Команда підтримки

---

## 🛠️ Корисні команди

```bash
# Очистити все та перезапустити
rm -rf node_modules .next package-lock.json
npm install
npm run dev

# Перевірити типи
npx tsc --noEmit

# Перевірити lint
npm run lint

# Build для production
npm run build
npm start

# Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded

# Git
git status
git add .
git commit -m "Fix: description"
git push origin main
```

---

## 📝 Checklist при проблемах

- [ ] Перезапустив dev server
- [ ] Перевірив .env.local
- [ ] Перевірив browser console
- [ ] Перевірив terminal logs
- [ ] Перевірив Supabase Dashboard
- [ ] Перевірив Stripe Dashboard
- [ ] Очистив node_modules та перевстановив
- [ ] Перевірив документацію
- [ ] Погуглив помилку
- [ ] Перевірив GitHub Issues

---

**Якщо нічого не допомогло - створіть Issue з детальним описом проблеми!**
