import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const {
      question,
      answer,
      philosopherId,
      sessionId,
      hasRagContext = false,
      mode = 'standard',
    } = await request.json();

    // Validate input
    if (!question || !answer || !philosopherId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Skip logging if Firebase Admin is not configured
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        message: 'Logging skipped - Firebase Admin not configured' 
      });
    }

    // Get user agent and other metadata
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const country = request.geo?.country || 'unknown';

    // Log to Firestore
    const logData = {
      question,
      answer,
      philosopherId,
      sessionId: sessionId || 'anonymous',
      hasRagContext,
      mode,
      userAgent,
      country,
      timestamp: new Date().toISOString(),
      answerLength: answer.length,
      questionLength: question.length,
    };

    await db.collection('questions').add(logData);

    // Update session activity
    if (sessionId) {
      const sessionRef = db.collection('sessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (sessionDoc.exists) {
        await sessionRef.update({
          lastActiveAt: new Date().toISOString(),
          questionCount: (sessionDoc.data()?.questionCount || 0) + 1,
        });
      } else {
        await sessionRef.set({
          sessionId,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          questionCount: 1,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/log:', error);
    return NextResponse.json(
      { error: 'Failed to log question' },
      { status: 500 }
    );
  }
}
