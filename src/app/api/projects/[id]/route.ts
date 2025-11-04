import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject } from "@/lib/actions";
import { updateProject } from "@/lib/actions";
// MODIFIÉ: Import du client admin pour GET
import { supabaseAdmin } from "@/lib/supabaseAdmin";
// MODIFIÉ: Retrait de l'import du client public
// import { supabase } from "@/lib/supabaseClient";
// MODIFIÉ: Retrait de l'initialisation dupliquée du client
// import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
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
  const { sessionClaims } = auth();
  const role = sessionClaims?.publicMetadata?.role;

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// MODIFIÉ: Retrait du handler POST redondant pour la mise à jour
/*
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const form = await req.formData();
    const title = form.get("title")?.toString();
    const description = form.get("description")?.toString();

    if (!title || !description) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }

    await updateProject(params.id, title, description);
    return NextResponse.redirect(new URL(`/projects/${params.id}`, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
*/

// MODIFIÉ: Retrait de l'initialisation dupliquée du client
/*
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 ici
);
*/

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const { title, description } = await req.json();

  // MODIFIÉ: Utilisation de la fonction action standardisée
  // qui utilise le client admin
  try {
    await updateProject(id, title, description);
    return NextResponse.json({ message: "Projet mis à jour" });
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
