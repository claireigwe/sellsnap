import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifyTransaction } from '@/lib/flutterwave';
import { sendOrderNotificationEmail } from '@/lib/email';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('verif-hash');
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    const payload = await request.json();

    // Only process charge.completed with successful status
    if (payload.event !== 'charge.completed' || payload.data.status !== 'successful') {
      return NextResponse.json({ status: 'skipped' }, { status: 200 });
    }

    const transactionId = payload.data.id.toString();
    const txRef = payload.data.tx_ref;

    // Verify transaction with Flutterwave API to ensure it wasn't spoofed
    let verifiedTx;
    try {
      verifiedTx = await verifyTransaction(transactionId);
    } catch {
      return NextResponse.json({ status: 'error', message: 'Verification failed' }, { status: 502 });
    }

    if (verifiedTx.status !== 'successful') {
      return NextResponse.json({ status: 'error', message: 'Transaction not successful' }, { status: 400 });
    }

    if (verifiedTx.currency !== payload.data.currency) {
      return NextResponse.json({ status: 'error', message: 'Currency mismatch' }, { status: 400 });
    }

    let sellerEmail = '';
    let productName = '';
    let amountNaira = 0;
    let buyerEmail = payload.data.customer.email;

    // Use a transaction to ensure idempotency and atomic updates
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findUnique({
        where: { transactionReference: txRef },
        include: { payment: true, product: { include: { user: true } } },
      });

      if (!order) {
        throw new Error(`Order not found for tx_ref: ${txRef}`);
      }

      // Validate that the paid amount matches what the order expects
      const expectedNaira = order.amount / 100;
      if (verifiedTx.amount < expectedNaira) {
        throw new Error(`Underpayment detected: expected ₦${expectedNaira}, got ₦${verifiedTx.amount} for tx_ref ${txRef}`);
      }

      sellerEmail = order.product.user.email;
      productName = order.product.name;
      amountNaira = expectedNaira;
      buyerEmail = order.buyerEmail || buyerEmail;

      if (order.status === 'paid') return; // Idempotency check — already processed

      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'paid' },
      });

      // Create payment record
      if (!order.payment) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            gatewayReference: transactionId,
            status: 'successful',
            paidAt: new Date(),
          },
        });
      }
    });

    // Send email outside the transaction
    if (sellerEmail) {
      await sendOrderNotificationEmail(sellerEmail, buyerEmail, productName, amountNaira);
    }

    revalidatePath('/dashboard');
    revalidatePath('/orders');

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
