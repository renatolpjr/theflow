
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check level
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { level: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    // Build filter conditions
    const where: any = {
      isActive: true,
      requiredLevel: {
        lte: user.level
      }
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (category) {
      where.category = category;
    }

    // Get user ID first
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch exercises with user attempts
    const exercises = await prisma.speakingExercise.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        attempts: {
          where: {
            userId: dbUser.id
          },
          orderBy: { completedAt: 'desc' },
          take: 1
        },
        _count: {
          select: { attempts: true }
        }
      }
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching speaking exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch speaking exercises' },
      { status: 500 }
    );
  }
}
