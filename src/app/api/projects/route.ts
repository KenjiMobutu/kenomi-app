import { NextResponse } from 'next/server';
import { addProject } from '@/lib/actions';
import { auth } from '@clerk/nextjs/server';
import { updateProject } from '@/lib/actions';


export async function POST(req: Request) {
  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
  }

  try {
    const data = await addProject(title, description);
    return NextResponse.json({ message: 'Projet ajouté', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth() as {
    userId: string,
    sessionClaims: { publicMetadata?: { role?: string } }
  }; // Vérifie le token Clerk
  const role = sessionClaims?.publicMetadata?.role;

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { title, description } = await req.json();

  await updateProject(params.id, title, description); // Appelle Supabase ou autre DB ici

  return NextResponse.json({ success: true });
}
