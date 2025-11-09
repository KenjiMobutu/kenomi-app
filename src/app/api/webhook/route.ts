import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// MISE À JOUR: Importation du client e-mail
import { sendDonationConfirmationEmail } from '@/lib/emailClient';
import { generateDonationPDF } from '@/lib/pdfGenerator';

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Utilisation d'une version API récente
});

// Clé secrète du Webhook Stripe
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  let body: Buffer;
  try {
    // Lire le corps en tant que buffer pour la vérification
    const rawBody = await req.arrayBuffer();
    body = Buffer.from(rawBody);
  } catch (err) {
    console.error('Erreur lors de la lecture du corps de la requête:', err);
    return new NextResponse('Invalid request body', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du Webhook
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      stripeWebhookSecret
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Erreur inconnue de Webhook';
    console.error(`Webhook signature verification failed.`, errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Gérer l'événement 'checkout.session.completed'
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Logique pour gérer une session de paiement unique réussie
    if (session.mode === 'payment' && session.payment_status === 'paid') {
      try {
        // Extraire les informations
        const amount = (session.amount_total || 0) / 100;
        const name = session.metadata?.donateur || session.customer_details?.name || 'Donateur Anonyme';
        const email = session.customer_details?.email;
        const donationDate = new Date(session.created * 1000);
        const transactionId = session.id;

        if (!email) {
          throw new Error('Email du client manquant dans la session Stripe.');
        }

        // 1. Insérer dans la base de données
        const { error: dbError } = await supabaseAdmin.from('donations').insert({
          stripe_session_id: session.id,
          name: name,
          email: email,
          amount: amount,
          currency: session.currency,
          status: session.payment_status,
          created_at: donationDate.toISOString(),
          frequency: 'once', // Paiement unique
        });

        if (dbError) {
          throw new Error(
            `Erreur Supabase (Webhook Stripe): ${dbError.message}`
          );
        }else{
          console.log("1 => Donation enregistrée avec succès dans la base de données pour la session:", session.id);
        }

        // 2. MODIFIÉ: Générer le PDF et envoyer l'e-mail
        const donationDetails = {
          email: email,
          name: name,
          amount: amount,
          frequency: 'once' as const,
          donationDate: donationDate,
          transactionId: transactionId
        };

        // Générer le PDF en mémoire
        const pdfBytes = await generateDonationPDF(donationDetails);

        // 2. MISE À JOUR: Envoyer l'e-mail de confirmation
        await sendDonationConfirmationEmail({
          ...donationDetails,
          pdfBuffer: pdfBytes
        });

      } catch (error) {
        console.error('Erreur lors du traitement du webhook (payment):', error);
        // Répondre 500 pour que Stripe puisse réessayer plus tard
        return new NextResponse(
          `Internal Server Error: ${(error as Error).message}`,
          { status: 500 }
        );
      }
    }

    // Gérer l'événement 'customer.subscription.created' ou 'invoice.paid' pour les abonnements
    // La session 'checkout.session.completed' en mode 'subscription' ne confirme pas le paiement.
    // Il est plus fiable d'écouter 'invoice.paid' pour les dons récurrents.
  }

  // Gérer le premier paiement d'un abonnement
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;

    // CORRECTION: 'invoice.subscription' n'est pas une propriété garantie.
    // L'ID de l'abonnement se trouve sur les lignes (line items) de la facture.
    const subscriptionRef = invoice.lines?.data[0]?.subscription;

    // La fonction retrieve() n'accepte qu'un 'string'.
    if (!subscriptionRef || typeof subscriptionRef !== 'string') {
      // Si ce n'est pas un ID string, ce n'est pas l'événement que nous recherchons.
      return NextResponse.json({ received: true, message: 'Invoice paid, but not a processable subscription event.' });
    }

    // A ce stade, subscriptionRef est garanti d'être un string (ID).
    const subscriptionId = subscriptionRef;

    // Vérifier s'il s'agit du premier paiement pour un nouvel abonnement
    if (invoice.billing_reason === 'subscription_create' && invoice.status === 'paid' && subscriptionId) {
      try {
        // Récupérer la session de checkout originale via l'ID d'abonnement
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const checkoutSessionId = subscription.metadata.checkout_session_id;

        if (!checkoutSessionId) {
          // Ne peut pas lier à une session de don, ignorer
          return NextResponse.json({ received: true, message: 'Invoice paid, but no checkout session metadata.' });
        }

        // Récupérer la session de checkout pour les métadonnées
        const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

        const amount = (invoice.amount_paid || 0) / 100;
        const name = session.metadata?.donateur || invoice.customer_name || 'Donateur Anonyme';
        const email = invoice.customer_email;

        if (!email) {
          throw new Error('Email du client manquant dans la facture Stripe.');
        }

        // 1. Insérer dans la base de données
        const { error: dbError } = await supabaseAdmin.from('donations').insert({
          stripe_session_id: checkoutSessionId, // Lier à la session de checkout
          //stripe_subscription_id: subscription.id, // Stocker l'ID de l'abonnement
          name: name,
          email: email,
          amount: amount,
          currency: invoice.currency,
          status: 'succeeded', // 'paid' devient 'succeeded' dans notre DB
          created_at: new Date(invoice.created * 1000).toISOString(),
          frequency: 'monthly', // Paiement récurrent
        });

        if (dbError) {
          throw new Error(
            `Erreur Supabase (Webhook Stripe Subscription): ${dbError.message}`
          );
        }

        // 2. MISE À JOUR: Envoyer l'e-mail de confirmation
        await sendDonationConfirmationEmail({
          email: email,
          name: name,
          amount: amount,
          frequency: 'monthly',
        });

      } catch (error) {
        console.error('Erreur lors du traitement du webhook (subscription):', error);
        return new NextResponse(
          `Internal Server Error: ${(error as Error).message}`,
          { status: 500 }
        );
      }
    }
  }


  // Répondre 200 à Stripe pour accuser réception de l'événement
  return NextResponse.json({ received: true });
}
