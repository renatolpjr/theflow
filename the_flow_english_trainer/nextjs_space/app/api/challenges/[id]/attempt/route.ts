
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

    const { answers, timeSpent } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Calculate score
    const questions = challenge.questions as any[];
    let correctCount = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      
      if (userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim()) {
        correctCount++;
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= challenge.passingScore;
    const pointsEarned = passed ? challenge.pointsReward : Math.floor(challenge.pointsReward * 0.5);

    // Create attempt record
    const attempt = await prisma.challengeAttempt.create({
      data: {
        userId: user.id,
        challengeId: challenge.id,
        answers,
        score,
        passed,
        timeSpent,
        pointsEarned
      }
    });

    // Update user points and level if passed
    if (passed) {
      const newTotalPoints = user.totalPoints + pointsEarned;
      const newLevel = Math.floor(newTotalPoints / 500) + 1;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: newTotalPoints,
          level: newLevel,
          lastActiveDate: new Date()
        }
      });
    }

    return NextResponse.json({ 
      attempt,
      score,
      passed,
      pointsEarned,
      correctCount,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error('Error submitting challenge attempt:', error);
    return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 });
  }
}
