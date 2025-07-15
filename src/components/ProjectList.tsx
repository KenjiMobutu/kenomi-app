'use client';

import { useEffect, useState } from 'react';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [projects, search, startDate, endDate]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects/all');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Supprimer ce projet ?');
    if (!confirm) return;

    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const handleFilter = () => {
    let result = [...projects];

    if (search) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (startDate) {
      result = result.filter((p) => new Date(p.created_at) >= new Date(startDate));
    }

    if (endDate) {
      result = result.filter((p) => new Date(p.created_at) <= new Date(endDate));
    }

    setFiltered(result);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setFiltered(projects);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <p className="text-center text-black">Chargement...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="mt-10 max-w-6xl mx-auto space-y-6 text-black">
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
          className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => window.location.href = `/projects/${p.id}`}
        >
          <td className="px-5 py-3 font-medium text-black">{p.title}</td>
          <td className="px-5 py-3">{p.description}</td>
          <td className="px-5 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
          <td className="px-5 py-3 text-right">
            <button
              onClick={(e) => {
                e.stopPropagation(); // empêche le clic de suivre le lien
                handleDelete(p.id);
              }}
              className="text-red-600 hover:text-red-800 hover:underline"
            >
              Supprimer
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
                  : 'bg-white text-black hover:bg-blue-100'
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
