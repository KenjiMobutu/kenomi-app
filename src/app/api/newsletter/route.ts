import { NextResponse } from 'next/server';
// Nous utilisons supabaseAdmin pour l'insertion ET l'invocation
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const { email, consent } = await req.json();

  if (!email || !consent || consent !== true) {
    return NextResponse.json({ error: 'Email et consentement sont requis.' }, { status: 400 });
  }

  // Étape 1: Insérer l'abonné dans la base de données
  const { error: insertError } = await supabaseAdmin
    .from('subscribers')
    .insert({
      email: email.toLowerCase(), // Normaliser l'email
      consent_given: consent,
      subscribed_at: new Date().toISOString(),
    });

  // Si l'e-mail existe déjà (conflit 'unique'), nous continuons sans erreur
  if (insertError && insertError.code !== '23505') {
    console.error('Erreur Supabase (Newsletter Insert):', insertError.message);
    return NextResponse.json({ error: `Échec de l'inscription: ${insertError.message}` }, { status: 500 });
  }

  // Étape 2: Invoquer la Edge Function pour la synchronisation Brevo
  // Nous n'attendons pas (pas de 'await') la fin de l'invocation
  // pour répondre rapidement à l'utilisateur.
  supabaseAdmin.functions.invoke('sync-brevo-contact', {
    body: { email: email },
  })
  .then(response => {
    if (response.error) {
      console.error('Erreur Invocation Edge Function (sync-brevo-contact):', response.error.message);
    } else {
      console.log('Synchronisation Brevo initiée pour:', email);
    }
  });

  // Répondre immédiatement à l'utilisateur
  return NextResponse.json({ success: true }, { status: 200 });
}
