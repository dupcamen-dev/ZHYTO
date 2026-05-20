import { NextRequest } from 'next/server';
import { ordersService } from '@/lib/services/orders.service';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { OrderFiltersSchema } from '@/lib/validations/order.schema';
import { handleError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      fromDate: searchParams.get('from') || undefined,
      toDate: searchParams.get('to') || undefined,
    };

    const validated = OrderFiltersSchema.parse(filters);
    const result = await ordersService.getAllOrders(validated);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
