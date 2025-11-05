import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject, updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
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
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  try {
    await deleteProject(params.id);
    return NextResponse.json({ message: "Projet supprimé" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { title, description } = await req.json();
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  try {
    await updateProject(id, title, description);
    return NextResponse.json({ message: "Projet mis à jour" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
