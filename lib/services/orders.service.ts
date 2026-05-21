import { supabase, getSupabaseAdmin } from '../utils/supabase';
import { Order, OrderInput, OrderStatus, OrderFilters } from '../types/order.types';
import { CartItem } from '../types/product.types';
import { NotFoundError, ValidationError } from '../utils/errors';

export const ordersService = {
  async getUserOrders(userId: string): Promise<Order[]> {
    let client = supabase;
    try {
      client = getSupabaseAdmin();
    } catch {
      // fallback to anon client (will be limited by RLS)
    }
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrderById(id: string): Promise<Order> {
    let client = supabase;
    try {
      client = getSupabaseAdmin();
    } catch {
      // fallback
    }
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundError('Замовлення не знайдено');
    }

    return data;
  },

  async createOrder(userId: string, input: OrderInput): Promise<Order> {
    const total = this.calculateTotal(input.items);
    const deliveryFee = await this.calculateDeliveryFee(total);

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
    const adminClient = getSupabaseAdmin();
    const client = adminClient;

    // Get the old order before updating
    const { data: oldOrder } = await client
      .from('orders')
      .select('status, items')
      .eq('id', id)
      .maybeSingle();

    if (!oldOrder) {
      throw new NotFoundError('Замовлення не знайдено');
    }

    const oldStatus = oldOrder.status;

    const { data, error } = await client
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundError('Замовлення не знайдено');
    }

    const shouldDecrement = (status === 'confirmed' || status === 'completed')
      && oldStatus !== 'confirmed' && oldStatus !== 'completed'
      && data.items?.length;

    if (shouldDecrement) {
      for (const item of data.items) {
        const { data: product } = await client
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .maybeSingle();
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          const { error: updateErr } = await client
            .from('products')
            .update({ stock: newStock, available: newStock > 0, updated_at: new Date().toISOString() })
            .eq('id', item.product_id);
          if (updateErr) console.error('Stock decrement failed:', updateErr);
        }
      }
    }

    // Restore stock when cancelled
    if (status === 'cancelled' && data.items?.length) {
      for (const item of data.items) {
        const { data: product } = await client
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .maybeSingle();
        if (product) {
          const newStock = product.stock + item.quantity;
          const { error: updateErr } = await client
            .from('products')
            .update({ stock: newStock, available: true, updated_at: new Date().toISOString() })
            .eq('id', item.product_id);
          if (updateErr) console.error('Stock restore failed:', updateErr);
        }
      }
    }

    return data;
  },

  async getAllOrders(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    let client = supabase;
    try {
      client = getSupabaseAdmin();
    } catch {
      // fallback
    }
    const { status, page = 1, limit = 20, fromDate, toDate } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = client
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    if (toDate) {
      query = query.lte('created_at', toDate);
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

  async calculateDeliveryFee(total: number): Promise<number> {
    const settings = await this.getDeliverySettings();

    if (total < settings.min_order) {
      return 0;
    }

    if (total >= settings.free_threshold) {
      return 0;
    }

    return settings.fee;
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
