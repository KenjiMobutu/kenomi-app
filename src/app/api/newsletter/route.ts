
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Gère l'inscription à la newsletter.
 * Valide les données et les insère dans la table 'subscribers'.
 */
export async function POST(req: Request) {
  let email: string;
  let consent: boolean;

  try {
    const body = await req.json();
    email = body.email;
    consent = body.consent;

    // 1. Validation basique des entrées
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    // 2. Validation du consentement (OBLIGATOIRE pour le RGPD)
    if (consent !== true) {
      return NextResponse.json({ error: "Le consentement à la politique de confidentialité est requis." }, { status: 400 });
    }

  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    // 3. Insertion dans Supabase avec le client admin
    const { error: insertError } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email: email.toLowerCase(), // Normaliser l'email
        consent_given: consent,
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 4. Gestion des erreurs de base de données (ex: email déjà existant)
    if (insertError) {
      if (insertError.code === '23505') { // Code d'erreur pour violation de contrainte unique (email)
        return NextResponse.json({ error: "Cette adresse e-mail est déjà inscrite." }, { status: 409 }); // 409 Conflict
      }
      // Log l'erreur réelle côté serveur pour le débogage
      console.error('Erreur Supabase (Newsletter):', insertError.message);
      throw new Error(insertError.message);
    }

    // 5. Succès
    return NextResponse.json({ message: "Inscription réussie !" }, { status: 201 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur serveur interne.";
    // Ne pas exposer les détails de l'erreur interne au client
    console.error(`Échec de l'inscription à la newsletter pour ${email}: ${errorMessage}`);
    return NextResponse.json({ error: "Impossible de traiter votre demande pour le moment." }, { status: 500 });
  }
}

/**
 * Validation basique du format de l'email.
 */
function isValidEmail(email: string): boolean {
  // Une regex simple. Pour une validation complète, un lien de confirmation serait nécessaire.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
