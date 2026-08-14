import { NextResponse } from 'next/server';
import { improveBulletPoint } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.bullet) return NextResponse.json({ error: 'Bullet text required' }, { status: 400 });

    const result = await improveBulletPoint(body.bullet);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to rewrite bullet.' }, { status: 500 });
  }
}
