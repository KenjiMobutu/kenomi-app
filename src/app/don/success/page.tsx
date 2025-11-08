'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function DonSuccess() {
  return (
    <>
      {/* En-tête simplifié */}
      <header className="w-full px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 bg-white/95 z-50">
        <Link href="/" aria-label="Retour à la Page d'accueil">
          <Image
            src="/noBgColor.png" // Logo couleur
            alt="Kenomi Logo"
            width={180}
            height={30}
            priority
          />
        </Link>
      </header>

      {/* Contenu principal */}
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full"
        >
          <div className="p-8 sm:p-12 text-center">
            {/* Icône de succès animée */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
            </motion.div>

            {/* Message */}
            <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-3">
              Merci pour votre don !
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Votre générosité fait la différence.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Un e-mail de confirmation contenant votre reçu fiscal vous sera
              envoyé d&apos;ici quelques instants.
            </p>

            {/* Appel à l'action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/"
                className="group inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
              >
                Retourner à l&apos;accueil
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Pied de page de la carte */}
          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Kenomi ASBL. Tous droits réservés.
            </p>
          </div>
        </motion.div>
      </main>
    </>
  );
}
