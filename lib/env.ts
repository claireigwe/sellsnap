import { z } from 'zod';

/**
 * Validated environment variables.
 * Validates all required env vars at boot so the app fails fast
 * instead of running in a half-configured state.
 */

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  FLW_SECRET_KEY: z.string().min(1, 'FLW_SECRET_KEY is required'),
  NEXT_PUBLIC_FLW_PUBLIC_KEY: z.string().min(1, 'NEXT_PUBLIC_FLW_PUBLIC_KEY is required'),
  FLW_SECRET_HASH: z.string().min(1, 'FLW_SECRET_HASH is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  SENDGRID_API_KEY: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables. Check server logs.');
  }

  return parsed.data;
}

export const env = validateEnv();
