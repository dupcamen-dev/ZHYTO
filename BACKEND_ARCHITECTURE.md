# 🏗️ АРХІТЕКТУРА БЕКЕНДУ - Сайт Варенники

## 📋 ЗМІСТ
1. [Загальна структура](#загальна-структура)
2. [База даних](#база-даних)
3. [API Routes](#api-routes)
4. [Сервіси](#сервіси)
5. [Middleware](#middleware)
6. [Валідація](#валідація)
7. [Безпека](#безпека)
8. [Послідовність роботи](#послідовність-роботи)

---

## 🗂️ ЗАГАЛЬНА СТРУКТУРА

```
varennyky-website/
├── app/
│   ├── api/                          # API Routes (Next.js)
│   │   ├── auth/                     # Аутентифікація
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── user/route.ts
│   │   ├── products/                 # Продукти
│   │   │   ├── route.ts              # GET, POST
│   │   │   └── [id]/route.ts         # GET, PUT, DELETE
│   │   ├── orders/                   # Замовлення
│   │   │   ├── route.ts              # GET, POST
│   │   │   └── [id]/route.ts         # GET, PATCH
│   │   ├── admin/                    # Адмін ендпоінти
│   │   │   ├── orders/route.ts
│   │   │   └── stats/route.ts
│   │   ├── reviews/                  # Відгуки
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── settings/                 # Налаштування
│   │   │   └── route.ts
│   │   ├── payments/                 # Платежі
│   │   │   ├── create-payment-intent/route.ts
│   │   │   └── [orderId]/route.ts
│   │   └── webhooks/                 # Webhooks
│   │       └── stripe/route.ts
│   └── ...
├── lib/
│   ├── services/                     # Бізнес-логіка
│   │   ├── products.service.ts
│   │   ├── orders.service.ts
│   │   ├── payments.service.ts
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── reviews.service.ts
│   ├── middleware/                   # Middleware
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── validations/                  # Zod схеми
│   │   ├── product.schema.ts
│   │   ├── order.schema.ts
│   │   ├── auth.schema.ts
│   │   └── review.schema.ts
│   ├── utils/                        # Утиліти
│   │   ├── supabase.ts
│   │   ├── stripe.ts
│   │   └── errors.ts
│   └── types/                        # TypeScript типи
│       ├── product.types.ts
│       ├── order.types.ts
│       └── user.types.ts
└── supabase-schema.sql               # SQL схема
```

---

## 🗄️ БАЗА ДАНИХ

### Існуючі таблиці:

#### 1. **profiles**
```sql
- id (UUID, FK -> auth.users)
- role (TEXT: 'user' | 'admin')
- created_at (TIMESTAMPTZ)
```
**Призначення:** Розширення auth.users з ролями

#### 2. **products**
```sql
- id (SERIAL, PK)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- unit (TEXT)
- image (TEXT)
- badge (TEXT, nullable)
- category (TEXT: 'varenyky' | 'syrnyky' | 'pelmeni')
- available (BOOLEAN)
- stock (INT)
- sort_order (INT)
- created_at, updated_at (TIMESTAMPTZ)
```
**Призначення:** Каталог продуктів

#### 3. **orders**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- items (JSONB) - [{product_id, name, price, quantity}]
- total (DECIMAL)
- delivery_fee (DECIMAL)
- status (TEXT: 'pending' | 'confirmed' | 'completed' | 'cancelled')
- customer_name (TEXT)
- customer_email (TEXT)
- customer_phone (TEXT)
- delivery_address (TEXT)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```
**Призначення:** Замовлення клієнтів

#### 4. **settings**
```sql
- key (TEXT, PK)
- value (JSONB)
- updated_at (TIMESTAMPTZ)
```
**Призначення:** Налаштування системи (доставка, тощо)

#### 5. **reviews**
```sql
- id (SERIAL, PK)
- user_id (UUID, FK -> auth.users)
- user_name (TEXT)
- rating (INT, 1-5)
- comment (TEXT)
- approved (BOOLEAN)
- created_at (TIMESTAMPTZ)
```
**Призначення:** Відгуки клієнтів

### Додаткові таблиці (будуть створені):

#### 6. **stock_history**
```sql
- id (SERIAL, PK)
- product_id (INT, FK -> products)
- change (INT) - зміна кількості (+/-)
- reason (TEXT)
- admin_id (UUID, FK -> auth.users)
- created_at (TIMESTAMPTZ)
```
**Призначення:** Історія змін залишків товару

#### 7. **promo_codes**
```sql
- id (SERIAL, PK)
- code (TEXT, UNIQUE)
- discount_percent (INT)
- discount_fixed (DECIMAL)
- min_order (DECIMAL)
- valid_from (TIMESTAMPTZ)
- valid_until (TIMESTAMPTZ)
- max_uses (INT)
- used_count (INT)
- active (BOOLEAN)
```
**Призначення:** Промокоди та знижки

#### 8. **order_payments**
```sql
- id (SERIAL, PK)
- order_id (UUID, FK -> orders)
- stripe_payment_intent_id (TEXT)
- amount (DECIMAL)
- status (TEXT: 'pending' | 'succeeded' | 'failed')
- created_at (TIMESTAMPTZ)
```
**Призначення:** Зв'язок замовлень з платежами Stripe

---

## 🔌 API ROUTES

### 1. **Аутентифікація** (`/api/auth`)

#### POST `/api/auth/signup`
- **Вхід:** email, password, name
- **Вихід:** user, session
- **Логіка:** Реєстрація через Supabase Auth + створення profile

#### POST `/api/auth/login`
- **Вхід:** email, password
- **Вихід:** user, session
- **Логіка:** Вхід через Supabase Auth

#### POST `/api/auth/logout`
- **Вхід:** -
- **Вихід:** success
- **Логіка:** Вихід з системи

#### GET `/api/auth/user`
- **Вхід:** -
- **Вихід:** user + profile
- **Логіка:** Отримання поточного користувача

---

### 2. **Продукти** (`/api/products`)

#### GET `/api/products`
- **Вхід:** ?category=varenyky (optional)
- **Вихід:** Product[]
- **Логіка:** Список доступних продуктів
- **Доступ:** Публічний

#### GET `/api/products/[id]`
- **Вхід:** id
- **Вихід:** Product
- **Логіка:** Деталі одного продукту
- **Доступ:** Публічний

#### POST `/api/products`
- **Вхід:** Product data
- **Вихід:** Product
- **Логіка:** Створення нового продукту
- **Доступ:** Тільки admin

#### PUT `/api/products/[id]`
- **Вхід:** id, Product data
- **Вихід:** Product
- **Логіка:** Оновлення продукту
- **Доступ:** Тільки admin

#### DELETE `/api/products/[id]`
- **Вхід:** id
- **Вихід:** success
- **Логіка:** Видалення продукту
- **Доступ:** Тільки admin

---

### 3. **Замовлення** (`/api/orders`)

#### GET `/api/orders`
- **Вхід:** -
- **Вихід:** Order[]
- **Логіка:** Замовлення поточного користувача
- **Доступ:** Авторизовані користувачі

#### GET `/api/orders/[id]`
- **Вхід:** id
- **Вихід:** Order
- **Логіка:** Деталі замовлення
- **Доступ:** Власник або admin

#### POST `/api/orders`
- **Вхід:** items[], customer_info, delivery_address
- **Вихід:** Order + payment_intent
- **Логіка:** 
  1. Валідація даних
  2. Перевірка stock
  3. Розрахунок total + delivery_fee
  4. Створення order (status: pending)
  5. Створення Stripe Payment Intent
  6. Повернення order + client_secret
- **Доступ:** Авторизовані користувачі

#### PATCH `/api/orders/[id]`
- **Вхід:** id, status
- **Вихід:** Order
- **Логіка:** Оновлення статусу замовлення
- **Доступ:** Тільки admin

---

### 4. **Адмін** (`/api/admin`)

#### GET `/api/admin/orders`
- **Вхід:** ?status=pending&page=1&limit=20
- **Вихід:** { orders: Order[], total: number }
- **Логіка:** Всі замовлення з фільтрацією
- **Доступ:** Тільки admin

#### GET `/api/admin/stats`
- **Вхід:** ?period=week
- **Вихід:** { revenue, orders_count, popular_products }
- **Логіка:** Статистика продажів
- **Доступ:** Тільки admin

---

### 5. **Відгуки** (`/api/reviews`)

#### GET `/api/reviews`
- **Вхід:** ?limit=10
- **Вихід:** Review[]
- **Логіка:** Схвалені відгуки
- **Доступ:** Публічний

#### POST `/api/reviews`
- **Вхід:** rating, comment
- **Вихід:** Review
- **Логіка:** Створення відгуку
- **Доступ:** Авторизовані користувачі

#### PATCH `/api/reviews/[id]`
- **Вхід:** id, approved
- **Вихід:** Review
- **Логіка:** Модерація відгуку
- **Доступ:** Тільки admin

#### DELETE `/api/reviews/[id]`
- **Вхід:** id
- **Вихід:** success
- **Логіка:** Видалення відгуку
- **Доступ:** Тільки admin

---

### 6. **Налаштування** (`/api/settings`)

#### GET `/api/settings`
- **Вхід:** ?key=delivery
- **Вихід:** Settings
- **Логіка:** Отримання налаштувань
- **Доступ:** Публічний

#### PUT `/api/settings`
- **Вхід:** key, value
- **Вихід:** Settings
- **Логіка:** Оновлення налаштувань
- **Доступ:** Тільки admin

---

### 7. **Платежі** (`/api/payments`)

#### POST `/api/payments/create-payment-intent`
- **Вхід:** amount, order_id
- **Вихід:** { client_secret, payment_intent_id }
- **Логіка:** Створення Stripe Payment Intent
- **Доступ:** Авторизовані користувачі

#### GET `/api/payments/[orderId]`
- **Вхід:** orderId
- **Вихід:** Payment status
- **Логіка:** Статус платежу
- **Доступ:** Власник або admin

---

### 8. **Webhooks** (`/api/webhooks`)

#### POST `/api/webhooks/stripe`
- **Вхід:** Stripe event
- **Вихід:** { received: true }
- **Логіка:**
  1. Верифікація Stripe signature
  2. Обробка події (payment_intent.succeeded)
  3. Оновлення статусу замовлення
  4. Зменшення stock
  5. Відправка email
- **Доступ:** Тільки Stripe

---

## 🛠️ СЕРВІСИ

### 1. **products.service.ts**
```typescript
- getAllProducts(category?: string)
- getProductById(id: number)
- createProduct(data: ProductInput) // admin
- updateProduct(id: number, data: ProductInput) // admin
- deleteProduct(id: number) // admin
- updateStock(id: number, change: number) // internal
- checkAvailability(items: CartItem[]) // перевірка stock
```

### 2. **orders.service.ts**
```typescript
- getUserOrders(userId: string)
- getOrderById(id: string)
- createOrder(data: OrderInput)
- updateOrderStatus(id: string, status: OrderStatus) // admin
- getAllOrders(filters: OrderFilters) // admin
- calculateTotal(items: CartItem[])
- calculateDeliveryFee(total: number)
```

### 3. **payments.service.ts**
```typescript
- createPaymentIntent(amount: number, orderId: string)
- getPaymentStatus(orderId: string)
- handleWebhook(event: Stripe.Event)
- refundPayment(paymentIntentId: string) // admin
```

### 4. **auth.service.ts**
```typescript
- signUp(email: string, password: string, name: string)
- signIn(email: string, password: string)
- signOut()
- getCurrentUser()
- getUserProfile(userId: string)
- isAdmin(userId: string)
```

### 5. **email.service.ts**
```typescript
- sendOrderConfirmation(order: Order)
- sendOrderStatusUpdate(order: Order)
- sendAdminNotification(order: Order)
- sendWelcomeEmail(user: User)
```

### 6. **reviews.service.ts**
```typescript
- getApprovedReviews(limit?: number)
- createReview(userId: string, data: ReviewInput)
- moderateReview(id: number, approved: boolean) // admin
- deleteReview(id: number) // admin
```

---

## 🔐 MIDDLEWARE

### 1. **auth.middleware.ts**
```typescript
- requireAuth() - перевірка аутентифікації
- getUser() - отримання поточного користувача
```

### 2. **admin.middleware.ts**
```typescript
- requireAdmin() - перевірка ролі admin
```

### 3. **rate-limit.middleware.ts**
```typescript
- rateLimit(requests: number, window: string)
```

---

## ✅ ВАЛІДАЦІЯ (Zod)

### 1. **product.schema.ts**
```typescript
- ProductSchema
- CreateProductSchema
- UpdateProductSchema
```

### 2. **order.schema.ts**
```typescript
- OrderItemSchema
- CreateOrderSchema
- UpdateOrderStatusSchema
```

### 3. **auth.schema.ts**
```typescript
- SignUpSchema
- SignInSchema
```

### 4. **review.schema.ts**
```typescript
- CreateReviewSchema
- ModerateReviewSchema
```

---

## 🔒 БЕЗПЕКА

### Реалізовані заходи:
1. **Row Level Security (RLS)** - на рівні Supabase
2. **Валідація всіх input** - через Zod
3. **Rate limiting** - захист від DDoS
4. **HTTPS only** - в production
5. **Secure cookies** - для session
6. **Stripe webhook signature** - верифікація
7. **Admin перевірки** - на кожному захищеному ендпоінті
8. **SQL injection захист** - через Supabase client
9. **XSS захист** - sanitization input

---

## 🔄 ПОСЛІДОВНІСТЬ РОБОТИ

### Сценарій 1: Створення замовлення

```
1. Користувач додає товари в кошик (фронтенд)
2. Натискає "Оформити замовлення"
3. POST /api/orders
   ├─ Валідація даних (Zod)
   ├─ Перевірка auth
   ├─ Перевірка stock (products.service)
   ├─ Розрахунок total + delivery_fee (orders.service)
   ├─ Створення order в БД (status: pending)
   ├─ Створення Payment Intent (payments.service)
   └─ Повернення order + client_secret
4. Фронтенд показує Stripe форму
5. Користувач вводить картку
6. Stripe обробляє платіж
7. POST /api/webhooks/stripe (payment_intent.succeeded)
   ├─ Верифікація signature
   ├─ Оновлення order.status = 'confirmed'
   ├─ Зменшення stock (products.service)
   ├─ Створення stock_history запису
   ├─ Відправка email клієнту (email.service)
   └─ Відправка email admin (email.service)
8. Користувач бачить підтвердження
```

### Сценарій 2: Адмін оновлює статус замовлення

```
1. Адмін заходить в /admin/orders
2. GET /api/admin/orders
   ├─ Перевірка auth
   ├─ Перевірка admin ролі
   └─ Повернення всіх замовлень
3. Адмін змінює статус на "completed"
4. PATCH /api/orders/[id]
   ├─ Перевірка auth
   ├─ Перевірка admin ролі
   ├─ Оновлення order.status
   ├─ Відправка email клієнту (email.service)
   └─ Повернення оновленого order
5. Фронтенд оновлює UI
```

### Сценарій 3: Додавання нового продукту

```
1. Адмін заходить в /admin/products
2. Натискає "Додати продукт"
3. POST /api/products
   ├─ Перевірка auth
   ├─ Перевірка admin ролі
   ├─ Валідація даних (Zod)
   ├─ Створення product в БД
   └─ Повернення нового product
4. Фронтенд оновлює список
```

---

## 📊 СТАТИСТИКА ТА АНАЛІТИКА

### Метрики для адміна:
- Загальний дохід (за період)
- Кількість замовлень (за період)
- Середній чек
- Популярні продукти
- Статуси замовлень (pending/confirmed/completed)
- Низький stock (попередження)

---

## 📧 EMAIL НОТИФІКАЦІЇ

### Типи листів:
1. **Підтвердження замовлення** - клієнту після оплати
2. **Зміна статусу** - клієнту при оновленні
3. **Нове замовлення** - адміну
4. **Низький stock** - адміну
5. **Вітальний лист** - новому користувачу

---

## 🚀 DEPLOYMENT

### Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
EMAIL_SERVICE_API_KEY (Resend/SendGrid)
```

### Vercel Configuration:
- Automatic deployments from main branch
- Environment variables в Vercel dashboard
- Stripe webhook URL: https://yourdomain.com/api/webhooks/stripe

---

## 📝 TODO LIST

### Фаза 1: Основа (Priority: High)
- [x] Створити архітектуру документ
- [ ] Створити всі API routes
- [ ] Реалізувати сервіси
- [ ] Додати middleware
- [ ] Створити Zod схеми
- [ ] Оновити SQL схему (додаткові таблиці)

### Фаза 2: Інтеграції (Priority: High)
- [ ] Налаштувати Stripe webhooks
- [ ] Інтегрувати email сервіс
- [ ] Тестування платежів

### Фаза 3: Адмін панель (Priority: Medium)
- [ ] Статистика та аналітика
- [ ] Управління stock
- [ ] Модерація відгуків

### Фаза 4: Додаткові функції (Priority: Low)
- [ ] Промокоди
- [ ] Історія stock
- [ ] Експорт замовлень (CSV)

---

## 🆘 TROUBLESHOOTING

### Проблема: Stripe webhook не працює
**Рішення:** 
1. Перевірити STRIPE_WEBHOOK_SECRET
2. Перевірити URL в Stripe dashboard
3. Перевірити logs в Vercel

### Проблема: RLS блокує запити
**Рішення:**
1. Перевірити policies в Supabase
2. Використовувати service_role key для admin операцій
3. Перевірити auth.uid() в policies

### Проблема: Stock не оновлюється
**Рішення:**
1. Перевірити webhook обробку
2. Перевірити транзакції в БД
3. Додати логування в stock.service

---

**Версія:** 1.0  
**Дата:** 2024  
**Автор:** Amazon Q Developer
