import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/actions';

export async function GET() {
  try {
    const data = await getProjects();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
