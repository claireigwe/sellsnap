import { clsx, type ClassValue } from 'clsx';

/**
 * Merges class names using clsx.
 * This project uses CSS Modules (not Tailwind), so no Tailwind
 * class merging is needed. If you add Tailwind later, wrap clsx
 * with twMerge from tailwind-merge.
 *
 * @example
 * className={cn(styles.root, className)}
 * className={cn(button({ variant, size }), className)}
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formats a kobo amount as a Naira currency string.
 * Only use at the display layer — never store amounts in Naira.
 *
 * @example formatPrice(1500000) => "₦15,000"
 */
export function formatPrice(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG')}`;
}
