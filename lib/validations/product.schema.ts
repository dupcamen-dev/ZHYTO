import { z } from 'zod';

export const ProductCategorySchema = z.enum(['varenyky', 'syrnyky', 'pelmeni']);

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  unit: z.string(),
  image: z.string(),
  badge: z.string().nullable().optional(),
  category: ProductCategorySchema,
  available: z.boolean(),
  stock: z.number().int().min(0),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Назва обов\'язкова'),
  description: z.string().min(10, 'Опис має бути мінімум 10 символів'),
  price: z.number().positive('Ціна має бути позитивною'),
  unit: z.string().default('/ kg'),
  image: z.string().url('Невірний URL зображення').default('/images/hero-varenyky.jpg'),
  badge: z.string().nullable().optional(),
  category: ProductCategorySchema,
  available: z.boolean().default(true),
  stock: z.number().int().min(0, 'Залишок не може бути негативним').default(10),
  sort_order: z.number().int().default(0),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CartItemSchema = z.object({
  product_id: z.number().int().positive(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive('Кількість має бути більше 0'),
});
