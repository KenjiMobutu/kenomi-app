'use client';

// MODIFIÉ: Ajout de useCallback
import { useEffect, useState, useCallback } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  // Ajout d'un état pour la recherche décalée (debounced)
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // AJOUT: État pour la confirmation de suppression non bloquante
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // AJOUT: État pour le chargement de la suppression
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Effet pour décaler la recherche (debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // Délai de 300ms

    // Nettoyage du minuteur
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // CORRECTION: handleFilter est maintenant encapsulé dans useCallback
  const handleFilter = useCallback(() => {
    let result = [...projects];

    // Utilisation de debouncedSearch pour le filtrage
    if (debouncedSearch) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (startDate) {
      result = result.filter((p) => new Date(p.created_at) >= new Date(startDate));
    }

    if (endDate) {
      // Ajout d'un jour à la date de fin pour inclure toute la journée
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      result = result.filter((p) => new Date(p.created_at) < adjustedEndDate);
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [projects, debouncedSearch, startDate, endDate]); // Dépendances de useCallback

  useEffect(() => {
    handleFilter();
  // MODIFIÉ: Ajout de handleFilter comme dépendance (stable grâce à useCallback)
  }, [projects, debouncedSearch, startDate, endDate, handleFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects/all');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setProjects(data);
    } catch (err: unknown) { // MODIFIÉ: any -> unknown
      // CORRECTION: Vérification du type de l'erreur
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  // MODIFIÉ: Remplacement de window.confirm/alert par une logique non bloquante
  const handleDelete = async (id: string) => {
    // Empêche de multiples clics pendant la suppression
    if (isDeleting) return;

    // Si ce n'est pas le projet en attente de confirmation, on l'active
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      // Réinitialise la confirmation après 3 secondes
      setTimeout(() => {
        // Vérifie si c'est toujours le même ID avant de réinitialiser
        setConfirmDeleteId((currentId) => (currentId === id ? null : currentId));
      }, 3000);
      return;
    }

    // Si c'est le bon projet, on supprime
    setIsDeleting(id); // Active le loader pour cet ID
    setError(''); // Réinitialise les erreurs précédentes

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      } else {
        // Afficher une erreur non bloquante
        const errorData = await res.json();
        throw new Error(errorData.error || "La suppression a échoué.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`La suppression a échoué: ${errorMessage}`);
    } finally {
      setConfirmDeleteId(null); // Réinitialise l'état de confirmation
      setIsDeleting(null); // Désactive le loader
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    // setFiltered(projects); // Ceci est géré par le useEffect
    setCurrentPage(1);
    setError(''); // Réinitialise aussi les erreurs
  };

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading && projects.length === 0) return <p className="text-center text-black">Chargement...</p>;

  return (
    <div className="mt-10 max-w-6xl mx-auto space-y-6 text-black">

      {/* AJOUT: AFFICHE L'ERREUR (remplace alert) */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Erreur : </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.18 10 5.53 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.18l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.819 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Zone de filtres */}
      <div className="bg-white border border-gray-300 p-6 rounded-xl shadow space-y-4">
        <h3 className="text-lg font-semibold">🔍 Filtrer les projets</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Titre contient</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ex : école, santé..."
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Date début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Date fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300"
            >
              Réinitialiser
            </button>
          </div>
          <div className="flex items-end justify-end font-medium">
            📊 {filtered.length} projet(s) / {projects.length}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <div className="overflow-x-auto border rounded-lg shadow-sm">
  <table className="min-w-full text-sm text-left text-black">
    <thead className="bg-gray-100 border-b font-semibold text-gray-700">
      <tr>
        <th className="px-5 py-3">Titre</th>
        <th className="px-5 py-3">Description</th>
        <th className="px-5 py-3">Créé le</th>
        <th className="px-5 py-3 text-right">Action</th>
      </tr>
    </thead>
    <tbody>
      {paginated.map((p) => (
        <tr
          key={p.id}
          // MODIFIÉ: Ajout d'une classe d'opacité pendant la suppression
          className={`border-t hover:bg-gray-50 transition-colors cursor-pointer ${isDeleting === p.id ? 'opacity-50' : ''}`}
          onClick={() => window.location.href = `/projects/${p.id}`}
        >
          <td className="px-5 py-3 font-medium text-black">{p.title}</td>
          <td className="px-5 py-3">{p.description}</td>
          <td className="px-5 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
          <td className="px-5 py-3 text-right">
            {/* MODIFIÉ: Bouton de suppression avec confirmation non bloquante */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // empêche le clic de suivre le lien
                handleDelete(p.id);
              }}
              className={`font-semibold ${
                confirmDeleteId === p.id
                  ? 'text-yellow-600 hover:text-yellow-800' // État de confirmation
                  : 'text-red-600 hover:text-red-800' // État normal
              } hover:underline disabled:opacity-50`}
              // Désactive le flou pour que l'utilisateur puisse cliquer à nouveau
              onBlur={() => confirmDeleteId === p.id && setConfirmDeleteId(null)}
              disabled={isDeleting === p.id} // Désactive pendant la suppression
            >
              {isDeleting === p.id ? '...' : (confirmDeleteId === p.id ? 'Confirmer ?' : 'Supprimer')}
            </button>
          </td>
        </tr>
      ))}
      {paginated.length === 0 && (
        <tr>
          <td colSpan={4} className="text-center py-6 text-gray-500">
            Aucun projet trouvé.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded border ${
                page === currentPage
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-black hover:bg-blue-100' // CORRECTION: 'text-black' ajouté
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
