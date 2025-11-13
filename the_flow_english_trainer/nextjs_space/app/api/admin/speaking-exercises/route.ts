
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const exercises = await prisma.speakingExercise.findMany({
      include: {
        _count: {
          select: {
            attempts: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching speaking exercises:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      category,
      prompt,
      context,
      targetWords,
      minDuration,
      maxDuration,
      isActive,
      requiredLevel,
      order,
      tags
    } = body;

    if (!title || !difficulty || !category || !prompt) {
      return NextResponse.json({ 
        error: 'title, difficulty, category, and prompt are required' 
      }, { status: 400 });
    }

    const exercise = await prisma.speakingExercise.create({
      data: {
        title,
        description,
        difficulty,
        category,
        prompt,
        context,
        targetWords: targetWords || [],
        minDuration: minDuration || 30,
        maxDuration: maxDuration || 120,
        isActive: isActive !== undefined ? isActive : true,
        requiredLevel: requiredLevel || 1,
        order: order || 0,
        tags: tags || []
      }
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error creating speaking exercise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
