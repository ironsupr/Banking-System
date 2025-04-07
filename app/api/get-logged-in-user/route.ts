import { NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';

export async function GET() {
  const user = await getLoggedInUser();
  return NextResponse.json({ user });
}