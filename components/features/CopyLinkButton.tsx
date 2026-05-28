"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';

export function CopyLinkButton({ link, className }: { link: string, className?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy} className={className}>
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
}
