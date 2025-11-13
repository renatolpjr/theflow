
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const videos = await prisma.videoLesson.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { progress: true }
        }
      }
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await request.json();

    const video = await prisma.videoLesson.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        videoUrl: data.videoUrl,
        duration: data.duration,
        category: data.category,
        difficulty: data.difficulty,
        order: data.order || 0,
        tags: data.tags || [],
        transcript: data.transcript,
        resources: data.resources,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        requiredLevel: data.requiredLevel || 1,
        isPremium: data.isPremium || false,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
