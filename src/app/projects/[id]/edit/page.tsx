'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { useUser } from '@clerk/nextjs';
import AnimatedContainer from '@/components/AnimatedContainer';

export default function EditProjectPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description);
        if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      } catch (err: any) {
        setMessage('Erreur lors du chargement du projet.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('⏳ Mise à jour...');

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
      } else {
        const err = await res.json();
        setMessage('❌ ' + err.error);
      }
    } catch (err: any) {
      setMessage(err.message || '❌ Erreur inconnue');
    }
  };

  if (loading) return <p className="text-center">Chargement...</p>;

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <AnimatedContainer>
        <h1 className="text-2xl font-bold drop-shadow">Modifier le projet</h1>

        {message && (
          <p className="text-sm text-red-100 bg-red-600/50 px-4 py-2 mt-4 rounded">
            {JSON.stringify(message)}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 mt-6 bg-white/90 p-6 rounded shadow text-black backdrop-blur">
          <div>
            <label className="block mb-1 font-medium">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
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
