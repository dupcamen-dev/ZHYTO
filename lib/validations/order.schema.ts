import { z } from 'zod';
import { CartItemSchema } from './product.schema';

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email'),
  customer_phone: z.string().optional(),
  delivery_address: z.string().min(5, 'Address must be at least 5 characters'),
  notes: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
});

export const OrderFiltersSchema = z.object({
  status: OrderStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
