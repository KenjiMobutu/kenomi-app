'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
// AJOUT: Importation du type Project
import { Project } from '@/types/projet';

export default function ListeProjets() {
  // CORRECTION: Ajout du type Project[] à useState
  const [projets, setProjets] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchProjets() {
      // CORRECTION: La table est 'Project' (majuscule) et non 'projets'
      const { data, error } = await supabase.from('Project').select('*').order('created_at', { ascending: false });
      if (!error) {
        // TypeScript sait maintenant que 'data' est de type Project[]
        setProjets(data);
      } else {
        console.error("Erreur lors de la récupération des projets:", error);
      }
    }
    fetchProjets();
  }, []);

  return (
    <div className="p-6">
      {projets.map(p => (
        // TypeScript peut maintenant lire p.id, p.title, etc.
        <div key={p.id} className="border p-4 mb-2">
          <h3 className="font-bold">{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}
