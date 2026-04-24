import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', new URL(request.url).origin));
}

// GET supported as a convenience (e.g. anchor link logout)
export async function GET(request: NextRequest) {
  return POST(request);
}
