'use client';

// Importations React et bibliothèques
import { useEffect, useState } from 'react'; // SUPPRIMÉ: useMemo, useRef
import { motion } from 'framer-motion';
import { Bar, Line } from 'react-chartjs-2';
import { useUser } from '@clerk/nextjs';
import { FaChartBar, FaCalendarAlt, FaTrophy, FaTable, FaDownload, FaSearch, FaEuroSign, FaHashtag, FaChartPie } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScriptableContext
} from 'chart.js';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Définition des Interfaces ---

interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string;
  created_at: string;
  frequency: 'once' | 'monthly' | null;
}

interface StatsCards {
  total: number;
  count: number;
  average: number;
}
interface ChartData {
  labels: string[];
  amountData: number[];
  countData: number[];
}
interface TopDonor {
  name: string;
  email: string;
  total: number;
}

// --- Composant Principal ---

export default function AdminDonationsPage() {
  const defaultAvatar = "/favicon.svg";
  const { user } = useUser();

  // Données de la table
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Données des stats et graphiques
  const [stats, setStats] = useState<StatsCards>({ total: 0, count: 0, average: 0 });
  const [chartData, setChartData] = useState<ChartData>({ labels: [], amountData: [], countData: [] });
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Filtres
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [minAmount, setMinAmount] = useState('');

  // Tri
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  // Modal et UI
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [darkMode, setDarkMode] = useState(true); // Mode sombre conservé et activé par défaut

  // Effet de debounce pour la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, filterStatus, filterCurrency, minAmount]);

  // --- Effet de Fetching Côté Serveur ---
  useEffect(() => {
    if (!user) return; // Attendre que l'utilisateur soit chargé

    const fetchAdminData = async () => {
      setLoading(true);
      setIsLoadingStats(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', pageSize.toString());
      params.append('sortKey', sortConfig.key);
      params.append('sortDirection', sortConfig.direction);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedMonth !== 'all') {
         const year = parseInt(selectedMonth.split('-')[0]);
         const month = parseInt(selectedMonth.split('-')[1]);
         const start = new Date(year, month - 1, 1);
         const end = new Date(year, month, 0);
         params.append('startDate', start.toISOString().split('T')[0]);
         params.append('endDate', end.toISOString().split('T')[0]);
      }
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCurrency !== 'all') params.append('currency', filterCurrency);
      if (minAmount) params.append('minAmount', minAmount);

      try {
        const res = await fetch(`/api/admin/donations?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Erreur ${res.status}`);
        }

        const data = await res.json();

        setDonations(data.paginatedData as Donation[]);
        setTotalCount(data.totalCount);
        setStats(data.stats as StatsCards);
        setChartData(data.chartData as ChartData);
        setTopDonors(data.topDonors as TopDonor[]);

      } catch (error) {
        console.error('Erreur lors de la récupération des dons:', error);
      } finally {
        setLoading(false);
        setIsLoadingStats(false);
      }
    };

    fetchAdminData();
  // Dépendances pour le re-fetching
  }, [user, currentPage, pageSize, debouncedSearch, selectedMonth, filterStatus, filterCurrency, minAmount, sortConfig]);

  // --- Données pour les graphiques (basées sur l'état) ---
  const monthlyAmountChart = {
    labels: chartData.labels,
    datasets: [{
      label: '€ Collectés',
      data: chartData.amountData,
      backgroundColor: (ctx: ScriptableContext<"bar">) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(236,72,153,0.6)');
        gradient.addColorStop(1, 'rgba(59,130,246,0.1)');
        return gradient;
      }
    }]
  };

  const monthlyCountChart = {
    labels: chartData.labels,
    datasets: [{
      label: 'Nombre de dons',
      data: chartData.countData,
      backgroundColor: (ctx: ScriptableContext<"line">) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(236,72,153,0.6)');
        gradient.addColorStop(1, 'rgba(59,130,246,0.1)');
        return gradient;
      },
      borderColor: 'rgba(236,72,153,0.8)',
      tension: 0.1
    }]
  };

  // --- Fonctions d'export (n'exportent que la page visible) ---
  function exportCSV() {
    const headers = ['Nom', 'Email', 'Montant', 'Devise', 'Statut', 'Date', 'Fréquence'];
    const rows = donations.map((d) => [
      d.name,
      d.email,
      d.amount,
      d.currency,
      d.status,
      new Date(d.created_at).toLocaleString('fr-FR'),
      d.frequency || 'once'
    ]);
    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'donations_kenomi_page_' + currentPage + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ Export CSV terminé avec succès');
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Liste des dons - Kenomi (Page ' + currentPage + ')', 14, 22);
    autoTable(doc, {
      head: [['Nom', 'Email', 'Montant', 'Devise', 'Statut', 'Date', 'Fréquence']],
      body: donations.map(d => [
        d.name,
        d.email,
        `€ ${d.amount.toFixed(2)}`,
        d.currency.toUpperCase(),
        d.status,
        new Date(d.created_at).toLocaleString('fr-FR'),
        d.frequency === 'monthly' ? 'Mensuel' : 'Unique'
      ]),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [236, 72, 153] }
    });
    doc.save('donations_kenomi_page_' + currentPage + '.pdf');
  }

  // Fonction pour changer le tri
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset page on sort
  };

  // Calcul du nombre de pages
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`flex min-h-screen flex-col ${darkMode ? 'bg-gray-950 text-white' : 'bg-[#f4f6fa] text-gray-900'}`}>
      <header className="w-full px-8 py-4 flex justify-between items-center bg-gray-950 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">
          <Link href='/' title="Retour à l’accueil">
            <Image src="/noBgWhite.png" alt="logo Kenomi" height={80} width={150} className="hover:opacity-90 transition-opacity duration-200" />
          </Link>
        </h1>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm px-4 py-2 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-400 text-white hover:opacity-90"
          >
            {darkMode ? '🌞 Light' : '🌙 Dark'}
          </motion.button>
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
              {typeof user?.publicMetadata?.role === 'string' ? user?.publicMetadata?.role : 'Super Admin'}
            </span>
          </div>
          <Image
            src={user?.imageUrl || defaultAvatar}
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
            {/* Note: La liste des mois n'affiche que les mois des données actuellement chargées. */}
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
            {/* Note: La liste des devises n'affiche que les devises des données actuellement chargées. */}
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className={`border rounded-xl shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
            >
              <option value="all">Toutes les devises</option>
              {[...new Set(donations.map(d => d.currency))].map(curr => (
                <option key={curr} value={curr}>{curr ? curr.toUpperCase() : 'N/A'}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className={`border rounded-xl shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={exportCSV}
              className="px-4 py-2 bg-gradient-to-tr from-fuchsia-500 to-orange-400 hover:opacity-90 text-white font-semibold rounded flex items-center justify-center"
            >
              <FaDownload className="inline mr-2" /> Exporter CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={exportPDF}
              className="px-4 py-2 bg-gradient-to-tr from-blue-500 to-purple-500 hover:opacity-90 text-white font-semibold rounded flex items-center justify-center"
            >
              <FaDownload className="inline mr-2" /> Exporter PDF
            </motion.button>
          </div>

          {/* Cartes de Statistiques */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-pulse">
              <div className="h-32 rounded-2xl bg-gray-800/50"></div>
              <div className="h-32 rounded-2xl bg-gray-800/50"></div>
              <div className="h-32 rounded-2xl bg-gray-800/50"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={`rounded-2xl p-6 shadow-inner border text-center items-center justify-center flex flex-col bg-cover bg-center bg-no-repeat transition-all duration-300 ease-in-out animate-fade-in animate-[bgPulse_8s_ease-in-out_infinite]
                  ${darkMode ? 'bg-[url("/cardbg.jpg")] bg-gray-900/80 border-gray-800' : 'bg-[url("/cardbg.jpg")] bg-white/90 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-lime-500/20 text-lime-500 p-2 rounded-full"><FaEuroSign /></div>
                  <p className="text-sm text-gray-400">Dons total (filtrés)</p>
                </div>
                <p className="text-2xl font-bold text-lime-400">€ {stats.total.toFixed(2)}</p>
              </div>
              <div className={`rounded-2xl p-6 shadow-inner border text-center items-center justify-center flex flex-col bg-cover bg-center bg-no-repeat transition-all duration-300 ease-in-out animate-fade-in animate-[bgPulse_8s_ease-in-out_infinite]
                  ${darkMode ? 'bg-[url("/cardbg.jpg")] bg-gray-900/80 border-gray-800' : 'bg-[url("/cardbg.jpg")] bg-white/90 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 text-blue-500 p-2 rounded-full"><FaHashtag /></div>
                  <p className="text-sm text-gray-400">Nombre de dons (filtrés)</p>
                </div>
                <p className="text-3xl font-bold text-blue-400">{stats.count}</p>
              </div>
              <div className={`rounded-2xl p-6 shadow-inner border text-center items-center justify-center flex flex-col bg-cover bg-center bg-no-repeat transition-all duration-300 ease-in-out animate-fade-in animate-[bgPulse_8s_ease-in-out_infinite]
                  ${darkMode ? 'bg-[url("/cardbg.jpg")] bg-gray-900/80 border-gray-800' : 'bg-[url("/cardbg.jpg")] bg-white/90 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-fuchsia-500/20 text-fuchsia-500 p-2 rounded-full"><FaChartPie /></div>
                  <p className="text-sm text-gray-400">Moyenne (filtrée)</p>
                </div>
                <p className="text-2xl font-bold text-fuchsia-400">{stats.average.toFixed(2)} €</p>
              </div>
            </motion.div>
          )}

          {/* Graphiques */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 animate-pulse">
              <div className="h-64 rounded-2xl bg-gray-800/50"></div>
              <div className="h-64 rounded-2xl bg-gray-800/50"></div>
              <div className="h-64 rounded-2xl bg-gray-800/50"></div>
              <div className="h-64 rounded-2xl bg-gray-800/50"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* CORRECTION: Ce bloc utilise maintenant les stats de l'état */}
              <motion.div
                id="stats"
                className={`${darkMode ? 'bg-[url("/cardbg2.jpg")] bg-gray-900/90 bg-blend-overlay backdrop-blur-sm text-white border border-gray-800' : 'bg-[url("/cardbg2.jpg")] bg-white/95 bg-blend-overlay backdrop-blur-sm text-gray-900 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 text-sm transition-all duration-300 ease-in-out`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Nombre de dons (filtrés) : <strong>{stats.count}</strong> | Montant total : <strong>{stats.total.toFixed(2)}€</strong> | Don moyen : <strong>{stats.average.toFixed(2)}€</strong>
              </motion.div>

              <motion.div
                id="monthly"
                className={`${darkMode ? 'bg-[url("/cardbg2.jpg")] bg-black/85 bg-blend-overlay backdrop-blur-sm border border-gray-800' : 'bg-[url("/cardbg2.jpg")] bg-white/95 bg-blend-overlay backdrop-blur-sm border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 transition-all duration-300 ease-in-out`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-md font-semibold tracking-tight mb-2`}>
                  <FaChartBar className="inline mr-2" /> Don par mois (filtré)</h2>
                <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
                <Bar data={monthlyAmountChart} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { stacked: true }, y: { stacked: true } }, elements: { bar: { borderRadius: 10, borderSkipped: false } } }} />
              </motion.div>

              <motion.div
                id="count"
                className={`${darkMode ? 'bg-[url("/cardbg2.jpg")]  bg-black/85  bg-blend-overlay backdrop-blur-sm border border-gray-800' : 'bg-[url("/cardbg2.jpg")] bg-white/95 bg-blend-overlay backdrop-blur-sm border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 transition-all duration-300 ease-in-out`}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} text-md font-semibold tracking-tight mb-2`}><FaTable className="inline mr-2" /> Nombre de dons par mois (filtré)</h2>
                <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
                <Line data={monthlyCountChart} />
              </motion.div>

              <motion.div
                id="top"
                className={`${darkMode ? 'bg-[url("/cardbg2.jpg")]  bg-black/85  bg-blend-overlay backdrop-blur-sm border border-gray-800' : 'bg-[url("/cardbg2.jpg")] bg-white/95 bg-blend-overlay backdrop-blur-sm border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'} rounded-2xl shadow-md p-6 transition-all duration-300 ease-in-out`}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} text-md font-semibold tracking-tight mb-2`}><FaTrophy className="inline mr-2" /> Top donateurs (filtrés)</h2>
                <hr className={`${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-4`} />
                <ul className="space-y-2">
                  {topDonors.map((donor, index) => (
                    <li key={index} className={`flex justify-between border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} pb-1`}>
                      <div className="flex items-center gap-2">
                        <Image src={`https://api.dicebear.com/7.x/initials/svg?seed=${donor.name}`} className="w-6 h-6 rounded-full transition-all duration-300 ease-in-out" alt={donor.name} width={24} height={24} />
                        <span>{donor.name}</span>
                      </div>
                      <span className="font-semibold text-lime-400">€ {donor.total.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}

          {/* Tableau */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-64 bg-gray-800 rounded-xl w-full"></div>
            </div>
          ) : (
            <div id="table" className="overflow-x-auto transition-all duration-300 ease-in-out animate-fade-in">
              <table className={`min-w-full rounded-2xl shadow-md divide-y transition-all duration-300 ease-in-out ${darkMode ? 'divide-gray-800 bg-gray-900 text-white' : 'divide-gray-200 bg-white text-gray-900'}`}>
                <thead className="sticky top-0 z-20 bg-gradient-to-r from-fuchsia-500 via-orange-400 to-yellow-400 text-white shadow-sm">
                  <tr>
                    <th onClick={() => handleSort('name')} className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[120px]">
                      Nom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('email')} className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[180px]">
                      Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('amount')} className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[100px]">
                      Montant {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[80px]">Devise</th>
                    <th className="py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[100px]">Statut</th>
                    <th onClick={() => handleSort('frequency')} className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[100px]">
                      Fréquence {sortConfig.key === 'frequency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('created_at')} className="cursor-pointer hover:underline py-3 px-6 text-left font-semibold whitespace-nowrap min-w-[140px]">
                      Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-800 bg-gray-900 text-white' : 'divide-gray-200 bg-white text-gray-900'}`}>
                  {/* CORRECTION: Itération sur 'donations' (déjà paginé) */}
                  {donations.map((don) => (
                    <tr
                      key={don.id}
                      onClick={() => setSelectedDonation(don)}
                      className={`cursor-pointer transition-transform duration-200 ease-in-out rounded-xl shadow-sm ${darkMode ? 'hover:bg-gray-800 bg-gray-900' : 'hover:bg-gray-100 bg-white'}`}
                    >
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[120px]">{don.name}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[180px]">{don.email}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[100px]">€ {don.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[80px]">{don.currency ? don.currency.toUpperCase() : 'N/A'}</td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[100px]">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${don.status === 'succeeded' || don.status === 'paid' ? 'bg-lime-100 text-lime-800' : don.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {don.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[100px]">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${don.frequency === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {don.frequency === 'monthly' ? 'Mensuel' : 'Unique'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm rounded-xl whitespace-nowrap min-w-[140px]">{new Date(don.created_at).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        Aucun don ne correspond à ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Standard */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {/* Bouton Précédent */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1 rounded border bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Précédent
                  </button>

                  {/* Indicateur de page */}
                  <span className="px-3 py-1 text-gray-400">
                    Page {currentPage} sur {totalPages}
                  </span>

                  {/* Bouton Suivant */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="px-3 py-1 rounded border bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              )}

              {/* Modale de détails */}
              {selectedDonation && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                  onClick={() => setSelectedDonation(null)}
                >
                  <div
                    className={`rounded-xl p-6 w-[90%] max-w-lg shadow-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold mb-2">Détail du don</h3>
                    <p><strong>Nom :</strong> {selectedDonation.name}</p>
                    <p><strong>Email :</strong> {selectedDonation.email}</p>
                    <p><strong>Montant :</strong> € {selectedDonation.amount}</p>
                    <p><strong>Fréquence :</strong> {selectedDonation.frequency === 'monthly' ? 'Mensuel' : 'Unique'}</p>
                    <p><strong>Devise :</strong> {selectedDonation.currency}</p>
                    <p><strong>Statut :</strong> {selectedDonation.status}</p>
                    <p><strong>Date :</strong> {new Date(selectedDonation.created_at).toLocaleString('fr-FR')}</p>
                    <p><strong>ID Transaction :</strong> {selectedDonation.stripe_session_id}</p>
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
