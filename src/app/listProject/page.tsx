'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ListeProjets() {
  const [projets, setProjets] = useState([]);

  useEffect(() => {
    async function fetchProjets() {
      const { data, error } = await supabase.from('projets').select('*').order('created_at', { ascending: false });
      if (!error) setProjets(data);
    }
    fetchProjets();
  }, []);

  return (
    <div className="p-6">
      {projets.map(p => (
        <div key={p.id} className="border p-4 mb-2">
          <h3 className="font-bold">{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}
