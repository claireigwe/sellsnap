import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { verifyTransaction } from '@/lib/flutterwave';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import { ConfettiEffect } from '@/components/features/ConfettiEffect';
import { formatPrice, cn } from '@/lib/utils';
import styles from './success.module.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tx_ref?: string; transaction_id?: string }>;
};

export default async function SuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tx_ref: txRef, transaction_id: transactionId } = await searchParams;

  let orderStatus: 'paid' | 'pending' | 'unknown' = 'unknown';

  const product = await prisma.product.findUnique({
    where: { uniqueSlug: slug },
    select: { id: true, name: true, imageUrl: true },
  });

  let order: { amount: number; transactionReference: string; buyerEmail: string | null } | null = null;

  if (txRef) {
    const found = await prisma.order.findUnique({
      where: { transactionReference: txRef },
      select: { status: true, amount: true, transactionReference: true, buyerEmail: true },
    });

    if (found) {
      orderStatus = found.status === 'paid' ? 'paid' : 'pending';
      order = found;
    }

    if (orderStatus === 'pending' && transactionId) {
      try {
        const verifiedTx = await verifyTransaction(transactionId);
        if (verifiedTx.status === 'successful') {
          await prisma.$transaction(async (tx) => {
            const currentOrder = await tx.order.findUnique({
              where: { transactionReference: txRef },
              include: { payment: true },
            });
            if (!currentOrder || currentOrder.status === 'paid') return;
            await tx.order.update({
              where: { id: currentOrder.id },
              data: { status: 'paid' },
            });
            if (!currentOrder.payment) {
              await tx.payment.create({
                data: {
                  orderId: currentOrder.id,
                  gatewayReference: transactionId,
                  status: 'successful',
                  paidAt: new Date(),
                },
              });
            }
          });
          orderStatus = 'paid';
        }
      } catch {
      }
    }
  }

  const paid = orderStatus === 'paid';
  const pending = orderStatus === 'pending';

  return (
    <>
      <ConfettiEffect trigger={paid} />
      <div className={styles.root}>
        <div className={styles.summary}>
          <div className={styles.statusHeader}>
            <div className={styles.statusIcon}>{paid ? '🎉' : pending ? '⏳' : '❓'}</div>
            <CardTitle>
              {paid ? 'Payment Successful!' : pending ? 'Payment Processing' : 'Payment Status Unknown'}
            </CardTitle>
          </div>

          {(paid || pending) && product && order ? (
            <Card className={styles.summaryCard}>
              <CardContent>
                <div className={styles.productRow}>
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={64}
                      height={64}
                      className={styles.productImage}
                    />
                  )}
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{product.name}</p>
                    <p className={styles.price}>{formatPrice(order.amount)}</p>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>Transaction Reference</p>
                  <p className={styles.detailValueMono}>{order.transactionReference}</p>
                </div>
                {order.buyerEmail && (
                  <div className={styles.detailRow}>
                    <p className={styles.detailLabel}>Buyer Email</p>
                    <p className={styles.detailValue}>{order.buyerEmail}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className={styles.summaryCard}>
              <CardContent>
                <p className={styles.statusMessage}>
                  We could not find this transaction. If you completed a payment, please contact the seller.
                </p>
              </CardContent>
            </Card>
          )}

          {paid && (
            <p className={styles.statusMessage}>
              Thank you for your purchase. Your payment was successful and the seller has been notified.
            </p>
          )}
          {pending && (
            <p className={styles.statusMessage}>
              We are confirming your payment. This usually takes a few seconds. Please check back shortly.
            </p>
          )}

          <div className={styles.actions}>
            {product && (
              <Link href={`/p/${slug}`} className={cn(buttonVariants({ variant: 'primary' }))}>
                {paid ? 'View Product' : 'Continue'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
