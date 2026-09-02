import { NextRequest } from 'next/server';
import { productsService } from '@/lib/services/products.service';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { CreateProductSchema } from '@/lib/validations/product.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';
import { ProductCategory } from '@/lib/types/product.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ProductCategory | null;

    const products = await productsService.getAllProducts(category || undefined);

    return Response.json(products);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    
    const validated = CreateProductSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    const product = await productsService.createProduct(validated.data);

    return Response.json(product, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
