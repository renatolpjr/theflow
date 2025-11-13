
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch all API settings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await prisma.apiSettings.findMany({
      orderBy: { serviceName: 'asc' }
    });

    // Return settings without exposing full API keys
    const safeSettings = settings.map(setting => ({
      ...setting,
      apiKey: setting.apiKey ? `${setting.apiKey.slice(0, 8)}...` : ''
    }));

    return NextResponse.json({ settings: safeSettings });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Create or update API settings
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { serviceName, apiKey, config, isActive } = body;

    if (!serviceName || !apiKey) {
      return NextResponse.json({ error: 'Service name and API key are required' }, { status: 400 });
    }

    // Upsert the setting (create or update)
    const setting = await prisma.apiSettings.upsert({
      where: { serviceName },
      create: {
        serviceName,
        apiKey,
        config: config || {},
        isActive: isActive !== undefined ? isActive : true
      },
      update: {
        apiKey,
        config: config || {},
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      setting: {
        ...setting,
        apiKey: `${setting.apiKey.slice(0, 8)}...`
      }
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
