
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { level: true, id: true }
    });

    const where: any = {
      isActive: true,
      requiredLevel: { lte: user?.level || 1 }
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const videos = await prisma.videoLesson.findMany({
      where,
      include: {
        progress: {
          where: {
            userId: user?.id
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
