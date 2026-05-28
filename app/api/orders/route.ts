import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generatePaymentLink } from '@/lib/flutterwave';
import { createOrderSchema } from '@/types';
import { nanoid } from 'nanoid';
import { orderLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { allowed } = orderLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: { message: 'Too many requests' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = createOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { message: 'Invalid input' } },
        { status: 400 }
      );
    }

    const { productId, buyerName, buyerEmail } = validated.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { user: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: { message: 'Product not found' } },
        { status: 404 }
      );
    }

    const tx_ref = `txn_${nanoid(16)}`;

    const order = await prisma.order.create({
      data: {
        productId,
        buyerName,
        buyerEmail,
        amount: product.price,
        status: 'pending',
        transactionReference: tx_ref,
      },
    });

    const nairaAmount = product.price / 100;
    
    const paymentLink = await generatePaymentLink({
      tx_ref,
      amount: nairaAmount,
      currency: 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/p/${product.uniqueSlug}/success`,
      customer: {
        email: buyerEmail || 'anonymous@sellsnap.app',
      },
      customizations: {
        title: product.user.businessName,
        logo: product.imageUrl,
      },
    });

    return NextResponse.json({ paymentLink, orderId: order.id });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Failed to create order' } },
      { status: 500 }
    );
  }
}
