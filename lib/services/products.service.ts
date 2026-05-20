import { supabase } from '../utils/supabase';
import { Product, ProductInput, ProductCategory, CartItem } from '../types/product.types';
import { NotFoundError, ValidationError } from '../utils/errors';

export const productsService = {
  async getAllProducts(category?: ProductCategory): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getProductById(id: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Продукт не знайдено');
    }

    return data;
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundError('Продукт не знайдено');
    }

    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStock(id: number, change: number): Promise<Product> {
    const product = await this.getProductById(id);
    const newStock = product.stock + change;

    if (newStock < 0) {
      throw new ValidationError('Недостатньо товару на складі');
    }

    return this.updateProduct(id, {
      stock: newStock,
      available: newStock > 0,
    });
  },

  async checkAvailability(items: CartItem[]): Promise<{ available: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const item of items) {
      const product = await this.getProductById(item.product_id);

      if (!product.available) {
        errors.push(`${product.name} недоступний`);
      } else if (product.stock < item.quantity) {
        errors.push(`${product.name}: недостатньо на складі (доступно: ${product.stock})`);
      }
    }

    return {
      available: errors.length === 0,
      errors,
    };
  },
};
