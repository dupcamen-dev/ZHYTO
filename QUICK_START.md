# 🚀 Quick Start Guide

## Для нових розробників

### 1️⃣ Клонування та встановлення (5 хв)

```bash
# Клонувати репозиторій
git clone <your-repo-url>
cd varennyky-website

# Встановити залежності
npm install
```

### 2️⃣ Налаштування Supabase (10 хв)

1. Створіть акаунт на [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Відкрийте SQL Editor
4. Скопіюйте весь код з `supabase-schema.sql`
5. Виконайте його
6. (Опціонально) Виконайте `supabase-test-data.sql` для тестових даних
7. Перейдіть в Settings → API
8. Скопіюйте:
   - Project URL
   - anon/public key
   - service_role key (для admin операцій)

### 3️⃣ Налаштування Stripe (5 хв)

1. Створіть акаунт на [stripe.com](https://stripe.com)
2. Перейдіть в Developers → API keys
3. Скопіюйте Test keys:
   - Publishable key
   - Secret key
4. Webhook налаштуємо пізніше

### 4️⃣ Environment Variables (2 хв)

Створіть `.env.local`:

```bash
cp .env.example .env.local
```

Заповніть:

```env
# Stripe (Test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Поки залиште порожнім

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Опціонально

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5️⃣ Запуск (1 хв)

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

---

## ✅ Перевірка роботи

### Тест 1: API працює

```bash
curl http://localhost:3000/api/products
```

Повинен повернути список продуктів.

### Тест 2: Реєстрація

1. Відкрийте UI
2. Зареєструйтеся
3. Перевірте в Supabase Dashboard → Authentication → Users

### Тест 3: Створення замовлення

1. Додайте товари в кошик
2. Оформіть замовлення
3. Використайте тестову картку: `4242 4242 4242 4242`
4. Перевірте в Supabase Dashboard → Table Editor → orders

---

## 🔧 Налаштування Stripe Webhook (локально)

### Варіант 1: Stripe CLI (рекомендовано)

```bash
# Встановити Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli

# Логін
stripe login

# Слухати webhook
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Скопіюйте webhook secret (whsec_...) в .env.local
```

### Варіант 2: Без Stripe CLI

Webhook не працюватиме локально, але можна тестувати на staging/production.

---

## 👨💼 Створення першого адміна

1. Зареєструйтеся через UI
2. Скопіюйте ваш User ID з Supabase Dashboard → Authentication → Users
3. Виконайте в SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'ваш-user-id';
```

4. Перезайдіть в додаток
5. Тепер у вас є доступ до `/admin`

---

## 📁 Структура проекту

```
varennyky-website/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Аутентифікація
│   │   ├── products/     # Продукти
│   │   ├── orders/       # Замовлення
│   │   ├── reviews/      # Відгуки
│   │   ├── admin/        # Адмін панель
│   │   └── webhooks/     # Stripe webhooks
│   ├── admin/            # Адмін UI
│   └── ...               # Інші сторінки
├── lib/
│   ├── services/         # Бізнес-логіка
│   ├── middleware/       # Auth, Admin, Rate limiting
│   ├── validations/      # Zod схеми
│   ├── types/           # TypeScript типи
│   └── utils/           # Supabase, Stripe, Errors
├── components/          # React компоненти
└── public/             # Статичні файли
```

---

## 📚 Документація

- **Архітектура:** `BACKEND_ARCHITECTURE.md` - повна документація бекенду
- **API Reference:** `API_REFERENCE.md` - швидкий довідник по endpoints
- **API Examples:** `API_EXAMPLES.md` - приклади використання
- **React Hooks:** `REACT_HOOKS_EXAMPLES.tsx` - готові hooks
- **Deployment:** `DEPLOYMENT.md` - інструкції для production
- **Checklist:** `CHECKLIST.md` - перевірка реалізації

---

## 🐛 Troubleshooting

### Помилка: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Помилка: "Supabase connection failed"

1. Перевірте `NEXT_PUBLIC_SUPABASE_URL` та `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Перевірте чи проект активний в Supabase Dashboard

### Помилка: "Stripe error"

1. Перевірте `STRIPE_SECRET_KEY`
2. Використовуйте test keys (починаються з `pk_test_` та `sk_test_`)

### Помилка: "RLS policy violation"

1. Перевірте чи виконали `supabase-schema.sql`
2. Перевірте policies в Supabase Dashboard → Authentication → Policies

### Помилка: "Webhook signature verification failed"

1. Перевірте `STRIPE_WEBHOOK_SECRET`
2. Використовуйте Stripe CLI для локального тестування

---

## 🧪 Тестування

### Тестові картки Stripe

- **Успішна оплата:** `4242 4242 4242 4242`
- **Відхилена:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Будь-яка майбутня дата, будь-який CVC (123).

### Тестові дані

Виконайте `supabase-test-data.sql` для:
- Додаткових продуктів
- Тестових промокодів
- Налаштувань

---

## 🎯 Наступні кроки

### Для фронтенд розробників:

1. Вивчіть `API_REFERENCE.md` для доступних endpoints
2. Використовуйте готові hooks з `REACT_HOOKS_EXAMPLES.tsx`
3. Подивіться приклади в `API_EXAMPLES.md`

### Для бекенд розробників:

1. Вивчіть `BACKEND_ARCHITECTURE.md` для розуміння структури
2. Сервіси знаходяться в `lib/services/`
3. Додавайте нові endpoints в `app/api/`

### Для DevOps:

1. Вивчіть `DEPLOYMENT.md` для production deployment
2. Налаштуйте CI/CD через Vercel
3. Налаштуйте monitoring

---

## 💡 Корисні команди

```bash
# Розробка
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## 🆘 Потрібна допомога?

1. Перевірте документацію вище
2. Перегляньте приклади в `API_EXAMPLES.md`
3. Перевірте `CHECKLIST.md` для повноти реалізації
4. Перегляньте logs:
   - Browser Console (F12)
   - Terminal (де запущений `npm run dev`)
   - Supabase Dashboard → Logs
   - Stripe Dashboard → Logs

---

## ✨ Готово!

Тепер ви готові до розробки! 🎉

**Швидкі посилання:**
- Локальний сайт: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com

**Перший commit:**
```bash
git add .
git commit -m "Initial backend setup"
git push origin main
```
