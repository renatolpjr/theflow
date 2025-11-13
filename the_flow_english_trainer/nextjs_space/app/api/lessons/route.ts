
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check level
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all lessons with user progress
    const lessons = await prisma.lesson.findMany({
      include: {
        progress: {
          where: { userId: user.id },
          select: {
            completed: true,
            score: true,
            timeSpent: true,
            attempts: true,
            lastAttempt: true,
            vocabularyComplete: true,
            speakingComplete: true,
            listeningComplete: true,
            exercisesComplete: true
          }
        }
      },
      orderBy: { lessonId: 'asc' }
    });

    // Transform lessons with progress data
    const lessonsWithProgress = lessons.map(lesson => {
      const userProgress = lesson.progress[0]; // Get user's progress for this lesson
      const isLocked = lesson.requiredLevel > user.level;

      return {
        id: lesson.id,
        lessonId: lesson.lessonId,
        title: lesson.title,
        difficulty: lesson.difficulty,
        topics: lesson.topics,
        isUnlocked: lesson.isUnlocked && !isLocked,
        requiredLevel: lesson.requiredLevel,
        isLocked,
        progress: userProgress ? {
          completed: userProgress.completed,
          score: userProgress.score,
          timeSpent: userProgress.timeSpent,
          attempts: userProgress.attempts,
          lastAttempt: userProgress.lastAttempt,
          vocabularyComplete: userProgress.vocabularyComplete,
          speakingComplete: userProgress.speakingComplete,
          listeningComplete: userProgress.listeningComplete,
          exercisesComplete: userProgress.exercisesComplete
        } : null,
        // Include counts for progress calculation
        vocabularyCount: Array.isArray(lesson.vocabulary) ? lesson.vocabulary.length : 0,
        exerciseCount: Array.isArray(lesson.exercises) ? lesson.exercises.length : 0,
        speakingPromptCount: lesson.speakingPrompts?.length || 0,
        sentenceCount: Array.isArray(lesson.sentences) ? lesson.sentences.length : 0
      };
    });

    return NextResponse.json(lessonsWithProgress);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
