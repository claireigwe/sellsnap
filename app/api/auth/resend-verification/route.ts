import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 });
    }

    const emailVerificationToken = nanoid(32);

    await prisma.user.update({
      where: { email },
      data: { emailVerificationToken },
    });

    await sendVerificationEmail(email, emailVerificationToken);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Failed to resend' }, { status: 500 });
  }
}