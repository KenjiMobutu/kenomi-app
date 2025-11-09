import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const monthlyPriceMap: { [key: string]: string | undefined } = {
  'don_25': process.env.STRIPE_MONTHLY_PRICE_ID_25,
  'don_50': process.env.STRIPE_MONTHLY_PRICE_ID_50,
  'don_150': process.env.STRIPE_MONTHLY_PRICE_ID_150,
};

export async function POST(req: NextRequest) {
  // Récupération de toutes les données nécessaires depuis le client
  const {
    amount,         // Montant (utilisé pour les dons uniques personnalisés)
    name,
    email,
    frequency,      // 'once' ou 'monthly'
    priceId         // 'don_25', 'don_50', 'don_150', ou '' si personnalisé
  } = await req.json();

  // Paramètres de session communs
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer_email: email,
    success_url: `${req.nextUrl.origin}/don/success`,
    cancel_url: `${req.nextUrl.origin}/don`,
    metadata: {
      donateur: name,
    },
  };

  try {
    if (frequency === 'monthly') {
      // --- Logique pour les DONS RÉCURRENTS (Abonnement) ---

      // Vérifier si un priceId valide a été fourni pour l'abonnement
      if (!priceId || !monthlyPriceMap[priceId]) {
        console.error("Tentative d'abonnement mensuel sans priceId valide ou pour un montant personnalisé.");
        return NextResponse.json({ error: "Les dons mensuels ne sont disponibles que pour les montants prédéfinis (25€, 50€, 150€)." }, { status: 400 });
      }

      const stripePriceId = monthlyPriceMap[priceId];

      // Vérifier si l'ID du prix est bien configuré côté serveur
      if (!stripePriceId) {
        console.error(`Erreur de configuration: STRIPE_MONTHLY_PRICE_ID pour "${priceId}" est manquant.`);
        return NextResponse.json({ error: "Erreur de configuration du serveur de paiement." }, { status: 500 });
      }

      sessionParams.mode = 'subscription';
      sessionParams.line_items = [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ];
      // AJOUT RECOMMANDÉ :
      // Passez l'ID de la session de checkout (qui sera générée)
      // dans les métadonnées de l'abonnement pour le retrouver dans le webhook.
      sessionParams.subscription_data = {
        metadata: {
          // Stripe remplacera automatiquement '{CHECKOUT_SESSION_ID}'
          // par l'ID de la session en cours de création.
          checkout_session_id: '{CHECKOUT_SESSION_ID}',
        },
      };

    } else {
      // --- Logique pour les DONS UNIQUES (Paiement) ---

      // Valider le montant (soit celui sélectionné, soit le personnalisé)
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
      }

      sessionParams.mode = 'payment';
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Don unique Kenomi de ${name}`,
            },
            unit_amount: amount * 100, // Toujours en centimes
          },
          quantity: 1,
        },
      ];
    }

    // Création de la session Stripe avec les bons paramètres
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ id: session.id, url: session.url });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("Erreur lors de la création de la session Stripe:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
