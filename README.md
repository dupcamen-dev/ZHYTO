# 🥟 Варенники - E-commerce Website

Повнофункціональний інтернет-магазин українських вареників з Next.js, Supabase та Stripe.

## ✨ Особливості

### Для клієнтів:
- 🛍️ Каталог продуктів з категоріями
- 🛒 Кошик покупок
- 💳 Безпечна оплата через Stripe
- 📦 Відстеження замовлень
- ⭐ Система відгуків
- 📱 Responsive дизайн

### Для адміністраторів:
- 📊 Панель управління
- 📈 Статистика продажів
- 📦 Управління замовленнями
- 🏷️ Управління продуктами
- 💬 Модерація відгуків
- ⚙️ Налаштування доставки

## 🛠️ Технології

### Frontend:
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Framer Motion** - Animations
- **Stripe Elements** - Payment UI

### Backend:
- **Next.js API Routes** - REST API
- **Supabase** - Database & Auth
- **PostgreSQL** - Database
- **Stripe** - Payments
- **Zod** - Validation

### DevOps:
- **Vercel** - Hosting
- **GitHub** - Version control
- **Stripe CLI** - Webhook testing

## 🚀 Швидкий старт

### Для розробників:

```bash
# 1. Клонувати репозиторій
git clone <your-repo-url>
cd varennyky-website

# 2. Встановити залежності
npm install

# 3. Налаштувати environment variables
cp .env.example .env.local
# Заповніть .env.local

# 4. Запустити
npm run dev
```

**Детальні інструкції:** [`QUICK_START.md`](./QUICK_START.md)

### Для менеджерів проекту:

1. Перегляньте [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) для розуміння структури
2. Перевірте [`CHECKLIST.md`](./CHECKLIST.md) для статусу реалізації
3. Використовуйте [`DEPLOYMENT.md`](./DEPLOYMENT.md) для production deployment

## 📚 Документація

| Файл | Опис |
|------|------|
| [`QUICK_START.md`](./QUICK_START.md) | Швидкий старт для нових розробників |
| [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) | Повна архітектура бекенду |
| [`API_REFERENCE.md`](./API_REFERENCE.md) | Довідник по API endpoints |
| [`API_EXAMPLES.md`](./API_EXAMPLES.md) | Приклади використання API |
| [`REACT_HOOKS_EXAMPLES.tsx`](./REACT_HOOKS_EXAMPLES.tsx) | Готові React hooks |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Інструкції для deployment |
| [`CHECKLIST.md`](./CHECKLIST.md) | Checklist реалізації |

## 🗄️ База даних

### Схема:
- `profiles` - Профілі користувачів з ролями
- `products` - Каталог продуктів
- `orders` - Замовлення клієнтів
- `reviews` - Відгуки
- `settings` - Налаштування системи
- `stock_history` - Історія змін залишків
- `promo_codes` - Промокоди
- `order_payments` - Платежі

**SQL схема:** [`supabase-schema.sql`](./supabase-schema.sql)  
**Тестові дані:** [`supabase-test-data.sql`](./supabase-test-data.sql)

## 🔌 API Endpoints

### Публічні:
- `GET /api/products` - Список продуктів
- `GET /api/reviews` - Відгуки
- `GET /api/settings` - Налаштування

### Авторизовані:
- `POST /api/auth/signup` - Реєстрація
- `POST /api/auth/login` - Вхід
- `POST /api/orders` - Створити замовлення
- `POST /api/reviews` - Додати відгук

### Тільки Admin:
- `POST /api/products` - Створити продукт
- `GET /api/admin/orders` - Всі замовлення
- `GET /api/admin/stats` - Статистика
- `PATCH /api/orders/[id]` - Оновити статус

**Повний список:** [`API_REFERENCE.md`](./API_REFERENCE.md)

## 🔐 Безпека

- ✅ Row Level Security (RLS) в Supabase
- ✅ Валідація через Zod
- ✅ Rate limiting
- ✅ Admin перевірки
- ✅ Stripe webhook signature verification
- ✅ HTTPS only в production
- ✅ Secure cookies
- ✅ Input sanitization

## 🧪 Тестування

### Локальне тестування:

```bash
# Запустити dev server
npm run dev

# Тестувати API
curl http://localhost:3000/api/products

# Тестувати Stripe webhook (потрібен Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Тестові картки Stripe:
- **Успішна:** `4242 4242 4242 4242`
- **Відхилена:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

## 📦 Deployment

### Vercel (рекомендовано):

1. Push код на GitHub
2. Імпортувати проект на [vercel.com](https://vercel.com)
3. Додати environment variables
4. Deploy!

**Детальні інструкції:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)

## 🗂️ Структура проекту

```
varennyky-website/
├── app/
│   ├── api/              # API Routes
│   ├── admin/            # Адмін панель
│   ├── account/          # Особистий кабінет
│   └── ...               # Інші сторінки
├── components/           # React компоненти
├── lib/
│   ├── services/         # Бізнес-логіка
│   ├── middleware/       # Auth, Admin, Rate limiting
│   ├── validations/      # Zod схеми
│   ├── types/           # TypeScript типи
│   └── utils/           # Supabase, Stripe, Errors
├── public/              # Статичні файли
├── styles/              # CSS
└── docs/                # Документація
```

## 🤝 Contributing

1. Fork проект
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📝 License

MIT License - дивіться [LICENSE](LICENSE) для деталей

## 👥 Команда

- **Frontend:** React, Next.js, TypeScript
- **Backend:** Next.js API Routes, Supabase
- **Design:** Tailwind CSS, Radix UI
- **Payments:** Stripe

## 🆘 Підтримка

- 📖 Документація: Дивіться файли вище
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🎯 Roadmap

### Фаза 1: MVP ✅
- [x] Каталог продуктів
- [x] Кошик
- [x] Оплата через Stripe
- [x] Замовлення
- [x] Адмін панель

### Фаза 2: Розширення 🚧
- [ ] Email нотифікації
- [ ] Промокоди
- [ ] Історія stock
- [ ] Експорт замовлень

### Фаза 3: Покращення 📋
- [ ] Push notifications
- [ ] Real-time tracking
- [ ] Advanced analytics
- [ ] Multi-language
- [ ] Mobile app

## 📊 Статистика

- **Lines of Code:** ~10,000+
- **API Endpoints:** 25+
- **Database Tables:** 8
- **React Components:** 50+

## 🌟 Особливі подяки

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [Vercel](https://vercel.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Зроблено з ❤️ для любителів вареників**
