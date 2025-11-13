
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        progress: {
          include: {
            lesson: {
              select: {
                title: true,
                difficulty: true,
              }
            }
          }
        },
        userBadges: {
          include: {
            badge: true
          }
        },
        exerciseAttempts: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate stats
    const totalLessons = await prisma.lesson.count();
    const completedLessons = user.progress.filter(p => p.completed).length;
    const totalExercises = user.exerciseAttempts.length;
    const correctExercises = user.exerciseAttempts.filter(e => e.isCorrect).length;
    const accuracy = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0;

    // Recent activity
    const recentProgress = user.progress
      .sort((a, b) => new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime())
      .slice(0, 5);

    // Get leaderboard position
    const usersWithHigherPoints = await prisma.user.count({
      where: {
        totalPoints: {
          gt: user.totalPoints
        }
      }
    });

    const stats = {
      user: {
        name: user.name,
        email: user.email,
        totalPoints: user.totalPoints,
        level: user.level,
        streak: user.streak,
        leaderboardPosition: usersWithHigherPoints + 1
      },
      progress: {
        totalLessons,
        completedLessons,
        completionPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        totalExercises,
        accuracy
      },
      badges: user.userBadges.length,
      recentActivity: recentProgress.map(p => ({
        lessonTitle: p.lesson.title,
        difficulty: p.lesson.difficulty,
        score: p.score,
        completed: p.completed,
        lastAttempt: p.lastAttempt
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
