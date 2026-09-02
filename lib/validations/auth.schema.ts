import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email('Невірний email'),
  password: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
  name: z.string().min(2, 'Ім\'я має бути мінімум 2 символи'),
});

export const SignInSchema = z.object({
  email: z.string().email('Невірний email'),
  password: z.string().min(1, 'Пароль обов\'язковий'),
});
