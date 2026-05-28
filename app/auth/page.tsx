"use client";

import * as React from 'react';
import { ForgotPasswordForm } from './forms/ForgotPasswordForm';
import { SignupForm } from './forms/SignupForm';
import { LoginForm } from './forms/LoginForm';
import { useSearchParams } from 'next/navigation';
import styles from './auth.module.css';

type AuthMode = 'login' | 'signup' | 'forgot';
function AuthContent() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get('mode');
  const [mode, setMode] = React.useState<AuthMode>('login');

  React.useEffect(() => {
    if (urlMode === 'signup') {
      setMode('signup');
    } else if (urlMode === 'forgot') {
      setMode('forgot');
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