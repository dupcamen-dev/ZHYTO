import { supabase, getSupabaseAdmin } from '../utils/supabase';
import { Review, ReviewInput } from '../types/review.types';
import { NotFoundError } from '../utils/errors';

function getClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return supabase;
  }
}

export const reviewsService = {
  async getApprovedReviews(limit: number = 10): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createReview(userId: string, userName: string, input: ReviewInput): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        user_name: userName,
        rating: input.rating,
        comment: input.comment,
        approved: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async moderateReview(id: number, approved: boolean): Promise<Review> {
    const client = getClient();
    const { data, error } = await client
      .from('reviews')
      .update({ approved })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundError('Відгук не знайдено');
    }

    return data;
  },

  async deleteReview(id: number): Promise<void> {
    const client = getClient();
    const { data, error } = await client
      .from('reviews')
      .delete()
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      throw new NotFoundError('Відгук не знайдено');
    }
  },

  async getAllReviews(): Promise<Review[]> {
    const client = getClient();
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
