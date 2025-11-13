
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

    // Get all listening exercises with attempt count
    const exercises = await prisma.listeningExercise.findMany({
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
    console.error('Error fetching listening exercises:', error);
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
      title,
      description,
      difficulty,
      category,
      audioUrl,
      audioText,
      duration,
      voice,
      speed,
      questions,
      isActive,
      requiredLevel,
      order,
      tags
    } = body;

    // Validate required fields
    if (!title || !difficulty || !category || !audioText) {
      return NextResponse.json({ 
        error: 'title, difficulty, category, and audioText are required' 
      }, { status: 400 });
    }

    // Create new listening exercise
    const exercise = await prisma.listeningExercise.create({
      data: {
        title,
        description,
        difficulty,
        category,
        audioUrl,
        audioText,
        duration,
        voice: voice || 'american-male',
        speed: speed || 1.0,
        questions: questions || [],
        isActive: isActive !== undefined ? isActive : true,
        requiredLevel: requiredLevel || 1,
        order: order || 0,
        tags: tags || []
      }
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error creating listening exercise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
