import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { supabase } from '@/lib/utils/supabase';
import { handleError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // Розрахунок дати початку періоду
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Загальний дохід
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total, delivery_fee')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const revenue = revenueData?.reduce(
      (sum, order) => sum + Number(order.total) + Number(order.delivery_fee),
      0
    ) || 0;

    // Кількість замовлень
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Популярні продукти
    const { data: orders } = await supabase
      .from('orders')
      .select('items')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const productStats: Record<string, { name: string; count: number }> = {};
    
    orders?.forEach(order => {
      order.items.forEach((item: any) => {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = { name: item.name, count: 0 };
        }
        productStats[item.product_id].count += item.quantity;
      });
    });

    const popularProducts = Object.entries(productStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({ id: Number(id), ...data }));

    // Статуси замовлень
    const { data: statusData } = await supabase
      .from('orders')
      .select('status')
      .gte('created_at', startDate.toISOString());

    const statusCounts = statusData?.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Response.json({
      revenue,
      ordersCount: ordersCount || 0,
      averageOrder: ordersCount ? revenue / ordersCount : 0,
      popularProducts,
      statusCounts,
      period,
    });
  } catch (error) {
    return handleError(error);
  }
}
