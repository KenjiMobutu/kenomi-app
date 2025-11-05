import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject, updateProject } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Params {
  params: {
    id: string
  }
}
export async function GET(
  _req: Request,
  { params }: Params
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

  return NextResponse.json({id});
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  await deleteProject(id);
  return NextResponse.json({ message: "Projet supprimé" });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Accès refusé (admin uniquement)" },
      { status: 403 }
    );
  }

  const { title, description } = await req.json();

  await updateProject(id, title, description);
  return NextResponse.json({ message: "Projet mis à jour" });
}
