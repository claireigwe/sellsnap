import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_');

    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    // Use Vercel Blob if a valid token is provided
    if (token && token !== 'your_vercel_blob_token') {
      if (!request.body) {
        return NextResponse.json({ error: 'Body is required' }, { status: 400 });
      }
      
      const blob = await put(safeFilename, request.body, {
        access: 'public',
      });
      return NextResponse.json(blob);
    } 
    
    // Local fallback for development without Vercel Blob
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uniqueFilename = `${Date.now()}-${safeFilename}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);
    
    return NextResponse.json({ url: `/uploads/${uniqueFilename}` });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
