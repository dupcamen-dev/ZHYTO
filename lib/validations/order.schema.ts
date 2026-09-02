import { z } from 'zod';
import { CartItemSchema } from './product.schema';

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Кошик не може бути порожнім'),
  customer_name: z.string().min(2, 'Ім\'я має бути мінімум 2 символи'),
  customer_email: z.string().email('Невірний email'),
  customer_phone: z.string().optional(),
  delivery_address: z.string().min(10, 'Адреса має бути мінімум 10 символів'),
  notes: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
});

export const OrderFiltersSchema = z.object({
  status: OrderStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
