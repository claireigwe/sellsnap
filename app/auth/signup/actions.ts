"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema, type SignupInput, type ActionResult } from "@/types";
import { headers } from "next/headers";
import { authLimiter } from "@/lib/rate-limit";

export async function signupUser(data: SignupInput): Promise<ActionResult> {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';
    const { allowed } = authLimiter.check(ip);
    if (!allowed) {
      return { ok: false, error: { code: 'rate_limited', message: 'Too many requests' } };
    }

    const validated = signupSchema.safeParse(data);
    
    if (!validated.success) {
      return { ok: false, error: { code: 'validation_failed', message: 'Invalid input' } };
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });
    
    if (existingUser) {
      return { ok: false, error: { code: 'email_taken', message: 'Email is already in use' } };
    }
    
    const passwordHash = await hash(validated.data.password, 12);
    
    await prisma.user.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        businessName: validated.data.businessName,
        passwordHash,
      },
    });
    
    return { ok: true };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { ok: false, error: { code: 'internal_error', message: error.message || 'Something went wrong' } };
  }
}