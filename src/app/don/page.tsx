'use client';
import Link from 'next/link';
import { motion } from "framer-motion";
import { useState, useEffect, FormEvent, useRef } from "react";
import Image from 'next/image'; // AJOUT: Import manquant pour le composant Image
// import { loadStripe } from "@stripe/stripe-js"; // Retiré pour chargement par CDN
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; // Retiré pour chargement par CDN
import { memo } from 'react'; // Import memo pour l'optimisation
import Script from 'next/script'; // Import pour charger les scripts externes

// --- Optimisation: Définition des icônes en dehors du composant ---
const HeartIcon = memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0 text-pink-300">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
));
HeartIcon.displayName = 'HeartIcon';

const CheckIcon = memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
));
CheckIcon.displayName = 'CheckIcon';


// --- Configuration ---
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!); // Remplacé par chargement via <Script>
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// --- AJOUT SÉCURITÉ: Options de don avec ID ---
const donationOptions = [
  { id: 'don_25', amount: 25, label: '25€' },
  { id: 'don_50', amount: 50, label: '50€' },
  { id: 'don_150', amount: 150, label: '150€' },
];

// --- Composant Wrapper pour le bouton PayPal ---
const PayPalPaymentButton = ({ amount, createOrder, onApprove, isSdkReady, disabled, onError }: {
  amount: number;
  createOrder: (data: unknown, actions: unknown) => unknown;
  onApprove: (data: unknown, actions: unknown) => Promise<void>;
  isSdkReady: boolean;
  disabled: boolean;
  onError: (err: unknown) => void;
}) => {
    const paypalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // CORRECTION: Ajout d'une suppression ciblée pour l'accès au SDK global
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (isSdkReady && (window as any).paypal && paypalRef.current) {
            // Vider le conteneur avant de rendre un nouveau bouton
            paypalRef.current.innerHTML = "";

            try {
                // Rendre le nouveau bouton
                // CORRECTION: Ajout d'une suppression ciblée
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).paypal.Buttons({
                    createOrder,
                    onApprove,
                    onError,
                    style: {
                        layout: "horizontal",
                        tagline: false,
                        height: 55,
                    },
                    // CORRECTION: Ajout d'une suppression ciblée
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    fundingSource: (window as any).paypal.FUNDING.PAYPAL,
                }).render(paypalRef.current).catch((err: unknown) => { // CORRECTION: any -> unknown
                    console.error("Échec du rendu des boutons PayPal :", err);
                    onError(err);
                });
            } catch (err: unknown) { // CORRECTION: any -> unknown
                 console.error("Erreur lors de l'initialisation de PayPal :", err);
                 onError(err);
            }
        }
    }, [isSdkReady, amount, disabled, createOrder, onApprove, onError]); // Re-rendre si ces props changent

    if (!isSdkReady) {
        return <div className="w-full px-6 py-4 bg-gray-200 text-gray-500 text-lg font-bold rounded-lg text-center animate-pulse">Chargement PayPal...</div>;
    }

    // Conteneur où le bouton PayPal sera injecté
    return <div ref={paypalRef} id="paypal-button-container"></div>;
}


