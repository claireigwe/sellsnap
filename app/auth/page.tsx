"use client";

import * as React from 'react';
import { ForgotPasswordForm } from './forms/ForgotPasswordForm';
import { SignupForm } from './forms/SignupForm';
import { LoginForm } from './forms/LoginForm';
import { CheckEmailForm } from './forms/CheckEmailForm';
import { ResetPasswordForm } from './forms/ResetPasswordForm';
import { useSearchParams } from 'next/navigation';
import styles from './auth.module.css';

type AuthMode = 'login' | 'signup' | 'forgot' | 'check-email' | 'reset';
function AuthContent() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get('mode');
  const email = searchParams.get('email') || '';
  const [mode, setMode] = React.useState<AuthMode>('login');

  React.useEffect(() => {
    if (urlMode === 'signup') {
      setMode('signup');
    } else if (urlMode === 'forgot') {
      setMode('forgot');
    } else if (urlMode === 'check-email') {
      setMode('check-email');
    } else if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [urlMode]);

  function switchToLogin() {
    setMode('login');
  }

  function switchToSignup() {
    setMode('signup');
  }

  return (
    <>
      {mode === 'signup' ? (
        <SignupForm onSwitchToLogin={switchToLogin} />
      ) : mode === 'forgot' ? (
        <ForgotPasswordForm onBackToLogin={switchToLogin} />
      ) : mode === 'check-email' ? (
        <CheckEmailForm email={email} onBackToLogin={switchToLogin} />
      ) : mode === 'reset' ? (
        <ResetPasswordForm />
      ) : (
        <LoginForm onSwitchToSignup={switchToSignup} />
      )}
    </>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <AuthContent />
    </React.Suspense>
  );
}