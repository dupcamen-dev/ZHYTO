import { z } from 'zod';

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Мінімальна оцінка 1').max(5, 'Максимальна оцінка 5'),
  comment: z.string().min(10, 'Коментар має бути мінімум 10 символів').max(500, 'Коментар занадто довгий'),
});

export const ModerateReviewSchema = z.object({
  approved: z.boolean(),
});
