# 📖 API Quick Reference

## Base URL
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## Authentication
Всі захищені endpoints потребують Bearer token в header:
```
Authorization: Bearer {access_token}
```

---

## 🔐 Auth Endpoints

### POST `/api/auth/signup`
Реєстрація нового користувача

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Іван Петренко"
}
```

**Response:** `201 Created`
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

---

### POST `/api/auth/login`
Вхід користувача

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

---

### POST `/api/auth/logout`
Вихід користувача

**Auth:** Required

**Response:** `200 OK`
```json
{ "success": true }
```

---

### GET `/api/auth/user`
Отримати поточного користувача

**Auth:** Required

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": { "role": "user", "created_at": "..." }
  }
}
```

---

## 🛍️ Products Endpoints

### GET `/api/products`
Отримати список продуктів

**Query Params:**
- `category` (optional): `varenyky` | `syrnyky` | `pelmeni`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Вареники з картоплею",
    "description": "Класичні українські вареники",
    "price": 12,
    "unit": "/ kg",
    "image": "/images/hero-varenyky.jpg",
    "badge": "Traditional",
    "category": "varenyky",
    "available": true,
    "stock": 10,
    "sort_order": 1,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

---

### GET `/api/products/[id]`
Отримати один продукт

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Вареники з картоплею",
  ...
}
```

---

### POST `/api/products`
Створити новий продукт

**Auth:** Required (Admin only)

**Body:**
```json
{
  "name": "Вареники з м'ясом",
  "description": "Соковиті вареники",
  "price": 14,
  "category": "varenyky",
  "stock": 20
}
```

**Response:** `201 Created`

---

### PUT `/api/products/[id]`
Оновити продукт

**Auth:** Required (Admin only)

**Body:** (всі поля optional)
```json
{
  "price": 15,
  "stock": 25,
  "available": true
}
```

**Response:** `200 OK`

---

### DELETE `/api/products/[id]`
Видалити продукт

**Auth:** Required (Admin only)

**Response:** `200 OK`
```json
{ "success": true }
```

---

## 📦 Orders Endpoints

### GET `/api/orders`
Отримати мої замовлення

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "items": [
      {
        "product_id": 1,
        "name": "Вареники з картоплею",
        "price": 12,
        "quantity": 2
      }
    ],
    "total": 24,
    "delivery_fee": 5,
    "status": "confirmed",
    "customer_name": "Іван Петренко",
    "customer_email": "user@example.com",
    "customer_phone": "+380501234567",
    "delivery_address": "вул. Хрещатик, 1, Київ",
    "notes": null,
    "created_at": "..."
  }
]
```

---

### POST `/api/orders`
Створити замовлення

**Auth:** Required

**Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "name": "Вареники з картоплею",
      "price": 12,
      "quantity": 2
    }
  ],
  "customer_name": "Іван Петренко",
  "customer_email": "user@example.com",
  "customer_phone": "+380501234567",
  "delivery_address": "вул. Хрещатик, 1, Київ",
  "notes": "Додзвоніться за 30 хв"
}
```

**Response:** `201 Created`
```json
{
  "order": { ... },
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

---

### GET `/api/orders/[id]`
Отримати деталі замовлення

**Auth:** Required (власник або admin)

**Response:** `200 OK`

---

### PATCH `/api/orders/[id]`
Оновити статус замовлення

**Auth:** Required (Admin only)

**Body:**
```json
{
  "status": "completed"
}
```

**Response:** `200 OK`

---

## ⭐ Reviews Endpoints

### GET `/api/reviews`
Отримати схвалені відгуки

**Query Params:**
- `limit` (optional): number, default 10

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": "uuid",
    "user_name": "Марія Коваленко",
    "rating": 5,
    "comment": "Дуже смачно!",
    "approved": true,
    "created_at": "..."
  }
]
```

---

### POST `/api/reviews`
Додати відгук

**Auth:** Required

**Body:**
```json
{
  "rating": 5,
  "comment": "Найкращі вареники!",
  "user_name": "Іван Петренко"
}
```

**Response:** `201 Created`

---

### PATCH `/api/reviews/[id]`
Модерувати відгук

**Auth:** Required (Admin only)

**Body:**
```json
{
  "approved": true
}
```

**Response:** `200 OK`

---

### DELETE `/api/reviews/[id]`
Видалити відгук

**Auth:** Required (Admin only)

**Response:** `200 OK`

---

## 💳 Payments Endpoints

### POST `/api/create-payment-intent`
Створити Stripe Payment Intent

**Auth:** Required

**Body:**
```json
{
  "amount": 29,
  "orderId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

---

### GET `/api/payments/[orderId]`
Отримати статус платежу

**Auth:** Required (власник або admin)

**Response:** `200 OK`
```json
{
  "orderId": "uuid",
  "status": "confirmed",
  "total": 29
}
```

---

## 🔧 Settings Endpoints

### GET `/api/settings`
Отримати налаштування

**Query Params:**
- `key` (optional): specific setting key

**Response:** `200 OK`
```json
{
  "key": "delivery",
  "value": {
    "min_order": 10,
    "free_threshold": 50,
    "fee": 5
  },
  "updated_at": "..."
}
```

---

### PUT `/api/settings`
Оновити налаштування

**Auth:** Required (Admin only)

**Body:**
```json
{
  "key": "delivery",
  "value": {
    "min_order": 15,
    "free_threshold": 60,
    "fee": 7
  }
}
```

**Response:** `200 OK`

---

## 👨‍💼 Admin Endpoints

### GET `/api/admin/orders`
Отримати всі замовлення

**Auth:** Required (Admin only)

**Query Params:**
- `status` (optional): `pending` | `confirmed` | `completed` | `cancelled`
- `page` (optional): number, default 1
- `limit` (optional): number, default 20

**Response:** `200 OK`
```json
{
  "orders": [ ... ],
  "total": 150
}
```

---

### GET `/api/admin/stats`
Отримати статистику

**Auth:** Required (Admin only)

**Query Params:**
- `period` (optional): `day` | `week` | `month` | `year`, default `week`

**Response:** `200 OK`
```json
{
  "revenue": 5420,
  "ordersCount": 87,
  "averageOrder": 62.3,
  "popularProducts": [
    { "id": 1, "name": "Вареники з картоплею", "count": 45 }
  ],
  "statusCounts": {
    "pending": 5,
    "confirmed": 12,
    "completed": 70
  },
  "period": "week"
}
```

---

## 🪝 Webhooks

### POST `/api/webhooks/stripe`
Stripe webhook endpoint

**Headers:**
- `stripe-signature`: Stripe signature for verification

**Body:** Stripe event object

**Response:** `200 OK`
```json
{ "received": true }
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "code": "VALIDATION_ERROR"
}
```

### 401 Unauthorized
```json
{
  "error": "Не авторизовано",
  "code": "AUTHENTICATION_ERROR"
}
```

### 403 Forbidden
```json
{
  "error": "Доступ заборонено",
  "code": "AUTHORIZATION_ERROR"
}
```

### 404 Not Found
```json
{
  "error": "Не знайдено",
  "code": "NOT_FOUND_ERROR"
}
```

### 500 Internal Server Error
```json
{
  "error": "Внутрішня помилка сервера"
}
```

---

## 📝 Notes

- Всі дати в ISO 8601 format (UTC)
- Ціни в USD (або вашій валюті)
- Stripe amounts в копійках (multiply by 100)
- Rate limits: 100 req/min (default), 5 req/min (auth)
