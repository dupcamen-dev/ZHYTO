import { NextRequest } from 'next/server';
import { ordersService } from '@/lib/services/orders.service';
import { productsService } from '@/lib/services/products.service';
import { paymentsService } from '@/lib/services/payments.service';
import { emailService } from '@/lib/services/email.service';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { CreateOrderSchema } from '@/lib/validations/order.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const orders = await ordersService.getUserOrders(user.id);
    return Response.json(orders);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    const validated = CreateOrderSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    // Перевірка наявності товарів
    const availability = await productsService.checkAvailability(validated.data.items);
    if (!availability.available) {
      throw new ValidationError(availability.errors.join(', '));
    }

    const order = await ordersService.createOrder(user.id, validated.data);

    if (body.skip_payment) {
      return Response.json({ order }, { status: 201 });
    }

    const payment = await paymentsService.createPaymentIntent(
      order.total + order.delivery_fee,
      'card',
      order.id
    );

    return Response.json({
      order,
      clientSecret: payment.clientSecret,
      paymentIntentId: payment.paymentIntentId,
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
