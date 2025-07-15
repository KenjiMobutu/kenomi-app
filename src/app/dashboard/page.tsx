'use client';
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import ProjectForm from '@/components/ProjectForm';
import ProjectList from '@/components/ProjectList';

export default function Dashboard() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  console.log("isAdmin :", isAdmin);
  if (!user) return <p className="text-center mt-20">Chargement...</p>;

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto bg-gradient-to-br from-green-500 to-blue-500 p-10 rounded-xl shadow-xl text-center text-white"
      >
        <div className="mb-6">
          <Image
            src={user.imageUrl}
            alt="Photo de profil"
            width={80}
            height={80}
            className="rounded-full mx-auto"
          />
          <h1 className="text-3xl font-bold mt-4 text-white drop-shadow-lg">
            Bienvenue, {user.firstName || user.username} 👋
          </h1>
          <p className="text-blue-100 mt-2">
            Voici ton tableau de bord personnel Kenomi.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-white/70 rounded-lg shadow border text-left backdrop-blur-sm">
            <h2 className="text-xl text-black font-semibold mb-2">💡 Proposer un projet</h2>
            <p className="text-gray-600">Soumets une idée qui peut changer des vies en RDC.</p>
          </div>
          <div className="p-6 bg-white/70 rounded-lg shadow border text-left backdrop-blur-sm">
            <h2 className="text-xl text-black  font-semibold mb-2">📊 Suivre un don</h2>
            <p className="text-gray-600">Accède au suivi de l’impact de tes contributions.</p>
          </div>
          <div className="p-6 bg-white/70 rounded-lg shadow border text-left backdrop-blur-sm">
            <h2 className="text-xl text-black  font-semibold mb-2">🤝 Devenir bénévole</h2>
            <p className="text-gray-600">Implique-toi dans nos actions terrain ou à distance.</p>
          </div>
          <div className="p-6 bg-white/70 rounded-lg shadow border text-left backdrop-blur-sm">
            <h2 className="text-xl text-black  font-semibold mb-2">🔒 Gérer ton profil</h2>
            <p className="text-gray-600">Modifie tes informations et préférences de compte.</p>
          </div>
        </div>
      {isAdmin && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Espace administrateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <a href="/admin/dons" className="block p-6 bg-white/80 rounded-lg shadow border text-left backdrop-blur-sm hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg text-black font-semibold mb-2">🧮 Gestion des dons</h3>
                <p className="text-gray-700">Voir et administrer tous les dons reçus.</p>
              </a>
              <a href="/admin/dons" className="block p-6 bg-white/80 rounded-lg shadow border text-left backdrop-blur-sm hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg text-black font-semibold mb-2">🧑‍🏫 Valider les projets soumis</h3>
              <p className="text-gray-700">Approuve les projets proposés par les utilisateurs.</p>
              </a>
          </div>
        </div>
      )}
      </motion.div>
      <div className="mt-10">
      <ProjectForm />
      <ProjectList />
    </div>
    </main>
  );
}
