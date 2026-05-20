// Base path for GitHub Pages
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '' : '';

// Image helper
export function img(path: string) {
  return `${BASE_PATH}${path}`;
}

// Delivery settings
export const DELIVERY_SETTINGS = {
  MIN_ORDER: 10,
  FREE_THRESHOLD: 50,
  DELIVERY_FEE: 5,
} as const;

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Product categories
export const PRODUCT_CATEGORIES = {
  VARENYKY: 'varenyky',
  SYRNYKY: 'syrnyky',
  PELMENI: 'pelmeni',
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Rate limiting
export const RATE_LIMITS = {
  DEFAULT: { requests: 100, windowMs: 60000 }, // 100 requests per minute
  AUTH: { requests: 5, windowMs: 60000 }, // 5 requests per minute
  ORDERS: { requests: 10, windowMs: 60000 }, // 10 requests per minute
} as const;

// Email templates
export const EMAIL_TYPES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_STATUS_UPDATE: 'order_status_update',
  ADMIN_NOTIFICATION: 'admin_notification',
  WELCOME: 'welcome',
  LOW_STOCK_ALERT: 'low_stock_alert',
} as const;

// Stock alerts
export const LOW_STOCK_THRESHOLD = 5;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
