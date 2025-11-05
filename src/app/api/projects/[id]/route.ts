import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject } from "@/lib/actions";
import { updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// CORRECTION: Rétablissement de la signature correcte pour une API Route
// 1er argument: req (Request), 2ème argument: context (contenant params)
export async function GET(
  req: Request,
  context: { params: { id: string } }
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

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { sessionClaims } = await auth();
  // CORRECTION: Accès via 'metadata' et non 'publicMetadata'
  const role = sessionClaims?.metadata?.role;

  console.log("Rôle reçu (DELETE):", role);

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  try {
    // Cette action utilise maintenant le client admin (via actions.ts)
    await deleteProject(params.id);
    return NextResponse.json({ message: "Projet supprimé" });
  } catch (err: unknown) {
    // CORRECTION: Vérification du type de l'erreur
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


export async function PATCH(req: Request, context: { params: { id: string } }) {
  // AJOUT SÉCURITÉ: Vérification du rôle
  const { sessionClaims } = await auth();
  // CORRECTION: Accès via 'metadata' et non 'publicMetadata'
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }
  // Fin de l'ajout sécurité

  const { id } = context.params;
  const { title, description } = await req.json();

  // MODIFIÉ: Utilisation de la fonction action standardisée
  // qui utilise le client admin
  try {
    await updateProject(id, title, description);
    return NextResponse.json({ message: "Projet mis à jour" });
  } catch (error: unknown) { // MODIFIÉ: any -> unknown
    // CORRECTION: Vérification du type de l'erreur
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
