
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, registrationToken } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate registration token (if provided)
    let token = null;
    if (registrationToken) {
      token = await prisma.registrationToken.findUnique({
        where: { token: registrationToken },
      });

      if (!token) {
        return NextResponse.json(
          { error: 'Invalid registration token' },
          { status: 400 }
        );
      }

      if (token.isUsed) {
        return NextResponse.json(
          { error: 'Registration token has already been used' },
          { status: 400 }
        );
      }

      if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Registration token has expired' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and mark token as used
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        totalPoints: 0,
        level: 1,
        streak: 0,
      }
    });

    // Mark token as used (if provided)
    if (token && registrationToken) {
      await prisma.registrationToken.update({
        where: { token: registrationToken },
        data: {
          isUsed: true,
          usedBy: email,
          usedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
