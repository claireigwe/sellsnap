import * as React from 'react';
import { formatPrice } from '@/lib/utils';
import styles from './PriceTag.module.css';

export function PriceTag({ priceKobo }: { priceKobo: number }) {
  return <span className={styles.price}>{formatPrice(priceKobo)}</span>;
}
