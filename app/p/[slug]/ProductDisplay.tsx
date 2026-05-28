"use client";

import * as React from 'react';
import Image from 'next/image';
import { CheckoutButton } from './CheckoutButton';
import { Card } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import styles from './ProductDisplay.module.css';

type ProductDisplayProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string;
    imageUrls: unknown;
    user: {
      businessName: string;
    };
  };
};

export function ProductDisplay({ product }: ProductDisplayProps) {
  const allImages = React.useMemo(() => {
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls as string[];
    }
    return [product.imageUrl];
  }, [product.imageUrls, product.imageUrl]);

  const [activeIndex, setActiveIndex] = React.useState(0);

  function goTo(index: number) {
    setActiveIndex(index);
  }

  function goPrev() {
    setActiveIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  }

  function goNext() {
    setActiveIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  }

  return (
    <main className={styles.root}>
      <Card className={styles.container}>
        <div className={styles.imageSection}>
          <div className={styles.carousel}>
            <Image
              src={allImages[activeIndex]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
            />
            {allImages.length > 1 && (
              <>
                <button type="button" onClick={goPrev} className={`${styles.carouselBtn} ${styles.prevBtn}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button type="button" onClick={goNext} className={`${styles.carouselBtn} ${styles.nextBtn}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
                <div className={styles.thumbnails}>
                  {allImages.map((src, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`${styles.thumbnail} ${index === activeIndex ? styles.thumbnailActive : ''}`}
                    >
                      <Image src={src} alt={`${product.name} ${index + 1}`} fill sizes="60px" className={styles.thumbnailImage} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.infoSection}>
          <div className={styles.sellerInfo}>
            <div className={styles.avatar}>{product.user.businessName.charAt(0).toUpperCase()}</div>
            <span className={styles.businessName}>{product.user.businessName}</span>
          </div>
          
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          
          {product.description && (
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>
          )}
          
          <div className={styles.checkout}>
            <CheckoutButton productId={product.id} price={product.price} />
          </div>
        </div>
      </Card>
    </main>
  );
}
