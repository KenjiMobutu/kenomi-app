import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject, updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// SUPPRIMÉ: L'interface 'Props' et l'utilisation de 'Promise'
// ne sont pas valides pour les gestionnaires de routes API.
/*
interface Props {
  params: Promise<{ id: string }>;
}
*/

// CORRECTION: La signature d'une route API est (req: Request, context: { params: ... })
// Les 'params' ne sont PAS une promesse dans ce contexte.
export async function GET(
  req: Request, // Le premier argument est la requête
  context: { params: { id: string } } // Le second argument contient les params
) {
  // CORRECTION: 'params' est lu depuis 'context' de manière synchrone.
  const { id } = context.params;

  const { data, error } = await supabaseAdmin
    .from("Project")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Projet introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// CORRECTION: La signature doit correspondre: (req, context)
export async function DELETE(
  _: Request, // req est inutilisé, donc renommé en _
  context: { params: { id: string } }
) {
  // CORRECTION: 'params' est lu depuis 'context'
  const { id } = context.params;

  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  try {
    await deleteProject(id);
    return NextResponse.json({ message: "Projet supprimé" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// CORRECTION: La signature doit correspondre: (req, context)
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  // CORRECTION: 'params' est lu depuis 'context'
  const { id } = context.params;

  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  const { title, description } = await req.json();

  try {
    await updateProject(id, title, description);
    return NextResponse.json({ message: "Projet mis à jour" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
