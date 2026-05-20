export interface Review {
  id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}
