import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProductDisplay } from './ProductDisplay';
import { ViewTracker } from '@/components/features/ViewTracker';
import { Card } from '@/components/ui/Card';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { uniqueSlug: resolvedParams.slug },
    include: { user: true },
  });

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: [product.imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description ?? undefined,
      images: [product.imageUrl],
    },
  };
}

export default async function PublicProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { uniqueSlug: resolvedParams.slug },
    include: { user: true },
  });

  if (!product) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <Card style={{ textAlign: 'center', padding: '48px 24px', width: '100%', maxWidth: '500px' }}>
          <h1 style={{ fontFamily: 'var(--headline-medium-font-family)', fontSize: 'var(--headline-medium-font-size)', fontWeight: 600, color: 'var(--color-on-surface)', margin: '0 0 12px' }}>Product not available</h1>
          <p style={{ fontFamily: 'var(--body-large-font-family)', fontSize: 'var(--body-large-font-size)', color: 'var(--color-on-surface-variant)', margin: 0 }}>This product is no longer available.</p>
        </Card>
      </main>
    );
  }

  return (
    <>
      <ViewTracker slug={resolvedParams.slug} />
      <ProductDisplay product={product} />
    </>
  );
}
