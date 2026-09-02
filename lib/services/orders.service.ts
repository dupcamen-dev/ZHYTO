import { supabase } from '../utils/supabase';
import { Order, OrderInput, OrderStatus, OrderFilters } from '../types/order.types';
import { CartItem } from '../types/product.types';
import { NotFoundError } from '../utils/errors';

export const ordersService = {
  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Замовлення не знайдено');
    }

    return data;
  },

  async createOrder(userId: string, input: OrderInput): Promise<Order> {
    const total = this.calculateTotal(input.items);
    const deliveryFee = this.calculateDeliveryFee(total);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        items: input.items,
        total,
        delivery_fee: deliveryFee,
        status: 'pending',
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
        delivery_address: input.delivery_address,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundError('Замовлення не знайдено');
    }

    return data;
  },

  async getAllOrders(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    const { status, page = 1, limit = 20 } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      orders: data || [],
      total: count || 0,
    };
  },

  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  calculateDeliveryFee(total: number): number {
    // Отримуємо налаштування доставки з БД
    // Поки що використовуємо константи
    const MIN_ORDER = 10;
    const FREE_THRESHOLD = 50;
    const DELIVERY_FEE = 5;

    if (total < MIN_ORDER) {
      return 0; // Замовлення не проходить мінімум
    }

    if (total >= FREE_THRESHOLD) {
      return 0; // Безкоштовна доставка
    }

    return DELIVERY_FEE;
  },

  async getDeliverySettings() {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'delivery')
      .single();

    return data?.value || { min_order: 10, free_threshold: 50, fee: 5 };
  },
};
