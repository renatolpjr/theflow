
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { watchedSeconds, lastPosition, completed, liked } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: params.id
        }
      },
      update: {
        watchedSeconds,
        lastPosition,
        completed: completed || false,
        liked: liked !== undefined ? liked : undefined,
        lastWatched: new Date()
      },
      create: {
        userId: user.id,
        videoId: params.id,
        watchedSeconds,
        lastPosition,
        completed: completed || false,
        liked: liked || false
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating video progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
