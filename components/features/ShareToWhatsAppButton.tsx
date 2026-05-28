"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';

export function ShareToWhatsAppButton({ link, productName }: { link: string, productName: string }) {
  const handleShare = () => {
    const text = encodeURIComponent(`Check out ${productName} on SellSnap! Buy it here: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleShare}>
      Share to WhatsApp
    </Button>
  );
}
