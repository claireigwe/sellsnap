"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { signupUser } from '../signup/actions';
import { signupSchema, type SignupInput } from '@/types';
import styles from '../auth.module.css';

type SignupStep = 1 | 2;

function SignupStepIndicator({ currentStep }: { currentStep: SignupStep }) {
  return (
    <div className={styles.stepIndicator}>
      <div className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''}`}>
        <span className={styles.stepNumber}>1</span>
        <span className={styles.stepLabel}>Your details</span>
      </div>
      <div className={styles.stepLine} />
      <div className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''}`}>
        <span className={styles.stepNumber}>2</span>
        <span className={styles.stepLabel}>Business info</span>
      </div>
    </div>
  );
}

export function SignupForm({
  onSwitchToLogin
}: {
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const [step, setStep] = React.useState<SignupStep>(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [emailBlurred, setEmailBlurred] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    businessName: '',
    password: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  function handleNameBlur() {
    if (!formData.name.trim()) {
      setFieldErrors(prev => ({ ...prev, name: 'This field cannot be empty' }));
    } else {
      const letterCount = (formData.name.match(/[a-zA-Z]/g) || []).length;
      if (letterCount < 2) {
        setFieldErrors(prev => ({ ...prev, name: 'Full name must be up to 2 letters' }));
      }
    }
  }

  function handleEmailBlur() {
    setEmailBlurred(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'This field cannot be empty' }));
    } else if (!emailRegex.test(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
  }

  function handlePasswordBlur() {
    if (!formData.password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    if (formData.password.length < 8) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
    } else if (!/[A-Z]/.test(formData.password)) {
      setFieldErrors(prev => ({ ...prev, password: 'Must contain an uppercase letter' }));
    } else if (!/[a-z]/.test(formData.password)) {
      setFieldErrors(prev => ({ ...prev, password: 'Must contain a lowercase letter' }));
    } else if (!/[0-9]/.test(formData.password)) {
      setFieldErrors(prev => ({ ...prev, password: 'Must contain a number' }));
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      setFieldErrors(prev => ({ ...prev, password: 'Must contain a special character' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
    
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }

  function handleConfirmPasswordBlur() {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const errors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) {
      errors.name = fieldErrors.name || 'Fields cannot be empty';
    } else {
      const letterCount = (formData.name.match(/[a-zA-Z]/g) || []).length;
      if (letterCount < 2) {
        errors.name = 'Full name must be up to 2 letters';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'This field cannot be empty';
    } else {
      if (!formData.email.includes('@')) {
        errors.email = 'Please enter a valid email';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.email = 'Please enter a valid email';
        }
      }
    }

    if (errors.name || errors.email) {
      setFieldErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setFieldErrors({});
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    handlePasswordBlur();
    handleConfirmPasswordBlur();
    
    if (
      !formData.password ||
      formData.password.length < 8 || 
      !/[A-Z]/.test(formData.password) || 
      !/[a-z]/.test(formData.password) || 
      !/[0-9]/.test(formData.password) || 
      !/[^A-Za-z0-9]/.test(formData.password)
    ) {
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setLoading(true);

    const data = {
      name: formData.name,
      email: formData.email,
      businessName: formData.businessName,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    } as SignupInput;

    const validated = signupSchema.safeParse(data);
    if (!validated.success) {
      setError(validated.error.issues[0]?.message || 'Invalid input');
      setLoading(false);
      return;
    }

    try {
      const res = await signupUser(data);
      if (!res.ok) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      router.push(`/auth?mode=check-email&email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }

  function goBack() {
    setStep(1);
  }

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start selling in seconds with just a link.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupStepIndicator currentStep={step} />
        
        {error && <div className={styles.error}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Enter Full Name</label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={handleNameBlur}
                ref={nameInputRef}
                error={!!fieldErrors.name}
              />
              {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Enter Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={handleEmailBlur}
                error={!!fieldErrors.email}
              />
              {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              Continue
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="businessName" className={styles.label}>Business Name</label>
              <Input 
                id="businessName" 
                name="businessName" 
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required 
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Choose Password</label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={handlePasswordBlur}
                error={!!fieldErrors.password}
                required minLength={8} 
              />
              {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={handleConfirmPasswordBlur}
                error={!!fieldErrors.confirmPassword}
                required minLength={8} 
              />
              {fieldErrors.confirmPassword && <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
            </div>

            <div className={styles.buttonRow}>
              <Button type="button" variant="ghost" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" fullWidth={false} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className={styles.footer}>
        <p className={styles.footerText}>
          Already have an account?{' '}
          <button type="button" onMouseDown={onSwitchToLogin} className={styles.link}>Login</button>
        </p>
      </CardFooter>
    </Card>
  );
}
