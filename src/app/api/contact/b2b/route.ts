import { NextResponse } from 'next/server';
import { sendB2BLeadEmail } from '@/lib/emailClient'; // Fonction à ajouter
import { z } from 'zod'; // Zod est une bonne pratique pour la validation

// Schéma de validation Zod
const leadSchema = z.object({
  company: z.string().min(1, "Le nom de l'entreprise est requis"),
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  service: z.string(),
  message: z.string().min(5, "Le message est trop court"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation des données
    const validation = leadSchema.safeParse(body);
    if (!validation.success) {
      const firstIssueMessage = validation.error.issues?.[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: firstIssueMessage }, { status: 400 });
    }

    const leadData = validation.data;

    // Appel au client email (à créer à l'étape suivante)
    await sendB2BLeadEmail(leadData);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur serveur interne.";
    console.error(`Échec de l'envoi du formulaire B2B: ${errorMessage}`);
    return NextResponse.json({ error: "Une erreur serveur interne est survenue." }, { status: 500 });
  }
}
