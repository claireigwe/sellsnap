"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createProductSchema, type CreateProductInput, type ActionResult } from "@/types";
import { ProductService } from "@/lib/services/product.service";

/**
 * ACTIONS: Handle the Request/Response layer
 * - Authentication
 * - Validation
 * - Revalidation
 * - Error mapping
 */

export async function createProduct(data: CreateProductInput): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, error: { code: 'unauthorized', message: 'Not logged in' } };
  }

  try {
    const validated = createProductSchema.safeParse(data);
    if (!validated.success) {
      return { ok: false, error: { code: 'validation_failed', message: 'Invalid input' } };
    }
    
    const product = await ProductService.create(userId, validated.data);
    
    revalidatePath('/products');
    revalidatePath('/dashboard');
    
    return { ok: true, data: { id: product.id } };
  } catch (error) {
    console.error('Create product error:', error);
    return { ok: false, error: { code: 'internal_error', message: 'Failed to create product' } };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, error: { code: 'unauthorized', message: 'Not logged in' } };
  }

  try {
    await ProductService.delete(id, userId);

    revalidatePath('/products');
    revalidatePath('/dashboard');

    return { ok: true };
  } catch (error: any) {
    console.error('Delete product error:', error);
    return { 
      ok: false, 
      error: { 
        code: error.message.includes('orders') ? 'has_orders' : 'internal_error', 
        message: error.message || 'Something went wrong' 
      } 
    };
  }
}

export async function updateProduct(id: string, data: CreateProductInput): Promise<ActionResult> {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, error: { code: 'unauthorized', message: 'Not logged in' } };
  }

  try {
    const validated = createProductSchema.safeParse(data);
    if (!validated.success) {
      return { ok: false, error: { code: 'validation_failed', message: 'Invalid input' } };
    }
    
    await ProductService.update(id, userId, validated.data);
    
    revalidatePath('/products');
    revalidatePath('/dashboard');
    
    return { ok: true };
  } catch (error: any) {
    console.error('Update product error:', error);
    return { ok: false, error: { code: 'internal_error', message: error.message || 'Something went wrong' } };
  }
}
