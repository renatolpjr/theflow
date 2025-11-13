
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
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: params.id }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const body = await request.json();
    const { answers, timeSpent } = body;

    // Calculate score based on correct answers
    const questions = exercise.questions as any[];
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const pointsEarned = Math.round(score * 0.5); // Base points calculation
    const completed = score >= 70; // Consider completed if score >= 70%

    // Create attempt record
    const attempt = await prisma.listeningAttempt.create({
      data: {
        userId: user.id,
        exerciseId: exercise.id,
        answers: answers,
        score,
        timeSpent,
        pointsEarned: completed ? pointsEarned : 0,
        completed
      }
    });

    // Update user points if completed
    if (completed) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: pointsEarned },
          level: {
            increment: Math.floor(pointsEarned / 100) // Level up every 100 points
          }
        }
      });
    }

    return NextResponse.json({
      attempt,
      score,
      completed,
      pointsEarned,
      correctAnswers,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error('Error submitting listening attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}
