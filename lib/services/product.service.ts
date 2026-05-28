import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { CreateProductInput } from "@/types";
import { Prisma } from "@prisma/client";

/**
 * ProductService encapsulates all business logic related to products.
 * It is independent of the web layer (actions/routes).
 */
export const ProductService = {
  async create(userId: string, data: CreateProductInput) {
    const uniqueSlug = nanoid(8);
    
    return await prisma.product.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        imageUrls: data.imageUrls ?? Prisma.DbNull,
        uniqueSlug,
      },
    });
  },

  async update(id: string, userId: string, data: CreateProductInput) {
    // Business rule: Verify ownership before update
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.userId !== userId) {
      throw new Error("Unauthorized or product not found");
    }

    return await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        imageUrls: data.imageUrls ?? product.imageUrls ?? Prisma.DbNull,
      },
    });
  },

  async delete(id: string, userId: string) {
    // Business rule: Verify ownership and check for orders
    const product = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } }
    });

    if (!product || product.userId !== userId) {
      throw new Error("Unauthorized or product not found");
    }

    if (product._count.orders > 0) {
      throw new Error("Cannot delete product with existing orders");
    }

    return await prisma.product.delete({
      where: { id },
    });
  }
};
