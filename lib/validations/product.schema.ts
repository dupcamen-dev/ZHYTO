import { z } from 'zod';

export const ProductCategorySchema = z.enum(['varenyky', 'syrnyky', 'pelmeni']);

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_uk: z.string().nullable().optional(),
  name_en: z.string().nullable().optional(),
  description: z.string(),
  description_uk: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
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
  name: z.string().min(1, 'Name is required'),
  name_uk: z.string().optional(),
  name_en: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  description_uk: z.string().optional(),
  description_en: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  unit: z.string().default('/ kg'),
  image: z.string().url('Invalid image URL').default('/images/hero-varenyky.jpg'),
  badge: z.string().nullable().optional(),
  category: ProductCategorySchema,
  available: z.boolean().default(true),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(10),
  sort_order: z.number().int().default(0),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CartItemSchema = z.object({
  product_id: z.number().int().positive(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});
