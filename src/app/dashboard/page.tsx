'use client';
import { useUser, UserButton } from "@clerk/nextjs"; // <-- AJOUT UserButton
import { motion } from "framer-motion";
import Image from "next/image";
import Link from 'next/link'; // <-- AJOUT
import { Header } from "@/components/page-client-components";
import { BarChart, Cog } from 'lucide-react'; // <-- AJOUT (npm install lucide-react)

/**
 * Affiche un spinner de chargement centré.
 */
const DashboardLoader = () => (
  <div className="flex flex-col items-center justify-center pt-32">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" role="status">
      <span className="sr-only">Chargement...</span>
    </div>
    <p className="mt-6 text-gray-600">Chargement de votre session...</p>
  </div>
);

/**
 * Carte d'action interactive pour le tableau de bord.
 */
const ActionCard = ({ href, icon: Icon, title, description, isDisabled = false }: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  isDisabled?: boolean;
}) => (
  <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
    <Link
      href={isDisabled ? "#" : href}
      className={`flex items-start p-6 bg-white/90 rounded-xl shadow-lg border border-white/30 text-left backdrop-blur-md hover:shadow-xl transition-all cursor-pointer h-full ${
        isDisabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <div className={`p-3 rounded-lg mr-4 ${isDisabled ? 'bg-gray-100' : 'bg-indigo-100'}`}>
        <Icon className={`h-6 w-6 ${isDisabled ? 'text-gray-600' : 'text-indigo-600'}`} />
      </div>
      <div>
        <h3 className="text-lg text-black font-semibold mb-1">{title}</h3>
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </Link>
  </motion.div>
);

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <main className="bg-white min-h-screen flex flex-col antialiased">
      <Header />

      {/* Le contenu principal gère le padding et l'état de chargement */}
      <div className="flex-1 py-16 md:py-24 px-6">

        {/* État de chargement amélioré */}
        {!isLoaded ? (
          <DashboardLoader />
        ) : !user ? (
          <p className="text-center text-gray-700">Utilisateur non trouvé ou session expirée.</p>
        ) : (

          // Contenu principal une fois l'utilisateur chargé
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-green-500 to-blue-500 p-8 md:p-12 rounded-2xl shadow-xl text-center text-white"
          >
            <div className="mb-8">
              <Image
                src={user.imageUrl}
                alt="Photo de profil"
                width={96} // Augmenté pour plus d'impact
                height={96} // Augmenté
                className="rounded-full mx-auto border-4 border-white/50 shadow-md"
              />
              <h1 className="text-3xl md:text-4xl font-bold mt-5 text-white drop-shadow-lg">
                Bienvenue, {user.firstName || user.username} 👋
              </h1>
              <p className="text-blue-100 text-lg mt-2">
                Voici votre tableau de bord personnel Kenomi.
              </p>
            </div>

            {/* Section Administrateur */}
            {isAdmin && (
              <div className="mt-12 text-left">
                <h2 className="text-2xl font-bold text-white mb-5">🎯 Espace administrateur</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <ActionCard
                    href="/admin/donations"
                    icon={BarChart}
                    title="🧮 Gestion des dons"
                    description="Voir et administrer tous les dons reçus."
                  />

                  <ActionCard
                    href="#"
                    icon={Cog}
                    title="Paramètres"
                    description="(À venir) Gérer les projets ou utilisateurs."
                    isDisabled={true}
                  />

                </div>
              </div>
            )}

            {/* Section Utilisateur Standard */}
            {!isAdmin && (
              <div className="mt-12 text-left">
                <h2 className="text-2xl font-bold text-white mb-5">Mon espace</h2>
                 <div className="p-8 bg-white/90 rounded-xl shadow-lg border border-white/30 backdrop-blur-md text-gray-800">
                   <h3 className="text-xl text-black font-semibold mb-3">Mes informations</h3>
                   <p className="text-gray-700 mb-4">
                     Vous pouvez gérer vos informations de profil, vos abonnements (si applicable) et vos paramètres de sécurité
                     directement via votre profil.
                   </p>
                   {/* Le composant UserButton de Clerk s'intègre ici */}
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <UserButton afterSignOutUrl="/" />
                      <div>
                        <p className="font-semibold text-black">{user.fullName}</p>
                        <p className="text-sm text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                   </div>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
