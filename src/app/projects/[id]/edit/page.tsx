'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
// MODIFIÉ: Ajout de 'isLoaded'
import { useUser } from '@clerk/nextjs';
import AnimatedContainer from '@/components/AnimatedContainer';

export default function EditProjectPage() {
  const { id } = useParams();
  // MODIFIÉ: Ajout de 'isLoaded' pour attendre la fin du chargement de Clerk
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonction pour récupérer les données du projet
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description);
        if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(`Erreur lors du chargement du projet: ${err.message}`);
        } else {
          setMessage('Erreur lors du chargement du projet.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Attendre que Clerk ait chargé l'état de l'utilisateur
    if (!isLoaded) {
      // Afficher l'état de chargement principal pendant que Clerk vérifie
      setLoading(true);
      return;
    }

    // L'utilisateur est chargé, vérifier son rôle
    const isAdmin = user?.publicMetadata?.role === "admin";

    if (!isAdmin) {
      // RECOMMANDATION (1.3) APPLIQUÉE: Redirection si non-admin
      setMessage('❌ Accès refusé. Redirection...');
      router.push('/dashboard');
    } else {
      // L'utilisateur est admin, charger les données du projet
      fetchProject();
    }

  // MODIFIÉ: Ajout de isLoaded, user, et router aux dépendances
  }, [id, isLoaded, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('⏳ Mise à jour...');

    // Vérification de sécurité redondante (défense en profondeur)
    const isAdmin = user?.publicMetadata?.role === "admin";
    if (!isAdmin) {
      setMessage('❌ Accès refusé : seuls les administrateurs peuvent modifier ce projet.');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setMessage('✅ Projet mis à jour avec succès.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const err = await res.json();
        setMessage('❌ ' + err.error);
      }
    } catch (err: unknown) {
      // CORRECTION: Vérification du type de l'erreur
      if (err instanceof Error) {
        setMessage(err.message || '❌ Erreur inconnue');
      } else {
        setMessage('❌ Erreur inconnue');
      }
    }
  };

  // N'affiche le chargement que si 'isLoaded' est faux (attente de Clerk)
  // ou si 'loading' est vrai (attente de fetchProject)
  if (!isLoaded || loading) return <p className="text-center mt-20">Chargement...</p>;

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <AnimatedContainer>
        <h1 className="text-2xl font-bold drop-shadow">Modifier le projet</h1>

        {message && (
          <p className={`text-sm px-4 py-2 mt-4 rounded ${message.startsWith('❌') ? 'text-red-100 bg-red-600/50' : 'text-green-100 bg-green-600/50'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 mt-6 bg-white/90 p-6 rounded shadow text-black backdrop-blur">
          <div>
            <label className="block mb-1 font-medium">Titre</label>
            <input
              title='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              title='description'
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enregistrer les modifications
          </button>
        </form>
      </AnimatedContainer>
    </main>
  );
}
