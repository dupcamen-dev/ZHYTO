# 📚 Приклади використання API

## Аутентифікація

### Реєстрація

```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'Іван Петренко',
  }),
});

const { user, session } = await response.json();
// Зберегти session.access_token для подальших запитів
```

### Вхід

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const { user, session } = await response.json();
```

### Отримання поточного користувача

```typescript
const response = await fetch('/api/auth/user', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { user } = await response.json();
```

---

## Продукти

### Отримати всі продукти

```typescript
const response = await fetch('/api/products');
const products = await response.json();
```

### Отримати продукти за категорією

```typescript
const response = await fetch('/api/products?category=varenyky');
const products = await response.json();
```

### Отримати один продукт

```typescript
const response = await fetch('/api/products/1');
const product = await response.json();
```

### Створити продукт (Admin)

```typescript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Вареники з картоплею',
    description: 'Класичні українські вареники',
    price: 12,
    category: 'varenyky',
    stock: 50,
  }),
});

const product = await response.json();
```

---

## Замовлення

### Створити замовлення

```typescript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      { product_id: 1, name: 'Вареники з картоплею', price: 12, quantity: 2 },
      { product_id: 2, name: 'Вареники з капустою', price: 12, quantity: 1 },
    ],
    customer_name: 'Іван Петренко',
    customer_email: 'user@example.com',
    customer_phone: '+380501234567',
    delivery_address: 'вул. Хрещатик, 1, Київ',
    notes: 'Додзвоніться за 30 хв',
  }),
});

const { order, clientSecret } = await response.json();

// Використати clientSecret для Stripe payment
```

### Отримати мої замовлення

```typescript
const response = await fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const orders = await response.json();
```

### Отримати одне замовлення

```typescript
const response = await fetch(`/api/orders/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const order = await response.json();
```

---

## Платежі (Stripe)

### Повний процес оплати

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ orderId, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      console.error(error);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Оплата успішна!');
      // Redirect to success page
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Оплатити
      </button>
    </form>
  );
}

// В компоненті
<Elements stripe={stripePromise}>
  <CheckoutForm orderId={order.id} clientSecret={clientSecret} />
</Elements>
```

---

## Відгуки

### Отримати відгуки

```typescript
const response = await fetch('/api/reviews?limit=10');
const reviews = await response.json();
```

### Додати відгук

```typescript
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rating: 5,
    comment: 'Дуже смачні вареники!',
    user_name: 'Іван Петренко',
  }),
});

const review = await response.json();
```

---

## Адмін панель

### Отримати всі замовлення

```typescript
const response = await fetch('/api/admin/orders?status=pending&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { orders, total } = await response.json();
```

### Оновити статус замовлення

```typescript
const response = await fetch(`/api/orders/${orderId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'completed',
  }),
});

const order = await response.json();
```

### Отримати статистику

```typescript
const response = await fetch('/api/admin/stats?period=week', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const stats = await response.json();
// { revenue, ordersCount, averageOrder, popularProducts, statusCounts }
```

---

## Налаштування

### Отримати налаштування доставки

```typescript
const response = await fetch('/api/settings?key=delivery');
const settings = await response.json();
// { key: 'delivery', value: { min_order: 10, free_threshold: 50, fee: 5 } }
```

### Оновити налаштування (Admin)

```typescript
const response = await fetch('/api/settings', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    key: 'delivery',
    value: {
      min_order: 15,
      free_threshold: 60,
      fee: 7,
    },
  }),
});

const settings = await response.json();
```

---

## Обробка помилок

```typescript
try {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Щось пішло не так');
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('Помилка:', error.message);
  // Показати повідомлення користувачу
}
```

---

## React Hook приклад

```typescript
// hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';

export function useOrders(accessToken: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [accessToken]);

  return { orders, loading, error };
}

// Використання
function OrdersPage() {
  const { orders, loading, error } = useOrders(session.access_token);

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.customer_name}</div>
      ))}
    </div>
  );
}
```
