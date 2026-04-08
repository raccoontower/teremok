import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return NextResponse.json({
    projectId: projectId ?? 'MISSING',
    email: email ? email.substring(0, 20) + '...' : 'MISSING',
    keyLength: key?.length ?? 0,
    keyStart: key?.substring(0, 30) ?? 'MISSING',
    keyHasNewlines: key?.includes('\n') ?? false,
    keyHasEscaped: key?.includes('\\n') ?? false,
  });
}
