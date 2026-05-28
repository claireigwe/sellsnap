"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from '../auth.module.css';

export function CheckEmailForm({
  email,
  onBackToLogin,
}: {
  email: string;
  onBackToLogin: () => void;
}) {
  const [resent, setResent] = React.useState(false);

  async function handleResend() {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setResent(true);
    } catch {}
  }

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent a verification link to <strong>{email}</strong>.
          Click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.checkEmailInfo}>
          <div className={styles.checkEmailIcon}>📧</div>
          <p className={styles.checkEmailText}>
            Once verified, you can log in and start selling.
          </p>
          {resent && (
            <p className={styles.success}>Verification email resent!</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={handleResend}
          disabled={resent}
        >
          {resent ? 'Email sent!' : 'Resend verification email'}
        </Button>
      </CardContent>
      <CardFooter className={styles.footer}>
        <p className={styles.footerText}>
          Already verified?{' '}
          <button type="button" onMouseDown={onBackToLogin} className={styles.link}>Log in</button>
        </p>
      </CardFooter>
    </Card>
  );
}