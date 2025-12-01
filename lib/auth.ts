import { cookies } from 'next/headers';
import { auth } from './firebaseAdmin';

const ALLOWED_ADMINS = [process.env.ADMIN_EMAIL || 'your_email@example.com'];

export interface Session {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

/**
 * Verifies the Firebase Auth session token from cookies
 * Returns session data if valid, null otherwise
 */
export async function verifySession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      emailVerified: decodedClaims.email_verified || false,
    };
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

/**
 * Check if a user is an authorized admin
 */
export function isAdmin(email: string | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMINS.includes(email);
}

/**
 * Verify admin access - returns session if authorized, null otherwise
 */
export async function verifyAdminAccess(): Promise<Session | null> {
  const session = await verifySession();
  
  if (!session || !isAdmin(session.email)) {
    return null;
  }

  return session;
}
