import { NextRequest, NextResponse } from 'next/server';
import { auth as firebaseAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { idToken, expiresIn = 60 * 60 * 24 * 5 * 1000 } = await request.json(); // 5 days

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing idToken' },
        { status: 400 }
      );
    }

    // Create session cookie
    const sessionCookie = await firebaseAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
