'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useUser } from '@clerk/nextjs';
import { FaChartBar, FaCalendarAlt, FaTrophy, FaTable, FaDownload, FaSearch } from 'react-icons/fa';
import Image from 'next/image';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface profil utilisateur connecté
interface UserProfile {
  full_name: string;
  role: string;
}

interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string;
  created_at: string;
}

export default function AdminDonationsPage() {
  const defaultAvatar = "/favicon.svg";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  // Ajout tri interactif
  const [sortConfig, setSortConfig] = useState<{ key: keyof Donation, direction: 'asc' | 'desc' } | null>(null);
  // Modal de détails
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  // Multi-critères filtres
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const { user } = useUser();
  useEffect(() => {
    console.log('User:', user);
    async function fetchDonations() {
      const { data: donationsData, error } = await supabase.from('admin_donations').select('*');
      if (error) console.error('Erreur Supabase :', error);
      else setDonations(donationsData as Donation[]);
      setLoading(false);
    }

    async function fetchUserProfile() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        if (profileData) setUserProfile(profileData);
      }
    }

    fetchDonations();
    fetchUserProfile();
  }, []);

  const filteredDonations = useMemo(() => {
    let filtered = donations
      .filter((don) => {
        const matchesSearch =
          don.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          don.email.toLowerCase().includes(debouncedSearch.toLowerCase());

        const date = new Date(don.created_at);
        const matchesMonth =
          selectedMonth === 'all' ||
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === selectedMonth;

        // Multi-critères avancé
        const matchesStatus =
          filterStatus === 'all' || don.status === filterStatus;
        const matchesCurrency =
          filterCurrency === 'all' || don.currency === filterCurrency;
        const matchesMinAmount =
          !minAmount || don.amount >= parseFloat(minAmount);

        return matchesSearch && matchesMonth && matchesStatus && matchesCurrency && matchesMinAmount;
      });
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? (aValue as string).localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue as string);
        }
        return sortConfig.direction === 'asc' ? +aValue - +bValue : +bValue - +aValue;
      });
    } else {
      // Default sort by date desc si pas de tri actif
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return filtered;
  }, [donations, debouncedSearch, selectedMonth, sortConfig, filterStatus, filterCurrency, minAmount]);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const avgAmount = donations.length ? (totalAmount / donations.length).toFixed(2) : '0';

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    filteredDonations.forEach(don => {
      const date = new Date(don.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + don.amount);
    });
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([key]) => new Date(`${key}-01`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })),
      datasets: [{
        label: '€ Collectés',
        data: sorted.map(([, value]) => value),
        backgroundColor: function(ctx) {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(236,72,153,0.6)');
          gradient.addColorStop(1, 'rgba(59,130,246,0.1)');
          return gradient;
        }
      }]
    };
  }, [filteredDonations]);

  const monthlyCountData = useMemo(() => {
    const map = new Map<string, number>();
    filteredDonations.forEach(don => {
      const date = new Date(don.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([key]) =>
        new Date(`${key}-01`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      ),
      datasets: [{
        label: 'Nombre de dons',
        data: sorted.map(([, value]) => value),
        backgroundColor: function(ctx) {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(236,72,153,0.6)');
          gradient.addColorStop(1, 'rgba(59,130,246,0.1)');
          return gradient;
        }
      }]
    };
  }, [filteredDonations]);

  const topDonors = useMemo(() => {
    const donorMap = new Map<string, { name: string, email: string, total: number }>();
    donations.forEach(d => {
      const key = d.email;
      if (!donorMap.has(key)) {
        donorMap.set(key, { name: d.name, email: d.email, total: 0 });
      }
      donorMap.get(key)!.total += d.amount;
    });
    return [...donorMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [donations]);

  function exportCSV() {
    const headers = ['Nom', 'Email', 'Montant', 'Devise', 'Statut', 'Date'];
    const rows = donations.map((d) => [
      d.name,
      d.email,
      d.amount,
      d.currency,
      d.status,
      d.created_at
    ]);
    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'donations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✅ Export CSV terminé avec succès');
  }

  return (
    <div className={`flex min-h-screen flex-col ${darkMode ? 'bg-gray-950 text-white' : 'bg-[#f4f6fa] text-gray-900'}`}>
      <header className="w-full px-8 py-4 flex justify-between items-center bg-gray-950 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">
          <a href='/' title="Retour à l’accueil">
            <Image src="/noBgWhite.png" alt="logo Kenomi" height={80} width={150} className="hover:opacity-90 transition-opacity duration-200" />
          </a>
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm px-4 py-2 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-400 text-white hover:opacity-90"
          >
            {darkMode ? '🌞 Light' : '🌙 Dark'}
          </button>
          {/* Notifications placeholder */}
          <button
            className="text-white text-lg"
            title="Notifications à venir"
          >
            🔔
          </button>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-white">
              {user?.username || 'Admin Kenomi'}
            </span>
            <span className="text-xs text-gray-400">
              { user?.publicMetadata?.role || 'Super Admin'}
            </span>
          </div>
          <Image
            src={avatarUrl || defaultAvatar}
            alt="Admin"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-orange-400 transition-transform duration-200 hover:scale-105"
          />
        </div>
      </header>
      <div className={`flex flex-1`}>
        <aside className={`w-64 p-6 hidden sm:block shadow-md border-r ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white text-gray-800 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-tr-3xl rounded-br-3xl'} transition-all duration-300 ease-in-out`}>
          <h2 className="text-2xl font-bold mb-8 text-gradient bg-gradient-to-r">MENU</h2>
          <nav className="space-y-4 text-sm">
            <a href="#stats" className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}><FaChartBar /> Statistiques</a>
            <a href="#monthly" className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}><FaCalendarAlt /> Dons par mois</a>
            <a href="#count" className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}><FaTable /> Nombre de dons</a>
            <a href="#top" className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}><FaTrophy /> Top donateurs</a>
            <a href="#table" className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}><FaTable /> Tableau</a>
          </nav>
        </aside>
        <main className="flex-1 p-6 sm:p-10 transition-all duration-300 ease-in-out">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
            <div className="relative w-full sm:w-1/4 min-w-[200px]">
              <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`border rounded-xl shadow-sm px-4 py-2 pl-10 w-full transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`border rounded-xl shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
            >
              <option value="all">🗓️ Tous les mois</option>
              {[...new Set(donations.map((don) => {
                const date = new Date(don.created_at);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              }))].sort().map((monthKey) => (
                <option key={monthKey} value={monthKey}>
                  {new Date(`${monthKey}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
            {/* Filtrage multi-critères */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`border rounded-xl shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
            >
              <option value="all">Tous les statuts</option>
              <option value="succeeded">✅ Réussi</option>
              <option value="pending">⏳ En attente</option>
              <option value="failed">❌ Échoué</option>
            </select>
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className={`border rounded-xl shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
            >
              <option value="all">Toutes les devises</option>
              {[...new Set(donations.map(d => d.currency))].map(curr => (
                <option key={curr} value={curr}>{curr.toUpperCase()}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className={`border rounded-xl shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
            />
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-gradient-to-tr from-fuchsia-500 to-orange-400 hover:opacity-90 text-white font-semibold rounded flex items-center justify-center"
            >
              <FaDownload className="inline mr-2" /> Exporter CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in">
            <div className={`rounded-2xl p-6 shadow-inner border transition-all duration-300 ease-in-out animate-fade-in ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
              <p className="text-sm text-gray-400 mb-1">Dons total</p>
              <p className="text-2xl font-bold text-lime-400">€ {totalAmount.toFixed(2)}</p>
            </div>
            <div className={`rounded-2xl p-6 shadow-inner border transition-all duration-300 ease-in-out animate-fade-in ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
              <p className="text-sm text-gray-400 mb-1">Nombre de dons</p>
              <p className="text-2xl font-bold text-blue-400">{donations.length}</p>
            </div>
            <div className={`rounded-2xl p-6 shadow-inner border transition-all duration-300 ease-in-out animate-fade-in ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
              <p className="text-sm text-gray-400 mb-1">Moyenne</p>
              <p className="text-2xl font-bold text-fuchsia-400">€ {avgAmount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 animate-fade-in">
            <div id="stats" className={`${darkMode
              ? 'bg-gray-900 text-white border border-gray-800'
              : 'bg-white text-gray-900 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 text-sm transition-all duration-300 ease-in-out animate-fade-in`}>
              Nombre de dons : <strong>{donations.length}</strong> | Montant total : <strong>{totalAmount.toFixed(2)}€</strong> | Don moyen : <strong>{avgAmount}€</strong>
            </div>

            <div id="monthly" className={`${darkMode
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 transition-all duration-300 ease-in-out animate-fade-in`}>
              <h2 className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} text-md font-semibold tracking-tight mb-2`}><FaChartBar className="inline mr-2" /> Don par mois</h2>
              <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
              <Bar data={monthlyData} />
            </div>

            <div id="count" className={`${darkMode
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 transition-all duration-300 ease-in-out animate-fade-in`}>
              <h2 className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} text-md font-semibold tracking-tight mb-2`}><FaTable className="inline mr-2" /> Nombre de dons par mois</h2>
              <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
              <Bar data={monthlyCountData} />
            </div>

            <div id="top" className={`${darkMode
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 transition-all duration-300 ease-in-out animate-fade-in`}>
              <h2 className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} text-md font-semibold tracking-tight mb-2`}><FaTrophy className="inline mr-2" /> Top donateurs</h2>
              <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
              <ul className="space-y-2">
                {topDonors.map((donor, index) => (
                  <li key={index} className={`flex justify-between border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} pb-1`}>
                    <div className="flex items-center gap-2">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${donor.name}`} className="w-6 h-6 rounded-full transition-all duration-300 ease-in-out" alt={donor.name} />
                      <span>{donor.name}</span>
                    </div>
                    <span className="font-semibold text-lime-400">€ {donor.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-gray-800 rounded-xl w-full"></div>
              <div className="h-64 bg-gray-800 rounded-xl w-full"></div>
              <div className="h-64 bg-gray-800 rounded-xl w-full"></div>
              <div className="h-48 bg-gray-800 rounded-xl w-full"></div>
            </div>
          ) : (
            <div id="table" className="overflow-x-auto transition-all duration-300 ease-in-out animate-fade-in">
              <table className={`min-w-full rounded-2xl shadow-md divide-y transition-all duration-300 ease-in-out ${darkMode ? 'divide-gray-800 bg-gray-900 text-white' : 'divide-gray-200 bg-white text-gray-900'}`}>
                <thead
                  className="sticky top-0 z-20 bg-gradient-to-r from-fuchsia-500 via-orange-400 to-yellow-400 text-white shadow-sm"
                >
                  <tr>
                    <th
                      onClick={() =>
                        setSortConfig(prev => ({
                          key: 'name',
                          direction: prev?.key === 'name' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))
                      }
                      className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[120px]"
                    >
                      Nom {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() =>
                        setSortConfig(prev => ({
                          key: 'email',
                          direction: prev?.key === 'email' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))
                      }
                      className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[180px]"
                    >
                      Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() =>
                        setSortConfig(prev => ({
                          key: 'amount',
                          direction: prev?.key === 'amount' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))
                      }
                      className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[100px]"
                    >
                      Montant {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[80px]">Devise</th>
                    <th className="py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[100px]">Statut</th>
                    <th
                      onClick={() =>
                        setSortConfig(prev => ({
                          key: 'created_at',
                          direction: prev?.key === 'created_at' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))
                      }
                      className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[140px]"
                    >
                      Date {sortConfig?.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-800 bg-gray-900 text-white' : 'divide-gray-200 bg-white text-gray-900'}`}>
                  {filteredDonations.map((don) => (
                    <tr
                      key={don.id}
                      onClick={() => setSelectedDonation(don)}
                      className={`cursor-pointer transition-transform duration-200 ease-in-out rounded-xl shadow-sm
                        ${darkMode ? 'hover:bg-gray-800 bg-gray-900' : 'hover:bg-gray-100 bg-white'}
                      `}
                    >
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[120px]">{don.name}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[180px]">{don.email}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[100px]">€ {don.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[80px]">{don.currency.toUpperCase()}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[100px]">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${don.status === 'succeeded'
                            ? 'bg-lime-100 text-lime-800'
                            : don.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}
                        `}>
                          {don.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[140px]">{don.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-xl">
                    <h3 className="text-lg font-bold mb-2">Détail du don</h3>
                    <p><strong>Nom :</strong> {selectedDonation.name}</p>
                    <p><strong>Email :</strong> {selectedDonation.email}</p>
                    <p><strong>Montant :</strong> € {selectedDonation.amount}</p>
                    <p><strong>Devise :</strong> {selectedDonation.currency}</p>
                    <p><strong>Statut :</strong> {selectedDonation.status}</p>
                    <p><strong>Date :</strong> {selectedDonation.created_at}</p>
                    <p><strong>Session ID :</strong> {selectedDonation.stripe_session_id}</p>
                    <button
                      onClick={() => setSelectedDonation(null)}
                      className="mt-4 bg-fuchsia-500 text-white px-4 py-2 rounded hover:bg-fuchsia-600"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


// Animation d’apparition fade-in et keyframes (à placer dans un fichier global, ex: styles/globals.css, ou dans tailwind.config.js via @layer utilities)
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .animate-fade-in {
    @apply opacity-0 translate-y-4 animate-[fadeIn_0.6s_ease-out_forwards];
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
*/
