import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ ok: false, error: { message: 'Token and password are required' } }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: { message: 'Password must be at least 8 characters' } }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: { message: 'Invalid or expired reset link' } }, { status: 400 });
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return NextResponse.json({ ok: false, error: { message: 'Reset link has expired' } }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ ok: false, error: { message: 'Something went wrong' } }, { status: 500 });
  }
}