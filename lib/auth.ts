import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { authConfig } from '@/auth.config';
import { loginSchema } from '@/types';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        
        if (!validated.success) return null;

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const isValid = await compare(password, user.passwordHash);

        if (!isValid) return null;

        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          businessName: user.businessName,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
});

/**
 * Helper to get the current session.
 * Use in server components and server actions.
 */
export async function getSession() {
  const session = await auth();
  return session;
}
