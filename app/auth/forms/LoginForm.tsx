"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { loginSchema, type LoginInput } from '@/types';
import styles from '../auth.module.css';

export function LoginForm({
  onSwitchToSignup
}: {
  onSwitchToSignup: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; password?: string }>({});

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  function handleEmailBlur() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
    } else if (!emailRegex.test(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
  }

  function handlePasswordBlur() {
    if (!formData.password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    handleEmailBlur();
    handlePasswordBlur();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email) || !formData.password) {
      return;
    }

    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Login to manage your products and orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className={styles.form}>
          {registered && !error && (
            <div className={styles.success}>
              Account created successfully. Please log in.
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={handleEmailBlur}
              error={!!fieldErrors.email}
              required 
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={handlePasswordBlur}
              error={!!fieldErrors.password}
              required 
            />
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          <div className={styles.forgotPassword}>
            <button type="button" onClick={() => router.push('/auth?mode=forgot')} className={styles.link}>
              Forgot Password?
            </button>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className={styles.footer}>
        <p className={styles.footerText}>
          Don't have an account?{' '}
          <button type="button" onMouseDown={onSwitchToSignup} className={styles.link}>Sign up</button>
        </p>
      </CardFooter>
    </Card>
  );
}
