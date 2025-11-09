'use client';
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";

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
      {isAdmin && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Espace administrateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a href="/admin/donations" className="block p-6 bg-white/80 rounded-lg shadow border text-left backdrop-blur-sm hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg text-black font-semibold mb-2">🧮 Gestion des dons</h3>
                <p className="text-gray-700">Voir et administrer tous les dons reçus.</p>
              </a>
          </div>
        </div>
      )}
      </motion.div>
      <div className="mt-10">
    </div>
    </main>
  );
}
