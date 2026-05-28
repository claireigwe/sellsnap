"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import styles from '../auth.module.css';

export function ForgotPasswordForm({
  onBackToLogin
}: {
  onBackToLogin: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!data.ok) {
        setError(data.error?.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We sent a password reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.success}>
            Please check your email and click the link to reset your password.
          </div>
        </CardContent>
        <CardFooter className={styles.footer}>
          <p className={styles.footerText}>
            <button type="button" onClick={onBackToLogin} className={styles.link}>Back to Login</button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <Input id="email" name="email" type="email" required />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className={styles.footer}>
        <p className={styles.footerText}>
          Remember your password?{' '}
          <button type="button" onClick={onBackToLogin} className={styles.link}>Login</button>
        </p>
      </CardFooter>
    </Card>
  );
}
