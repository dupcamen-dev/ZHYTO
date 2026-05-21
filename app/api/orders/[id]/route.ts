import { NextRequest } from 'next/server';
import { ordersService } from '@/lib/services/orders.service';
import { emailService } from '@/lib/services/email.service';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { isAdmin } from '@/lib/middleware/admin.middleware';
import { UpdateOrderStatusSchema } from '@/lib/validations/order.schema';
import { handleError, ValidationError, AuthorizationError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const order = await ordersService.getOrderById(id);

    // Перевірка доступу
    const userIsAdmin = await isAdmin(user.id);
    if (order.user_id !== user.id && !userIsAdmin) {
      throw new AuthorizationError('Access denied');
    }

    return Response.json(order);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    
    const validated = UpdateOrderStatusSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    const order = await ordersService.updateOrderStatus(id, validated.data.status);

    // Відправка email про зміну статусу
    await emailService.sendOrderStatusUpdate(order);

    return Response.json(order);
  } catch (error) {
    return handleError(error);
  }
}
