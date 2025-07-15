import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteProject } from "@/lib/actions";
import { updateProject } from "@/lib/actions";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const { data, error } = await supabase
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
    await deleteProject(params.id);
    return NextResponse.json({ message: "Projet supprimé" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 ici
);

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const { title, description } = await req.json();

  const { error } = await supabase
    .from("Project")
    .update({ title, description })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Projet mis à jour" });
}
