import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    await prisma.product.update({
      where: { uniqueSlug: resolvedParams.slug },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update view count:', error);
    // Return 200 anyway so we don't block or show errors to the user for a non-critical analytics feature
    return NextResponse.json({ success: false });
  }
}
