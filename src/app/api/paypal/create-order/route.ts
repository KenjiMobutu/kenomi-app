import { NextResponse } from 'next/server';

// --- Configuration PayPal ---
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
// Utiliser l'URL sandbox par défaut, basculer en production via .env
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

/**
 * Génère un jeton d'accès OAuth2 pour l'API PayPal.
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
    cache: 'no-store' // Ne pas mettre en cache le jeton
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Erreur d'authentification PayPal:", errorData);
    throw new Error('Échec de l\'authentification PayPal.');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * API Route pour CRÉER un ordre PayPal côté serveur.
 */
export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: amount,
          },
          description: 'Don pour Kenomi ASBL',
        },
      ],
      application_context: {
        brand_name: 'Kenomi ASBL',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur création d'ordre PayPal:", errorData);
      throw new Error(errorData.message || 'Échec de la création de l\'ordre PayPal.');
    }

    const paypalOrder = await response.json();

    // Renvoie l'ID de l'ordre au client
    return NextResponse.json({ id: paypalOrder.id });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Erreur API create-order:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
