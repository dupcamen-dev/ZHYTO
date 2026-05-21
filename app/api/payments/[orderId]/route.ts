import { NextRequest } from 'next/server';
import { paymentsService } from '@/lib/services/payments.service';
import { ordersService } from '@/lib/services/orders.service';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { isAdmin } from '@/lib/middleware/admin.middleware';
import { handleError, AuthorizationError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    
    const order = await ordersService.getOrderById(orderId);

    // Перевірка доступу
    const userIsAdmin = await isAdmin(user.id);
    if (order.user_id !== user.id && !userIsAdmin) {
      throw new AuthorizationError('Access denied');
    }

    // TODO: Зберігати payment_intent_id в БД
    // Поки що повертаємо статус замовлення
    return Response.json({
      orderId: order.id,
      status: order.status,
      total: order.total + order.delivery_fee,
    });
  } catch (error) {
    return handleError(error);
  }
}
