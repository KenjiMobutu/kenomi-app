'use client';

import { useState } from 'react';

export default function ProjectForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Erreur inconnue');
    } else {
      setSuccess(true);
      setTitle('');
      setDescription('');
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-black shadow-md rounded-xl p-6 max-w-lg mx-auto space-y-4"
    >
      <h2 className="text-2xl font-bold text-black">Créer un projet</h2>

      <div className="flex flex-col">
        <label className="mb-1 font-medium text-black">Titre</label>
        <input
          type="text"
          placeholder="Titre du projet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-medium text-black">Description</label>
        <textarea
          placeholder="Description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Envoi...' : 'Ajouter'}
      </button>

      {success && <p className="text-green-600 font-medium">Projet ajouté avec succès !</p>}
      {error && <p className="text-red-600 font-medium">Erreur : {error}</p>}
    </form>
  );
}
