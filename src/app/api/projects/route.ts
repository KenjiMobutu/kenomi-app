import { NextResponse } from 'next/server';
import { addProject } from '@/lib/actions';
import { auth } from '@clerk/nextjs/server';
// MODIFIÉ: Retrait de 'updateProject' qui est redondant ici
// import { updateProject } from '@/lib/actions';


export async function POST(req: Request) {
  const { userId } = await auth(); // <-- CORRECTION: Ajout de 'await'

  // VÉRIFICATION SÉCURITÉ: Seuls les utilisateurs connectés peuvent créer un projet.
  if (!userId) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }
  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
  }

  try {
    const data = await addProject(title, description);
    return NextResponse.json({ message: 'Projet ajouté', data }, { status: 201 });
  } catch (err: unknown) { // MODIFIÉ: any -> unknown
    // CORRECTION: Vérification du type de l'erreur
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// MODIFIÉ: Retrait du handler PATCH qui n'est pas sémantiquement correct
// sur la route de collection. Les mises à jour se font via /api/projects/[id]
/*
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
*/
