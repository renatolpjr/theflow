
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate S3 key
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `uploads/audio/${timestamp}-${filename}`;
    
    // Upload to S3
    const cloud_storage_path = await uploadFile(buffer, s3Key);

    return NextResponse.json({ 
      success: true,
      cloud_storage_path,
      filename: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
