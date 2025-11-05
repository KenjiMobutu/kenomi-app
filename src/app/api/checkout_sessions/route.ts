
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  const { amount, name, email } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Don Kenomi de ${name}`,
          },
          unit_amount: amount * 100, // en centimes
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    mode: 'payment',
    success_url: `${req.nextUrl.origin}/don/success`,
    cancel_url: `${req.nextUrl.origin}/don`,
    metadata: {
      donateur: name,
    },
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
