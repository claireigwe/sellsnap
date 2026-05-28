import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCardSkeleton } from '@/components/features/ProductCardSkeleton';
import styles from './loading.module.css';

export default function ProductsLoading() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Skeleton variant="text" className={styles.title} />
        <Skeleton className={styles.button} />
      </div>

      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
