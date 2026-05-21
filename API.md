# API Reference

All routes prefixed with `/api`. Unauthenticated routes return `401` for protected endpoints.

## Conventions

- **Errors**: `{ "error": "message" }` with appropriate HTTP status
- **Auth**: `Authorization: Bearer <supabase_access_token>` header for protected routes
- **Admin**: requires user with `role = 'admin'` in `profiles` table
- **Service role**: internal admin client used by API routes (not exposed)

---

## Products

### `GET /api/products`

Returns all products sorted by `sort_order`.

**Query params** | |
---|---
`category` | `varenyky`, `syrnyky`, `pelmeni` (optional, filter by category)

**Response:** `200`

```json
[
  {
    "id": 1,
    "name": "Classic Varenyky",
    "description": "Traditional Ukrainian dumplings",
    "price": 8.50,
    "unit": "/ 600g",
    "image": "/images/varenyky-classic.webp",
    "background_image": null,
    "badge": "Bestseller",
    "category": "varenyky",
    "available": true,
    "stock": 10,
    "sort_order": 1,
    "ingredients": "...",
    "cooking": "...",
    "ingredients_uk": "...",
    "ingredients_en": "...",
    "recipe_uk": "...",
    "recipe_en": "...",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

### `POST /api/products`

Create a new product. **Admin only.**

**Body (JSON):**

```json
{
  "name": "New Varenyky",
  "description": "Delicious",
  "price": 9.99,
  "category": "varenyky",
  "unit": "/ 600g",
  "image": "/images/new.webp",
  "badge": "New",
  "stock": 20,
  "sort_order": 5,
  "ingredients": "...",
  "cooking": "..."
}
```

**Response:** `201` — created product object

### `GET /api/products/[id]`

Get single product by ID.

**Response:** `200` — product object, or `404`

### `PUT /api/products/[id]`

Update a product. **Admin only.**

**Body:** partial product fields (same schema as POST).

**Response:** `200` — updated product

### `DELETE /api/products/[id]`

Delete a product. **Admin only.**

**Response:** `200` — `{ "message": "Product deleted successfully" }`

---

## Reviews

### `GET /api/reviews`

Returns approved reviews ordered by newest first.

**Query params** | |
---|---
`limit` | Number (default: 10)

**Response:** `200`

```json
[
  {
    "id": 1,
    "user_id": "uuid",
    "user_name": "John",
    "rating": 5,
    "comment": "Amazing!",
    "created_at": "..."
  }
]
```

### `POST /api/reviews`

Submit a review. **Auth required.** User must have at least one order.

**Body (JSON):**

```json
{
  "rating": 5,
  "comment": "Great food!",
  "user_name": "John"
}
```

**Response:** `201` — created review

### `PATCH /api/reviews/[id]`

Moderate a review (approve/reject). **Admin only.**

**Body:**

```json
{
  "approved": true
}
```

**Response:** `200` — updated review

### `DELETE /api/reviews/[id]`

Delete a review. **Admin only.**

**Response:** `200` — `{ "message": "Review deleted" }`

---

## Orders

### `GET /api/orders`

Get current user's orders. **Auth required.** Admin: returns all orders.

**Response:** `200`

```json
[
  {
    "id": "uuid",
    "status": "pending",
    "total": 25.00,
    "delivery_fee": 5.00,
    "items": [...],
    "created_at": "..."
  }
]
```

### `POST /api/orders`

Create an order. **Auth required.** Decrements stock immediately.

**Body (JSON):**

```json
{
  "items": [{ "product_id": 1, "qty": 2 }],
  "total": 17.00,
  "delivery_fee": 0,
  "delivery_address": "123 London St",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+44...",
  "notes": "Leave at door"
}
```

**Response:** `201` — created order with `{ order, paymentIntent }`

### `GET /api/orders/[id]`

Get order by ID. **Auth required** (own order or admin).

**Response:** `200` — order object

### `PATCH /api/orders/[id]`

Update order status. **Admin only.**

**Body:**

```json
{ "status": "confirmed" }
```

Valid statuses: `pending`, `confirmed`, `completed`, `cancelled`.  
Cancelling restores stock. Confirming sends email notification.

**Response:** `200` — updated order

---

## Payments

### `POST /api/create-payment-intent`

Create a Stripe PaymentIntent for an order. **Auth required.**

**Body:**

```json
{
  "orderId": "uuid",
  "items": [{ "product_id": 1, "qty": 2 }]
}
```

**Response:** `200` — `{ "clientSecret": "pi_..." }`

### `GET /api/payments/[orderId]`

Get payment status for an order. **Auth required.**

**Response:** `200` — payment object or `404`

### `POST /api/webhooks/stripe`

Stripe webhook endpoint. Public (verified by Stripe signature).  
Handles `payment_intent.succeeded` and `payment_intent.payment_failed`.

---

## Settings

### `GET /api/public-settings`

Public settings (no auth required).

**Response:** `200`

```json
{
  "delivery": { "min_order": 10, "free_threshold": 50, "fee": 5 },
  "categories": ["varenyky", "syrnyky", "pelmeni"],
  "categories_desc": { "varenyky": "Traditional dumplings..." },
  "promo_codes": [{ "code": "FREE10", "type": "free_delivery", "value": 0 }]
}
```

### `GET /api/settings`

Get all settings or filter by key. **Admin only.**

**Query params:** `key` (optional)

### `PUT /api/settings`

Upsert a setting. **Admin only.**

**Body:**

```json
{ "key": "delivery", "value": { "min_order": 15 } }
```

---

## Auth

### `POST /api/auth/signup`

Create a new account. Rate-limited: 3 req/min.

**Body:**

```json
{ "email": "user@example.com", "password": "..." }
```

**Response:** `201` — `{ "user": {...}, "session": {...} }`

### `POST /api/auth/login`

Sign in with email/password. Rate-limited: 10 req/min.

**Body:**

```json
{ "email": "user@example.com", "password": "..." }
```

**Response:** `200` — `{ "user": {...}, "session": {...} }`

### `POST /api/auth/logout`

Sign out current session.

**Response:** `200` — `{ "message": "Logged out" }`

### `GET /api/auth/user`

Get current user profile. **Auth required.**

**Response:** `200` — `{ "user": { "id": "uuid", "email": "...", "profile": { "role": "user" } } }`

---

## Admin

All admin routes require **admin role** (`Authorization: Bearer <token>`).

### `GET /api/admin/stats`

Dashboard statistics.

**Query params:** `period` = `day | week | month | year`

**Response:** orders count, revenue, new users, etc.

### `GET /api/admin/orders`

List all orders with filters.

**Query params:** `status`, `page`, `limit`, `from`, `to`, `search`

### `GET /api/admin/products`

List all products (including unavailable).

### `POST /api/admin/products`

Create product (alternative, uses admin panel).

### `GET /api/admin/reviews`

List all reviews (pending + approved).

### `GET /api/admin/settings`

Get all settings (admin-only keys included).

---

## Files

### `POST /api/upload`

Upload product image. **Admin only.** Saves to Supabase Storage bucket `product-images`.

**Body:** `multipart/form-data` with file field.

**Response:** `200` — `{ "url": "..." }`
