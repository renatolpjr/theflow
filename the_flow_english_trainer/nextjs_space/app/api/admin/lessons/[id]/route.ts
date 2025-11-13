
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update lesson
    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(lessonId !== undefined && { lessonId: parseInt(lessonId) }),
        ...(title && { title }),
        ...(difficulty && { difficulty }),
        ...(topics !== undefined && { topics }),
        ...(vocabulary !== undefined && { vocabulary }),
        ...(phrases !== undefined && { phrases }),
        ...(sentences !== undefined && { sentences }),
        ...(dialogues !== undefined && { dialogues }),
        ...(exercises !== undefined && { exercises }),
        ...(speakingPrompts !== undefined && { speakingPrompts }),
        ...(isUnlocked !== undefined && { isUnlocked }),
        ...(requiredLevel !== undefined && { requiredLevel })
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete lesson
    await prisma.lesson.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
