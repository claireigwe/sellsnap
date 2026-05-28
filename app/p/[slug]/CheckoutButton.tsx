"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { CheckoutModal } from './CheckoutModal';

export function CheckoutButton({ productId, price }: { productId: string; price: number }) {
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  async function handleProceed(name: string, email: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, buyerName: name || undefined, buyerEmail: email || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Checkout failed');
      }

      window.location.href = data.paymentLink;
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
      setShowModal(false);
    }
  }

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setShowModal(true)} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </Button>

      {showModal && (
        <CheckoutModal
          onClose={() => setShowModal(false)}
          onProceed={handleProceed}
          loading={loading}
        />
      )}
    </>
  );
}
