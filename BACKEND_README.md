# 🥟 Варенники - Backend Setup

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
npm install
# або
pnpm install
```

### 2. Налаштування Supabase

1. Створіть проект на [supabase.com](https://supabase.com)
2. Відкрийте SQL Editor
3. Виконайте весь код з файлу `supabase-schema.sql`
4. Скопіюйте API keys з Project Settings → API

### 3. Налаштування Stripe

1. Створіть акаунт на [stripe.com](https://stripe.com)
2. Отримайте Test API keys з Dashboard → Developers → API keys
3. Налаштуйте webhook:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Події: `payment_intent.succeeded`
   - Скопіюйте Webhook Secret

### 4. Environment Variables

Створіть файл `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Запуск

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

---

## 📁 Структура бекенду

Детальна документація в файлі `BACKEND_ARCHITECTURE.md`

```
lib/
├── services/          # Бізнес-логіка
├── middleware/        # Auth, Admin, Rate limiting
├── validations/       # Zod схеми
├── types/            # TypeScript типи
└── utils/            # Supabase, Stripe, Errors

app/api/
├── auth/             # Аутентифікація
├── products/         # Продукти
├── orders/           # Замовлення
├── reviews/          # Відгуки
├── payments/         # Платежі
├── settings/         # Налаштування
├── admin/            # Адмін панель
└── webhooks/         # Stripe webhooks
```

---

## 🔑 API Endpoints

### Публічні

- `GET /api/products` - Список продуктів
- `GET /api/products/[id]` - Деталі продукту
- `GET /api/reviews` - Відгуки
- `GET /api/settings` - Налаштування

### Авторизовані

- `POST /api/auth/signup` - Реєстрація
- `POST /api/auth/login` - Вхід
- `POST /api/auth/logout` - Вихід
- `GET /api/auth/user` - Поточний користувач
- `GET /api/orders` - Мої замовлення
- `POST /api/orders` - Створити замовлення
- `POST /api/reviews` - Додати відгук

### Тільки Admin

- `POST /api/products` - Створити продукт
- `PUT /api/products/[id]` - Оновити продукт
- `DELETE /api/products/[id]` - Видалити продукт
- `GET /api/admin/orders` - Всі замовлення
- `PATCH /api/orders/[id]` - Оновити статус
- `GET /api/admin/stats` - Статистика
- `PATCH /api/reviews/[id]` - Модерація відгуку

---

## 🔐 Аутентифікація

API використовує Bearer токени від Supabase Auth.

### Приклад запиту:

```javascript
const response = await fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## 💳 Процес оплати

1. Користувач створює замовлення → `POST /api/orders`
2. Отримує `clientSecret` для Stripe
3. Вводить дані картки (Stripe Elements)
4. Stripe обробляє платіж
5. Webhook → `POST /api/webhooks/stripe`
6. Статус замовлення оновлюється на `confirmed`
7. Stock зменшується
8. Відправляються email нотифікації

---

## 🧪 Тестування Stripe

Використовуйте тестові картки:

- **Успішна оплата:** `4242 4242 4242 4242`
- **Відхилена:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Будь-яка майбутня дата, будь-який CVC.

---

## 📧 Email нотифікації (TODO)

Для відправки email потрібно інтегрувати:

- [Resend](https://resend.com) (рекомендовано)
- [SendGrid](https://sendgrid.com)

```bash
npm install resend
```

Оновіть `lib/services/email.service.ts`

---

## 🛡️ Безпека

- ✅ Row Level Security (RLS) в Supabase
- ✅ Валідація через Zod
- ✅ Rate limiting
- ✅ Admin перевірки
- ✅ Stripe webhook signature
- ✅ HTTPS в production

---

## 📊 Адмін панель

Для створення першого адміна:

1. Зареєструйте користувача
2. В Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

---

## 🐛 Troubleshooting

### Stripe webhook не працює локально

Використовуйте Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### RLS блокує запити

Перевірте policies в Supabase Dashboard → Authentication → Policies

### CORS помилки

Додайте домен в Supabase Dashboard → Settings → API → CORS

---

## 📝 TODO

- [ ] Інтеграція email сервісу
- [ ] Промокоди функціонал
- [ ] Експорт замовлень (CSV)
- [ ] Push нотифікації
- [ ] Аналітика (Google Analytics)

---

## 📞 Підтримка

Питання? Перегляньте `BACKEND_ARCHITECTURE.md` для детальної документації.
