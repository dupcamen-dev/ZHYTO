const store = new Map<string, { timestamps: number[]; cleanupAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.cleanupAt) {
      store.delete(key);
    } else {
      const recent = entry.timestamps.filter(t => now - t < 60_000);
      if (recent.length === 0) {
        store.delete(key);
      } else {
        entry.timestamps = recent;
      }
    }
  }
}, 60_000).unref();

export function rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key) || { timestamps: [], cleanupAt: now + windowMs };
  const recent = entry.timestamps.filter(t => now - t < windowMs);

  if (recent.length >= maxAttempts) {
    entry.timestamps = [...recent, now];
    store.set(key, entry);
    return false;
  }

  entry.timestamps = [...recent, now];
  entry.cleanupAt = now + windowMs;
  store.set(key, entry);
  return true;
}

export function rateLimitMiddleware(key: string, maxAttempts = 5, windowMs = 60_000) {
  if (!rateLimit(key, maxAttempts, windowMs)) {
    return Response.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    );
  }
  return null;
}

export function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
