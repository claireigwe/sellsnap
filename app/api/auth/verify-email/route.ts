import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth?error=missing_token', request.url));
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth?error=invalid_token', request.url));
    }

    if (user.emailVerified) {
      return NextResponse.redirect(new URL('/auth?verified=already', request.url));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    });

    return NextResponse.redirect(new URL('/auth?verified=1', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth?error=verification_failed', request.url));
  }
}