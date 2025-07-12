'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDonsPage() {
  const { user } = useUser();
  const router = useRouter();

  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin]);

  if (!user) return <p className="text-center mt-20">Chargement...</p>;

  return (
    <main className="min-h-screen px-6 py-20 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary">🧮 Gestion des dons</h1>
        <p className="text-gray-700 mb-4">
          Cette page affichera la liste des dons reçus avec possibilité de tri, export ou analyse.
        </p>
        {/* À intégrer : tableau des dons, filtres, options de téléchargement CSV */}
        <div className="p-6 bg-gray-50 border rounded-lg shadow">
          <p className="text-gray-500 italic">Fonctionnalité à venir...</p>
        </div>
      </div>
    </main>
  );
}
