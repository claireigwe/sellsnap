import * as React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.root}>
      <EmptyState
        title="Product not available"
        description="The product you are looking for does not exist or has been removed."
        action={
          <Link href="/" className={cn(buttonVariants({ variant: 'primary' }))}>
            Create your own store
          </Link>
        }
      />
    </div>
  );
}
