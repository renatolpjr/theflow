
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { level: true }
    });

    const where: any = {
      isActive: true,
      requiredLevel: { lte: user?.level || 1 }
    };

    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;
    if (type) where.type = type;

    const challenges = await prisma.challenge.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
