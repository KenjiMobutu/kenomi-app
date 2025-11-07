import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// --- Configuration PayPal ---
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

/**
 * Génère un jeton d'accès OAuth2 pour l'API PayPal.
 * (Dupliqué de create-order, idéalement à placer dans un helper partagé)
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Échec de l\'authentification PayPal.');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * API Route pour CAPTURER un ordre PayPal et l'enregistrer dans Supabase.
 */
export async function POST(req: Request) {
  try {
    const { orderID, donatorName, donatorEmail, frequency } = await req.json();

    if (!orderID || !donatorName || !donatorEmail) {
      return NextResponse.json({ error: 'Données de commande manquantes.' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    // Étape 1: Capturer le paiement côté serveur
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      // Gérer les erreurs de capture (ex: fonds insuffisants, ordre déjà capturé)
      console.error("Erreur de capture PayPal:", captureData);
      throw new Error(captureData.message || 'Échec de la capture du paiement.');
    }

    // Étape 2: Vérifier le statut de la capture
    if (captureData.status === 'COMPLETED') {
      // Le paiement est confirmé.

      // Extraire les détails financiers vérifiés de la réponse de capture
      const capture = captureData.purchase_units[0]?.payments?.captures[0];
      if (!capture) {
        throw new Error('Réponse de capture PayPal invalide.');
      }

      const amount = parseFloat(capture.amount.value);
      const currency = capture.amount.currency_code;
      const paypalTransactionId = capture.id; // ID de transaction PayPal

      // Étape 3: Enregistrer le don vérifié dans Supabase
      const { error: dbError } = await supabaseAdmin
        .from('donations')
        .insert({
          name: donatorName,
          email: donatorEmail,
          amount: amount,
          currency: currency.toLowerCase(),
          status: 'succeeded', // Paiement réussi
          stripe_session_id: `paypal_${paypalTransactionId}`, // Utiliser l'ID de capture PayPal
          created_at: new Date().toISOString(),
          frequency: frequency || 'once',
        });

      if (dbError) {
        // Le paiement a réussi mais la BDD a échoué.
        // C'est une erreur critique à logger, mais l'utilisateur a payé.
        console.error("CRITIQUE: Paiement PayPal capturé mais échec BDD:", dbError.message);
        // Nous renvoyons quand même un succès, car le paiement a eu lieu.
      }

      return NextResponse.json({ success: true, captureData });

    } else {
      // Le statut n'est pas "COMPLETED" (ex: PENDING)
      return NextResponse.json({ error: `Paiement non finalisé (Statut: ${captureData.status})` }, { status: 400 });
    }

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Erreur API capture-order:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
