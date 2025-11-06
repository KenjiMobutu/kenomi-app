
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Récupère la liste de tous les dons.
 * CETTE ROUTE EST PROTÉGÉE ET NÉCESSITE LE RÔLE "ADMIN".
 */
export async function GET() {
  try {
    // 1. Authentification et vérification du rôle via Clerk (côté serveur)
    const { sessionClaims } = await auth();

    if (sessionClaims?.metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Accès refusé. Vous n'avez pas les droits administrateur." }, { status: 403 }); // 403 Forbidden
    }

    // 2. L'utilisateur est admin, récupération des données avec le client "admin"
    const { data: donationsData, error } = await supabaseAdmin
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false }); // Tri par défaut

    if (error) {
      // Log de l'erreur réelle côté serveur
      console.error('Erreur Supabase (Admin Dons):', error.message);
      // Réponse générique au client
      return NextResponse.json({ error: "Erreur lors de la récupération des dons." }, { status: 500 });
    }

    // 3. Succès
    return NextResponse.json(donationsData, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur serveur interne.";
    console.error(`Échec de la récupération des dons admin: ${errorMessage}`);
    return NextResponse.json({ error: "Une erreur serveur interne est survenue." }, { status: 500 });
  }
}
