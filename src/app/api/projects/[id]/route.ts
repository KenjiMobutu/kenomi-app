import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject, updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(req: Request, context: RouteContext) {
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

export async function DELETE(req: Request, context: RouteContext) {
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

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = context.params;
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
