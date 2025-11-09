
'use client';

// Importations React et bibliothèques
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useUser } from '@clerk/nextjs';
import {
  FaChartBar,
  FaTrophy,
  FaTable,
  FaDownload,
  FaSearch,
  FaEuroSign,
  FaHashtag,
  FaChartPie,
  FaFilter,
  FaSortAmountDown,
  FaUsers,
  FaArrowUp, // Remplace FaTrendingUp
  FaGift,
  FaBell,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
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
  ArcElement
} from 'chart.js';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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

  // État du dashboard
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeView, setActiveView] = useState('overview');

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
  const [showFilters, setShowFilters] = useState(false);

  // Tri
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  // Modal et UI
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Effet de debounce pour la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, filterStatus, filterCurrency, minAmount]);

  // --- Effet de Fetching Côté Serveur ---
  useEffect(() => {
    if (!user) return;

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
  }, [user, currentPage, pageSize, debouncedSearch, selectedMonth, filterStatus, filterCurrency, minAmount, sortConfig]);

  // --- Données pour les graphiques améliorées ---
  const monthlyAmountChart = {
    labels: chartData.labels,
    datasets: [{
      label: '€ Collectés',
      data: chartData.amountData,
      backgroundColor: 'rgba(236, 72, 153, 0.8)',
      borderColor: 'rgba(236, 72, 153, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const monthlyCountChart = {
    labels: chartData.labels,
    datasets: [{
      label: 'Nombre de dons',
      data: chartData.countData,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }]
  };

  // Nouveau graphique en donut pour les statuts
  const statusChart = {
    labels: ['Réussi', 'En attente', 'Échoué'],
    datasets: [{
      data: [
        donations.filter(d => d.status === 'paid').length,
        donations.filter(d => d.status === 'pending').length,
        donations.filter(d => d.status === 'failed').length,
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  // --- Fonctions utilitaires ---
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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Composant StatCard amélioré
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StatCard = ({ title, value, change, icon: Icon, color, bgImage }: any) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-3xl p-6 shadow-xl border backdrop-blur-sm transition-all duration-300 ${
        darkMode
          ? 'bg-gray-900/80 border-gray-700'
          : 'bg-white/90 border-gray-200'
      }`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full bg-${color}-500/20`}>
            <Icon className={`text-${color}-500 text-xl`} />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-medium ${
              change > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              <FaArrowUp className={`mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div>
          <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-white'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
            {value}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10" />
    </motion.div>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    }`}>
      {/* Header amélioré */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href='/' title="Retour à l'accueil">
              <Image
                src="/noBgWhite.png"
                alt="logo Kenomi"
                height={60}
                width={120}
                className="hover:opacity-90 transition-all duration-200"
              />
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-full transition-all ${
                  activeView === 'overview'
                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Vue d&apos;ensemble
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-4 py-2 rounded-full transition-all ${
                  activeView === 'analytics'
                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytiques
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white"
            >
              {darkMode ? '🌞' : '🌙'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white relative"
            >
              <FaBell />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white"
            >
              {isFullScreen ? <FaCompress /> : <FaExpand />}
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.username || 'Admin Kenomi'}
                </p>
                <p className="text-xs text-gray-400">
                  {typeof user?.publicMetadata?.role === 'string' ? user?.publicMetadata?.role : 'Super Admin'}
                </p>
              </div>
              <Image
                src={user?.imageUrl || defaultAvatar}
                alt="Admin"
                width={45}
                height={45}
                className="rounded-full border-2 border-orange-400 hover:border-pink-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar améliorée */}
        {!isFullScreen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className={`w-72 min-h-screen p-6 border-r transition-all duration-300 ${
              darkMode
                ? 'bg-gray-900/50 border-gray-800 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200 backdrop-blur-sm'
            }`}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                DASHBOARD
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gestion des dons
              </p>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'stats', icon: FaChartPie, label: 'Statistiques', href: '#stats' },
                { id: 'charts', icon: FaChartBar, label: 'Graphiques', href: '#charts' },
                { id: 'donors', icon: FaUsers, label: 'Donateurs', href: '#top' },
                { id: 'table', icon: FaTable, label: 'Tableau', href: '#table' },
              ].map(item => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  whileHover={{ x: 8 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    darkMode
                      ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </motion.a>
              ))}
            </nav>

            {/* Widget météo des dons */}
            <div className={`mt-8 p-4 rounded-xl ${
              darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
            }`}>
              <h3 className="font-semibold mb-2">🌟 Performance du jour</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dons aujourd&apos;hui</span>
                  <span className="font-bold text-green-500">
                    {donations.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Montant du jour</span>
                  <span className="font-bold text-blue-500">
                    €{donations
                      .filter(d => new Date(d.created_at).toDateString() === new Date().toDateString())
                      .reduce((sum, d) => sum + d.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          {/* Filtres améliorés */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium"
              >
                <FaFilter />
                Filtres {showFilters ? '▲' : '▼'}
              </motion.button>

              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-full border transition-all ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-2"
                >
                  <FaDownload /> CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportPDF}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center gap-2"
                >
                  <FaDownload /> PDF
                </motion.button>
              </div>
            </div>

            {/* Panneau de filtres */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`overflow-hidden rounded-xl p-4 mb-4 ${
                    darkMode ? 'bg-gray-800/50' : 'bg-white/80'
                  } backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
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
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="paid">✅ Réussi</option>
                      <option value="pending">⏳ En attente</option>
                      <option value="failed">❌ Échoué</option>
                    </select>

                    <select
                      value={filterCurrency}
                      onChange={(e) => setFilterCurrency(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="all">Toutes les devises</option>
                      {[...new Set(donations.map(d => d.currency))].map(curr => (
                        <option key={curr} value={curr}>{curr ? curr.toUpperCase() : 'N/A'}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Montant minimum €"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cartes de statistiques améliorées */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 rounded-3xl bg-gray-800/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard
                title="Total des dons"
                value={`${stats.total.toFixed(2)}€`}
                change={5.2}
                icon={FaEuroSign}
                color="green"
                bgImage="/cardbg.jpg"
              />
              <StatCard
                title="Nombre de dons"
                value={stats.count.toLocaleString()}
                change={-2.1}
                icon={FaHashtag}
                color="blue"
                bgImage="/cardbg.jpg"
              />
              <StatCard
                title="Don moyen"
                value={`${stats.average.toFixed(2)}€`}
                change={8.7}
                icon={FaChartPie}
                color="purple"
                bgImage="/cardbg.jpg"
              />
              <StatCard
                title="Donateurs uniques"
                value={new Set(donations.map(d => d.email)).size}
                change={12.3}
                icon={FaUsers}
                color="pink"
                bgImage="/cardbg.jpg"
              />
            </motion.div>
          )}

          {/* Graphiques améliorés */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 rounded-3xl bg-gray-800/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-3xl shadow-xl border backdrop-blur-sm ${
                  darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaChartBar className="text-pink-500 text-xl" />
                  <h3 className="text-lg font-semibold">Dons mensuels (€)</h3>
                </div>
                <div className="h-64">
                  <Bar
                    data={monthlyAmountChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: darkMode ? '#374151' : '#fff',
                          titleColor: darkMode ? '#fff' : '#000',
                          bodyColor: darkMode ? '#fff' : '#000',
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
                        },
                        y: {
                          grid: { color: darkMode ? '#374151' : '#E5E7EB' },
                          ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
                        }
                      }
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-3xl shadow-xl border backdrop-blur-sm ${
                  darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaArrowUp className="text-blue-500 text-xl" />
                  <h3 className="text-lg font-semibold">Évolution des dons</h3>
                </div>
                <div className="h-64">
                  <Line
                    data={monthlyCountChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: darkMode ? '#374151' : '#fff',
                          titleColor: darkMode ? '#fff' : '#000',
                          bodyColor: darkMode ? '#fff' : '#000',
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
                        },
                        y: {
                          grid: { color: darkMode ? '#374151' : '#E5E7EB' },
                          ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
                        }
                      }
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-3xl shadow-xl border backdrop-blur-sm ${
                  darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaChartPie className="text-orange-500 text-xl" />
                  <h3 className="text-lg font-semibold">Statuts des dons</h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={statusChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: darkMode ? '#9CA3AF' : '#6B7280',
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      }
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                id="top"
                variants={itemVariants}
                className={`p-6 rounded-3xl shadow-xl border backdrop-blur-sm ${
                  darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaTrophy className="text-yellow-500 text-xl" />
                  <h3 className="text-lg font-semibold">Top Donateurs</h3>
                </div>
                <div className="space-y-4">
                  {topDonors.slice(0, 5).map((donor, index) => (
                    <motion.div
                      key={donor.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'}`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{donor.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {donor.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-500">€{donor.total.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Tableau amélioré */}
          <motion.div
            id="table"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-xl border overflow-hidden ${
              darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/90 border-gray-200'
            }`}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaTable className="text-blue-500 text-xl" />
                  <h3 className="text-xl font-semibold">Liste des dons</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaSortAmountDown />
                  <span>Trié par {sortConfig.key} {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <p className="mt-4 text-gray-400">Chargement des données...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-500 to-orange-400 text-white">
                    <tr>
                      {[
                        { key: 'name', label: 'Nom' },
                        { key: 'email', label: 'Email' },
                        { key: 'amount', label: 'Montant' },
                        { key: 'currency', label: 'Devise' },
                        { key: 'status', label: 'Statut' },
                        { key: 'frequency', label: 'Fréquence' },
                        { key: 'created_at', label: 'Date' },
                      ].map(column => (
                        <th
                          key={column.key}
                          onClick={() => handleSort(column.key)}
                          className="cursor-pointer hover:bg-white/10 transition-colors py-4 px-6 text-left font-semibold"
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {sortConfig.key === column.key && (
                              <span className="text-xs">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {donations.map((don, index) => (
                      <motion.tr
                        key={don.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedDonation(don)}
                        className={`cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                          darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {don.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{don.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{don.email}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-500">€{don.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="uppercase text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {don.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            don.status === 'succeeded' || don.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : don.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {don.status === 'paid' ? '✅ Réussi' :
                             don.status === 'pending' ? '⏳ En attente' : '❌ Échoué'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            don.frequency === 'monthly'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {don.frequency === 'monthly' ? '🔄 Mensuel' : '1️⃣ Unique'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(don.created_at).toLocaleString('fr-FR')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {donations.length === 0 && (
                  <div className="text-center py-12">
                    <FaGift className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucun don ne correspond aux filtres sélectionnés.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination améliorée */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalCount)} sur {totalCount} résultats
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1 || loading}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-all"
                    >
                      Précédent
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages || loading}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-all"
                    >
                      Suivant
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Modal détaillée */}
      <AnimatePresence>
        {selectedDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDonation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl ${
                darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedDonation.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedDonation.name}</h3>
                  <p className="text-gray-400">{selectedDonation.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-400 mb-1">Montant</p>
                    <p className="text-2xl font-bold text-green-500">€{selectedDonation.amount.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-400 mb-1">Fréquence</p>
                    <p className="text-lg font-semibold">
                      {selectedDonation.frequency === 'monthly' ? '🔄 Mensuel' : '1️⃣ Unique'}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-2">Statut</p>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedDonation.status === 'succeeded' || selectedDonation.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : selectedDonation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDonation.status === 'paid' ? '✅ Réussi' :
                     selectedDonation.status === 'pending' ? '⏳ En attente' : '❌ Échoué'}
                  </span>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Date de création</p>
                  <p className="font-medium">
                    {new Date(selectedDonation.created_at).toLocaleString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-1">ID Transaction</p>
                  <p className="font-mono text-sm break-all">{selectedDonation.stripe_session_id}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDonation(null)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium"
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
