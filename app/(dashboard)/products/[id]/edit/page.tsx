import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { EditProductForm } from './EditProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/auth');
  }

  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.userId !== userId) {
    notFound();
  }

  return (
    <EditProductForm product={product} />
  );
}
