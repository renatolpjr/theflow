
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all lessons with progress count
    const lessons = await prisma.lesson.findMany({
      include: {
        _count: {
          select: {
            progress: true
          }
        }
      },
      orderBy: { lessonId: 'asc' }
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      lessonId,
      title,
      difficulty,
      topics,
      vocabulary,
      phrases,
      sentences,
      dialogues,
      exercises,
      speakingPrompts,
      isUnlocked,
      requiredLevel
    } = body;

    // Validate required fields
    if (!lessonId || !title || !difficulty) {
      return NextResponse.json({ 
        error: 'lessonId, title, and difficulty are required' 
      }, { status: 400 });
    }

    // Create new lesson
    const lesson = await prisma.lesson.create({
      data: {
        lessonId: parseInt(lessonId),
        title,
        difficulty,
        topics: topics || [],
        vocabulary: vocabulary || [],
        phrases: phrases || [],
        sentences: sentences || [],
        dialogues: dialogues || [],
        exercises: exercises || [],
        speakingPrompts: speakingPrompts || [],
        isUnlocked: isUnlocked !== undefined ? isUnlocked : true,
        requiredLevel: requiredLevel || 1
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
