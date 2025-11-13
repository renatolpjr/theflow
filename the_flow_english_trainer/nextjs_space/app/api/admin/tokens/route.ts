
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/admin/tokens - List all registration tokens
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const tokens = await prisma.registrationToken.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tokens' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tokens - Generate new registration token(s)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { count = 1, description, expiresInDays } = body;

    // Generate tokens
    const tokens = [];
    for (let i = 0; i < count; i++) {
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const token = await prisma.registrationToken.create({
        data: {
          createdBy: session.user.email,
          description,
          expiresAt,
        },
      });
      tokens.push(token);
    }

    return NextResponse.json({ 
      tokens,
      message: `${count} token(s) gerado(s) com sucesso` 
    });
  } catch (error) {
    console.error('Error creating tokens:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tokens' },
      { status: 500 }
    );
  }
}
