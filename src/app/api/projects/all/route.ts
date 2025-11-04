import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/actions';

export async function GET() {
  try {
    const data = await getProjects();
    return NextResponse.json(data);
  } catch (err: unknown) { // MODIFIÉ: 'any' -> 'unknown'
    // MODIFIÉ: Vérification du type de l'erreur
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Une erreur inconnue est survenue' }, { status: 500 });
  }
}
