
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject, updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// In Next.js 15+, params is now a Promise that needs to be awaited
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params Promise
  const { id } = await context.params;

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
  context: { params: Promise<{ id: string }> }
) {
  // Await the params Promise
  const { id } = await context.params;

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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params Promise
  const { id } = await context.params;

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
