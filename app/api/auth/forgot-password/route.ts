import { NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { authLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { allowed } = authLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: { message: 'Too many requests' } }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ ok: false, error: { message: 'Email is required' } }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const resetToken = randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ ok: false, error: { message: 'Something went wrong' } }, { status: 500 });
  }
}