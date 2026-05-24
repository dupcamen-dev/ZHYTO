import { z } from 'zod';

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  comment: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long'),
});

export const ModerateReviewSchema = z.object({
  approved: z.boolean(),
});
