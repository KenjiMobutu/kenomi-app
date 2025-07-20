'use client';

import { motion } from "framer-motion";
import { useState, useEffect, FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// --- SVG Icons for a professional look ---
const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0 text-pink-300">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


// --- Configuration ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

export default function DonationPage() {
  // --- Component State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(50);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  // --- Effects ---
  useEffect(() => {
    if (frequency === 'monthly' && paymentMethod === 'paypal') {
      setPaymentMethod('stripe');
    }
  }, [frequency, paymentMethod]);

  // --- Event Handlers ---
  const handleAmountSelect = (value: number | 'custom') => {
    setError(null);
    if (value === 'custom') {
      setIsCustomAmount(true);
      setAmount(0);
    } else {
      setIsCustomAmount(false);
      setAmount(value);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
      setError(null);
    } else {
      setAmount(0);
    }
  };

  const handleStripeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Veuillez entrer ou sélectionner un montant valide.");
      return;
    }
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = {
      firstName: (form.firstName as HTMLInputElement).value,
      lastName: (form.lastName as HTMLInputElement).value,
      email: (form.email as HTMLInputElement).value,
      amount,
      frequency,
    };

    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "La création de la session de paiement a échoué.");
      }
      const data = await res.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.id });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PayPal Logic ---
  const createPayPalOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        description: "Don pour la mission Kenomi",
        amount: { value: amount.toString(), currency_code: 'EUR' },
      }],
      application_context: { brand_name: 'Kenomi', shipping_preference: 'NO_SHIPPING' },
    });
  };

  const onPayPalApprove = async (data: any, actions: any) => {
    setLoading(true);
    try {
      await actions.order.capture();
      console.log("Don PayPal réussi!", data);
      window.location.href = '/merci';
    } catch (err) {
      setError("Une erreur est survenue lors de la finalisation du don PayPal.");
    } finally {
      setLoading(false);
    }
  };

  // --- Component Render ---
  return (
    <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "EUR", intent: "capture" }}>
      <main className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left Column - Visual & Impact */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-black  p-10 text-white text-center">
            <img
              src="/happySeniorKenomi.png"
              alt="Personne âgée souriante utilisant une tablette grâce à l'aide de Kenomi"
              width={560}
              height={560}
              className="w-80 h-80 object-cover mb-8  border-white/50 shadow-lg"
            />
            <h2 className="text-3xl font-bold leading-tight mb-4">Changez une vie aujourd'hui.</h2>
            <p className="text-teal-100 text-lg mb-6 max-w-sm">Chaque contribution nous rapproche de notre objectif : un avenir meilleur pour chaque enfant et chaque aîné.</p>
            <div className="space-y-4 text-left text-teal-50 text-sm">
              <div className="flex items-start"><HeartIcon /><p><span className="font-bold">20€</span> &ndash; Finance un atelier d'initiation au numérique.</p></div>
              <div className="flex items-start"><HeartIcon /><p><span className="font-bold">50€</span> &ndash; Offre un kit scolaire complet et un uniforme en RDC.</p></div>
              <div className="flex items-start"><HeartIcon /><p><span className="font-bold">100€</span> &ndash; Permet une consultation médicale et les vaccins essentiels.</p></div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-6 sm:p-10">
            <form onSubmit={handleStripeSubmit} className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Choisissez votre type de don</h3>
                <div className="flex bg-gray-200 rounded-full p-1">
                  <button type="button" onClick={() => setFrequency('once')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${frequency === 'once' ? 'bg-white text-gray-800 shadow' : 'text-gray-600'}`}>Une fois</button>
                  <button type="button" onClick={() => setFrequency('monthly')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${frequency === 'monthly' ? 'bg-white text-gray-800 shadow' : 'text-gray-600'}`}>Mensuel</button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-3">Sélectionnez un montant</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[20, 50, 100].map((val) => (
                        <button type="button" key={val} onClick={() => handleAmountSelect(val)} className={`relative text-left p-3 border-2 rounded-lg font-bold text-gray-700 transition-all ${!isCustomAmount && amount === val ? 'border-grey-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                            {val}€
                            {!isCustomAmount && amount === val && <div className="absolute top-2 right-2 bg-black rounded-full h-5 w-5 flex items-center justify-center"><CheckIcon/></div>}
                        </button>
                    ))}
                    <button type="button" onClick={() => handleAmountSelect('custom')} className={`p-3 border-2 rounded-lg font-bold text-gray-700 transition-all ${isCustomAmount ? 'border-black bg-teal-50' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                        Autre
                    </button>
                </div>
                {isCustomAmount && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-semibold">€</span>
                            <input type="number" onChange={handleCustomAmountChange} className="w-full pl-8 pr-4 py-3 border-2 text-black font-semibold border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-black" placeholder="Votre montant" autoFocus />
                        </div>
                    </motion.div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-3">Vos informations</h3>
                <div className="space-y-3">
                    <input type="text" name="firstName" placeholder="Prénom" className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-black" required />
                    <input type="text" name="lastName" placeholder="Nom" className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-black" required />
                    <input type="email" name="email" placeholder="Adresse e-mail" className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-black" required />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-3">Paiement</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentMethod('stripe')} className={`p-3 border-2 rounded-lg font-semibold text-gray-700 flex items-center justify-center transition-all ${paymentMethod === 'stripe' ? 'border-black bg-teal-50' : 'border-gray-200 hover:border-gray-400'}`}>Carte de crédit</button>
                    <button type="button" onClick={() => setPaymentMethod('paypal')} disabled={frequency === 'monthly'} className={`p-3 border-2 rounded-lg font-semibold text-gray-700 flex items-center justify-center transition-all ${paymentMethod === 'paypal' ? 'border-black bg-teal-50' : 'border-gray-200 hover:border-gray-400'} disabled:opacity-50 disabled:cursor-not-allowed`}>PayPal</button>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <div className="pt-2">
                {paymentMethod === 'stripe' ? (
                  <motion.button disabled={loading || amount <= 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full px-6 py-4 bg-black hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60">
                    {loading ? 'Traitement...' : `Faire un don de ${amount}€`}
                  </motion.button>
                ) : (
                  <PayPalButtons style={{ layout: "horizontal", tagline: false, height: 55 }} createOrder={createPayPalOrder} onApprove={onPayPalApprove} disabled={loading || amount <= 0} />
                )}
              </div>
              <p className="text-xs text-center text-gray-500">
                🔒 Votre don peut être déductible des impôts. Un reçu fiscal vous sera envoyé.
              </p>
            </form>
          </div>
        </motion.div>
      </main>
    </PayPalScriptProvider>
  );
}
