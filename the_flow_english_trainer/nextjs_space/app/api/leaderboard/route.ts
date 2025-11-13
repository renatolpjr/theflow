
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

    // Get top users by points
    const topUsers = await prisma.user.findMany({
      select: {
        name: true,
        totalPoints: true,
        userBadges: {
          select: { id: true }
        }
      },
      orderBy: { totalPoints: 'desc' },
      take: 10
    });

    // Add rank to users
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name || 'Anonymous',
      points: user.totalPoints,
      badges: user.userBadges.length
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
