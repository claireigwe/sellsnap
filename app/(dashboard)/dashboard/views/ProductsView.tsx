import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/features/ProductCard';
import { cn } from '@/lib/utils';
import styles from '../../products/page.module.css';

export default async function ProductsView() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  const products = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <Link href="/products/new" className={cn(buttonVariants({ variant: 'primary' }))}>
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className={styles.card}>
          <EmptyState
            title="No products yet"
            description={
              <>
                Create your first product to generate a payment link.<br />
                Share it anywhere to start selling instantly.
              </>
            }
            action={
              <Link href="/products/new" className={cn(buttonVariants({ variant: 'primary' }))}>
                Add Product
              </Link>
            }
          />
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
