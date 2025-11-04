import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16', // Note: L'API version est fixe, c'est normal
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) { // MODIFIÉ: 'any' -> 'unknown'
    // MODIFIÉ: Vérification du type de l'erreur
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue de Webhook';
    console.error(`Webhook signature verification failed.`, errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // TODO: Il est recommandé de vérifier si 'session.customer_email' existe
    // avant de l'insérer pour éviter les erreurs de base de données si 'email' est NOT NULL.
    await supabase.from('donations').insert({
      stripe_session_id: session.id,
      name: session.metadata?.donateur,
      email: session.customer_email, // Peut être null
      amount: (session.amount_total || 0) / 100,
      currency: session.currency,
      status: session.payment_status,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
