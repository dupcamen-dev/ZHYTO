export type ProductCategory = 'varenyky' | 'syrnyky' | 'pelmeni';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  badge?: string | null;
  category: ProductCategory;
  available: boolean;
  stock: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  unit?: string;
  image?: string;
  badge?: string | null;
  category: ProductCategory;
  available?: boolean;
  stock?: number;
  sort_order?: number;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}
