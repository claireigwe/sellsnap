"use client";

import * as React from 'react';
import { deleteProduct } from '@/app/(dashboard)/products/actions';
import { useRouter } from 'next/navigation';
import styles from './DeleteProductButton.module.css';

export function DeleteProductButton({ id, iconOnly, className }: { id: string, iconOnly?: boolean, className?: string }) {
  const [loading, setLoading] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const res = await deleteProduct(id);
    if (!res.ok) {
      alert(res.error.message);
    }
    setShowConfirm(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setShowConfirm(true)} 
        disabled={loading} 
        className={className} 
        aria-label="Delete product"
      >
        {loading ? '...' : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        )}
      </button>

      {showConfirm && (
        <div className={styles.overlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.title}>Delete Product</h3>
            <p className={styles.message}>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => setShowConfirm(false)} className={`${styles.button} ${styles.cancelButton}`}>
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={loading} className={`${styles.button} ${styles.deleteButton}`}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
