'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AjouterProjet() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // MODIFIÉ: Typage de l'événement
    e.preventDefault();
    // MODIFIÉ: 'data' (inutilisé) a été retiré
    const { error } = await supabase
      .from('projets')
      .insert([{ titre, description }]);

    if (error) {
      alert('Erreur : ' + error.message);
    } else {
      alert('Projet ajouté !');
      setTitre('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" className="block mb-2" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="block mb-2" />
      <button type="submit" className="bg-black text-white px-4 py-2">Ajouter</button>
    </form>
  );
}
