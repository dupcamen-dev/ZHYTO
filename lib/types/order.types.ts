import { CartItem } from './product.types';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  delivery_fee: number;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  delivery_address: string;
  notes?: string | null;
  created_at: string;
}

export interface OrderInput {
  items: CartItem[];
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}
