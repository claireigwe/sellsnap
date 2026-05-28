import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, onChange, value, defaultValue, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [filled, setFilled] = React.useState(!!value || !!defaultValue);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setFilled(e.target.value.length > 0);
      onChange?.(e);
    }

    return (
      <div className={styles.inputWrapper}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={cn(styles.input, error && styles.error, filled && styles.filled, className)}
          ref={inputRef}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          {...props}
        />
        {isPassword && props.id && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
