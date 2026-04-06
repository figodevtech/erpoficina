import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ token: process.env.FOCUS_NFE_API_TOKEN });
}
