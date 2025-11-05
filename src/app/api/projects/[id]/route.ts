import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject, updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// SUPPRIMÉ: L'interface 'Props' n'est pas correcte pour les routes API.
/*
interface Props {
  params: Promise<{ id: string }>;
}
*/

// CORRECTION: La signature d'une route API est (req: Request, context: { params: ... })
export async function GET(
  req: Request, // Le premier argument est la requête (même s'il est inutilisé ici)
  context: { params: { id: string } } // Le second argument contient les params
) {
  // CORRECTION: Les params sont dans 'context' et ne sont pas une promesse
  const { id } = context.params;

  // MODIFIÉ: Utilisation du client admin pour la lecture
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

// CORRECTION: Signature mise à jour
export async function DELETE(
  _: Request, // req est inutilisé, donc renommé en _
  context: { params: { id: string } }
) {
  // CORRECTION: Les params sont dans 'context'
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

// CORRECTION: Signature mise à jour
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  // CORRECTION: Les params sont dans 'context'
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