export default function DonationPage() {
  // --- Component State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(50); // Montant affiché, utilisé par PayPal
  const [priceId, setPriceId] = useState<string>('don_50'); // ID pour Stripe (prédéfini)
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isSdkReady, setIsSdkReady] = useState(false); // État pour le chargement du SDK PayPal

  // --- Effects ---
  useEffect(() => {
    if (frequency === 'monthly' && paymentMethod === 'paypal') {
      setPaymentMethod('stripe');
    }
  }, [frequency, paymentMethod]);

  // --- Event Handlers ---
  const handleAmountSelect = (value: number | 'custom', id: string | null = null) => {
    setError(null);
    if (value === 'custom') {
      setIsCustomAmount(true);
      setAmount(0); // L'utilisateur doit remplir
      setPriceId(''); // Pas d'ID pour les montants perso
    } else {
      setIsCustomAmount(false);
      setAmount(value); // Montant pour affichage et PayPal
      setPriceId(id!); // ID pour Stripe
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value); // Montant pour affichage et PayPal
      setPriceId(''); // Pas d'ID pour les montants perso
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
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      amount: isCustomAmount ? amount : undefined, // N'envoie le montant que s'il est personnalisé
      priceId: !isCustomAmount ? priceId : undefined, // N'envoie l'ID que s'il est prédéfini
      frequency,
    };

    try {
      // Vérifier si Stripe.js est chargé
      // CORRECTION: Ajout d'une suppression ciblée
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).Stripe) {
          throw new Error("Stripe.js n'a pas pu être chargé. Veuillez rafraîchir la page.");
      }
      // Initialiser Stripe
      // CORRECTION: Ajout d'une suppression ciblée
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripe = (window as any).Stripe(stripePublicKey);
      if (!stripe) {
          throw new Error("Impossible d'initialiser Stripe.");
      }

      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "La création de la session de paiement a échoué.");
      }
      const data = await res.json();
      // const stripe = await stripePromise; // Remplacé par l'initialisation ci-dessus
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err: unknown) { // CORRECTION: any -> unknown
      setError((err as Error).message); // CORRECTION: Typage de l'erreur
    } finally {
      setLoading(false);
    }
  };

  // --- PayPal Logic ---
  // CORRECTION: Ajout d'une suppression ciblée pour 'actions'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createPayPalOrder = (data: unknown, actions: any) => { // CORRECTION: data: any -> unknown, actions: any (conservé car SDK complexe)
    // S'assurer que le montant est valide avant de créer l'ordre
    if (amount <= 0) {
        setError("Montant PayPal non valide.");
        return;
    }
    return actions.order.create({
      purchase_units: [{
        description: "Don pour la mission Kenomi",
        amount: { value: amount.toString(), currency_code: 'EUR' },
      }],
      application_context: { brand_name: 'Kenomi', shipping_preference: 'NO_SHIPPING' },
    });
  };

  // CORRECTION: Ajout d'une suppression ciblée pour 'actions'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPayPalApprove = async (data: unknown, actions: any) => { // CORRECTION: data: any -> unknown, actions: any (conservé car SDK complexe)
    setLoading(true);
    try {
      await actions.order.capture();
      console.log("Don PayPal réussi!", data);
      // Redirection vers une page de succès générique pour PayPal
      window.location.href = '/don/success';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) { // CORRECTION: Variable 'err' inutilisée, supprimée
      setError("Une erreur est survenue lors de la finalisation du don PayPal.");
    } finally {
      setLoading(false);
    }
  };

  const onPayPalError = (err: unknown) => { // CORRECTION: any -> unknown
    console.error("Erreur PayPal :", err);
    setError("Une erreur est survenue avec PayPal. Veuillez réessayer ou utiliser une autre méthode.");
  }

  // --- Component Render ---
  return (
    // Retrait du PayPalScriptProvider
    <>
      <Script
          src="https://js.stripe.com/v3/"
          strategy="afterInteractive"
          // CORRECTION: Variable 'e' inutilisée, supprimée
          onError={() => setError("Impossible de charger le script de paiement Stripe.")}
      />
      <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&intent=capture`}
          onLoad={() => setIsSdkReady(true)}
          // CORRECTION: Variable 'e' inutilisée, supprimée
          onError={() => setError("Impossible de charger le script de paiement PayPal.")}
          strategy="afterInteractive"
      />
      <header className="w-full px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 bg-white/95 z-50">
        <Link href="/" aria-label="Retour à la Page d'accueil">
          <Image
            src="/noBgColor.png" // Utilisation du logo couleur sur fond blanc
            alt="Kenomi Logo"
            width={180}
            height={30}
            priority
          />
        </Link>
        <Link
          href="/"
          className="px-4 py-2 text-sm
                    font-semibold text-gray-700 bg-gray-200
                    rounded-full hover:bg-gray-200 transition"
        >
          Retour à l&apos;accueil
        </Link>
      </header>

      <main className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left Column - Visual & Impact */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-black  p-10 text-white text-center">
            {/* CORRECTION: Remplacement de <img> par <Image> de next/image */}
            <Image
              src="/happySeniorKenomi.png"
              alt="Personne âgée souriante utilisant une tablette grâce à l'aide de Kenomi"
              width={560}
              height={560}
              priority // AJOUT: Image importante pour le LCP
              className="w-80 h-80 object-cover mb-8  border-white/50 shadow-lg"
            />
            <h2 className="text-3xl font-bold leading-tight mb-4">Changez une vie aujourd&apos;hui.</h2>
            <p className="text-teal-100 text-lg mb-6 max-w-sm">Chaque contribution nous rapproche de notre objectif : un avenir numérique plus sûr et plus inclusif en Belgique.</p>
            {/* MODIFIÉ: Retrait des références à la RDC. */}
            <div className="space-y-4 text-left text-teal-50 text-sm">
              <div className="flex items-start"><HeartIcon /><p><span className="font-bold">25€</span> &ndash; Finance un atelier de sensibilisation à la sécurité pour un senior.</p></div>
              <div className="flex items-start"><HeartIcon /><p><span className="font-bold">50€</span> &ndash; Contribue à l&apos;achat de logiciels pour un &quot;Kit d&apos;Autonomie&quot;.</p></div>
              <div className="flex items-start"><HeartIcon /><p><span className="font-bold">150€</span> &ndash; Finance un ordinateur reconditionné pour un jeune du programme &quot;Tremplin Numérique&quot;.</p></div>
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
                 {/* MODIFIÉ: Montants alignés sur la description (25, 50, 150) */}
                <div className="grid grid-cols-2 gap-3">
                    {donationOptions.map((opt) => (
                        <button type="button" key={opt.id} onClick={() => handleAmountSelect(opt.amount, opt.id)} className={`relative text-left p-3 border-2 rounded-lg font-bold text-gray-700 transition-all ${!isCustomAmount && priceId === opt.id ? 'border-grey-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                            {opt.label}
                            {!isCustomAmount && priceId === opt.id && <div className="absolute top-2 right-2 bg-black rounded-full h-5 w-5 flex items-center justify-center"><CheckIcon/></div>}
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
                  // Remplacement de PayPalButtons par notre wrapper
                  <PayPalPaymentButton
                      isSdkReady={isSdkReady}
                      amount={amount}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={onPayPalError}
                      disabled={loading || amount <= 0}
                  />
                )}
              </div>
              <p className="text-xs text-center text-gray-500">
                🔒 Votre don peut être déductible des impôts. Un reçu fiscal vous sera envoyé.
              </p>
            </form>
          </div>
        </motion.div>
      </main>
    </>
  );
}
