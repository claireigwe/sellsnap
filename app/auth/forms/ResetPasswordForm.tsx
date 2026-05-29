"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import styles from '../auth.module.css';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  if (!token) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>This password reset link is missing or invalid.</CardDescription>
        </CardHeader>
        <CardFooter className={styles.footer}>
          <p className={styles.footerText}>
            <button type="button" onClick={() => router.push('/auth?mode=forgot')} className={styles.link}>
              Request a new reset link
            </button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>Your password has been updated successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.success}>
            You can now log in with your new password.
          </div>
        </CardContent>
        <CardFooter className={styles.footer}>
          <p className={styles.footerText}>
            <button type="button" onClick={() => router.push('/auth')} className={styles.link}>
              Go to Login
            </button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error?.message || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>New Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}