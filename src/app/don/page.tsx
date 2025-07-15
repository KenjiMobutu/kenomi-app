'use client';
import { motion } from "framer-motion";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const amount = parseFloat((form.amount as any).value);
    const name = (form.name as any).value;
    const email = (form.email as any).value;

    const res = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, name, email }),
    });

    const data = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.id });
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
          Soutenir la mission Kenomi
        </h1>
        <p className="text-center text-lg text-gray-700 mb-10">
          Chaque don contribue directement à nos actions de santé, d’éducation et de protection en RDC. Ensemble, construisons un avenir digne.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-xl shadow-md">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              name="amount"
              id="amount"
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
              placeholder="10"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="name"
              id="name"
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
              placeholder="Jean Dupont"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
              placeholder="jean@example.com"
              required
            />
          </div>
          <motion.button
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-lg shadow"
          >
            Faire un don
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}
