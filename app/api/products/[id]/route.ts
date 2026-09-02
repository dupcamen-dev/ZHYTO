import { NextRequest } from 'next/server';
import { productsService } from '@/lib/services/products.service';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { UpdateProductSchema } from '@/lib/validations/product.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productsService.getProductById(Number(id));
    return Response.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    
    const validated = UpdateProductSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    const product = await productsService.updateProduct(Number(id), validated.data);
    return Response.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    await productsService.deleteProduct(Number(id));
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
