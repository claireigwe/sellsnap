"use client";

import * as React from 'react';
import { Input } from '@/components/ui/Input';
import styles from './CheckoutModal.module.css';

type CheckoutModalProps = {
  onClose: () => void;
  onProceed: (name: string, email: string) => void;
  loading: boolean;
};

export function CheckoutModal({ onClose, onProceed, loading }: CheckoutModalProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  function validateEmail(value: string) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  }

  function handleProceed() {
    if (email && !validateEmail(email)) return;
    onProceed(name, email);
  }

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="checkout-heading">
        <div className={styles.icon}>📧</div>
        <h2 id="checkout-heading" className={styles.heading}>Almost there!</h2>
        <p className={styles.description}>
          Enter your email to receive a payment receipt and order updates. This is <strong>completely optional</strong> — you can skip and go straight to payment.
        </p>

        <div className={styles.field}>
          <label htmlFor="buyer-name" className={styles.label}>Your name (optional)</label>
          <Input
            id="buyer-name"
            type="text"
            placeholder="e.g. Chidi"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="buyer-email" className={styles.label}>Email address (optional)</label>
          <Input
            id="buyer-email"
            type="email"
            placeholder="e.g. you@example.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            error={!!emailError}
            disabled={loading}
          />
          {emailError && <span className={styles.error}>{emailError}</span>}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={handleProceed}
            disabled={loading || !!emailError}
          >
            {loading ? 'Processing...' : 'Make Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
