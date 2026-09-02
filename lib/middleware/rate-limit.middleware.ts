// Простий in-memory rate limiter
// Для production краще використовувати Redis

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(requests: number = 10, windowMs: number = 60000) {
  return (request: Request) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}`;
    const now = Date.now();

    if (!store[key] || store[key].resetAt < now) {
      store[key] = {
        count: 1,
        resetAt: now + windowMs,
      };
      return true;
    }

    if (store[key].count >= requests) {
      return false;
    }

    store[key].count++;
    return true;
  };
}

// Очищення старих записів кожні 5 хвилин
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);
